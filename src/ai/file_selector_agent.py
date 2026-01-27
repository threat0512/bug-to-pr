import os
import json
import re
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.prompts.chat import SystemMessagePromptTemplate, HumanMessagePromptTemplate
from providers.factory import generate_with_fallback

# Get the root directory (3 levels up from src/ai/)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables from root .env file
load_dotenv(os.path.join(ROOT_DIR, ".env"))

# System instructions for file selection
FILE_SELECTOR_SYSTEM_INSTRUCTIONS = r"""
You are an expert code analyzer. Given a GitHub issue and a repository's file tree, identify the most relevant files that need to be modified to address the issue.

Your task is to:
1. Analyze the issue title and description
2. Review the file tree structure
3. Select files that are most likely to need changes
4. Consider file types, naming patterns, and typical locations for different types of changes

Important:
- Do NOT output any internal reasoning or chain-of-thought.
- Output ONLY valid JSON matching this schema exactly:
  {{
    "relevant_files": ["<file_path>", ...]
  }}

Guidelines for file selection:
- For bug fixes: focus on the specific files mentioned or related to the bug
- For new features: look for relevant modules, components, or configuration files
- For UI changes: prioritize frontend files, templates, and styling
- For API changes: focus on backend routes, controllers, and models
- For configuration changes: look for config files, environment files, and documentation
- Limit to 5-8 most relevant files to avoid overwhelming the PR planner
- Prioritize files with clear relevance to the issue
"""

# Build chat-based prompt template for file selection
file_selector_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate.from_template(FILE_SELECTOR_SYSTEM_INSTRUCTIONS),
        HumanMessagePromptTemplate.from_template(
            """
Issue Title:
{title}

Issue Body:
{body}

Repository File Tree (showing most relevant files):
{file_tree}

Please respond with ONLY the JSON object containing:
- relevant_files (list of file paths that need to be modified)
"""
        ),
    ]
)

# LLM provider is now handled by the factory

def filter_relevant_files(file_tree: list, title: str, body: str) -> list:
    """
    Pre-filter files based on keywords and patterns to reduce token usage.
    """
    # Extract keywords from title and body
    keywords = []
    title_lower = title.lower()
    body_lower = body.lower()
    
    # Common keywords that indicate file types
    if any(word in title_lower or word in body_lower for word in ['auth', 'login', 'user', 'authentication']):
        keywords.extend(['auth', 'login', 'user', 'authentication', 'register', 'signin'])
    
    if any(word in title_lower or word in body_lower for word in ['api', 'endpoint', 'route', 'controller']):
        keywords.extend(['api', 'route', 'controller', 'endpoint', 'service'])
    
    if any(word in title_lower or word in body_lower for word in ['ui', 'frontend', 'component', 'react', 'vue']):
        keywords.extend(['component', 'react', 'vue', 'jsx', 'tsx', 'css', 'scss'])
    
    if any(word in title_lower or word in body_lower for word in ['config', 'setting', 'env']):
        keywords.extend(['config', 'setting', 'env', '.env', 'package.json'])
    
    # Filter files based on keywords and file extensions
    relevant_extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rb', '.php', '.cs', '.json', '.yaml', '.yml', '.md', '.txt']
    
    filtered_files = []
    for item in file_tree:
        if isinstance(item, dict):
            path = item.get('path', '').lower()
            file_type = item.get('type', 'file')
            
            # Skip directories and non-code files
            if file_type != 'file':
                continue
                
            # Check if file has relevant extension
            has_relevant_extension = any(path.endswith(ext) for ext in relevant_extensions)
            
            # Check if file path contains keywords
            contains_keywords = any(keyword in path for keyword in keywords) if keywords else True
            
            if has_relevant_extension and contains_keywords:
                filtered_files.append(item)
    
    # Limit to first 200 files to avoid token limits
    return filtered_files[:200]

def select_relevant_files(title: str, body: str, file_tree: list) -> dict:
    """
    Select relevant files from the repository based on the issue.
    """
    # Pre-filter files to reduce token usage
    filtered_tree = filter_relevant_files(file_tree, title, body)
    
    # Format file tree for the prompt
    formatted_tree = []
    for item in filtered_tree:
        if isinstance(item, dict):
            path = item.get('path', '')
            file_type = item.get('type', 'file')
            formatted_tree.append(f"{'📁' if file_type == 'dir' else '📄'} {path}")
        else:
            formatted_tree.append(str(item))
    
    file_tree_str = "\n".join(formatted_tree)
    
    try:
        # Format the prompt using the template
        formatted_prompt = file_selector_prompt.format_messages(
            title=title, 
            body=body, 
            file_tree=file_tree_str
        )
        
        # Convert to single string prompt for provider
        prompt_text = ""
        for message in formatted_prompt:
            if hasattr(message, 'content'):
                prompt_text += message.content + "\n\n"
            else:
                prompt_text += str(message) + "\n\n"
        
        # Generate using provider abstraction
        raw = generate_with_fallback(prompt_text.strip())

        # Debug raw output
        print("--- RAW FILE SELECTOR RESPONSE ---")
        print(raw)

        # Remove any chain-of-thought tags and extract JSON
        raw_clean = re.sub(r"<think>[\s\S]*?</think>", "", raw)
        match = re.search(r"\{[\s\S]*\}", raw_clean)
        json_text = match.group(0) if match else raw_clean

        # Parse JSON safely
        try:
            result = json.loads(json_text)
            return {
                "relevant_files": result.get("relevant_files", [])[:10],  # Limit to 10 files
                "error": None
            }
        except json.JSONDecodeError as e:
            return {
                "relevant_files": [],
                "error": f"Failed to parse file selection response: {str(e)}",
                "raw_response": raw,
            }
    except Exception as e:
        print(f"Error in file selection: {str(e)}")
        return {
            "relevant_files": [],
            "error": f"File selection failed: {str(e)}",
        } 