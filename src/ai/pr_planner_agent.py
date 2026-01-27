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

# System-level instructions for PR planning with file contents
PR_PLANNER_SYSTEM_INSTRUCTIONS = r"""
You are a meticulous senior software engineer. Given a GitHub issue title, body, and the content of relevant files, generate a structured pull request plan:
1. A concise PR title
2. A list of commit steps
3. A list of files to modify
4. Example code snippets (in diff or fenced code) for each file

CRITICAL JSON REQUIREMENTS:
- Output ONLY valid JSON - no explanations, no markdown, no code blocks
- Start with {{ and end with }}
- Keep code snippets SHORT (max 10-15 lines each)
- Use double quotes for all strings
- Escape quotes inside strings with backslashes
- If response is getting long, prioritize completing the JSON structure

JSON Schema (REQUIRED):
{{
  "pr_title": "<concise title>",
  "commit_plan": ["<step 1>", "<step 2>", "<step 3>"],
  "files_to_modify": ["<file1>", "<file2>"],
  "code_snippets": {{"<file1>": "<SHORT code snippet>", "<file2>": "<SHORT code snippet>"}}
}}

Guidelines:
- Analyze the existing code structure and patterns
- Provide realistic code changes that fit the current codebase
- Include proper imports, error handling, and follow existing conventions
- Make sure code snippets are complete and functional
- Consider the context of the files provided
- Keep code snippets concise but complete
"""

# Build chat-based prompt template for PR planning
pr_planner_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate.from_template(PR_PLANNER_SYSTEM_INSTRUCTIONS),
        HumanMessagePromptTemplate.from_template(
            """
Issue Title:
{title}

Issue Body:
{body}

Relevant Files and Their Contents:
{file_contents}

Please respond with ONLY the JSON object containing keys:
- pr_title (string)
- commit_plan (list of strings)
- files_to_modify (list of strings)
- code_snippets (object mapping file paths to code snippets)
"""
        ),
    ]
)

# LLM provider is now handled by the factory

def _fix_json_issues(json_text: str) -> str:
    """
    Attempt to fix common JSON formatting issues from LLM responses
    """
    # Remove any markdown code blocks
    json_text = re.sub(r'```json\s*', '', json_text)
    json_text = re.sub(r'```\s*$', '', json_text)
    
    # Remove or replace control characters that break JSON parsing
    json_text = _clean_control_characters(json_text)
    
    # Fix common quote issues
    # Replace smart quotes with regular quotes
    json_text = json_text.replace('"', '"').replace('"', '"')
    json_text = json_text.replace(''', "'").replace(''', "'")
    
    # Handle truncated JSON - look for incomplete strings at the end
    json_text = _fix_truncated_json(json_text)
    
    # Try to fix unterminated strings by adding missing quotes at common break points
    lines = json_text.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # Count quotes in the line
        quote_count = line.count('"')
        
        # If odd number of quotes and this isn't the last line, might need fixing
        if quote_count % 2 == 1 and i < len(lines) - 1:
            # Check if line ends with an unmatched quote scenario
            if line.rstrip().endswith(',') or line.rstrip().endswith(':'):
                # This line might be missing a closing quote
                # Try to add it before the comma/colon
                line = re.sub(r'([^"])([,:])$', r'\1"\2', line.rstrip())
        
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

def _clean_control_characters(text: str) -> str:
    """
    Remove or replace problematic control characters that break JSON parsing
    """
    # Remove common control characters that cause JSON parsing issues
    # Keep only printable characters, spaces, tabs, and newlines
    import string
    
    # Define allowed characters: printable + whitespace
    allowed_chars = string.printable
    
    # Clean the text character by character
    cleaned = ""
    for char in text:
        if char in allowed_chars:
            # Handle specific problematic characters
            if char == '\t':
                # Replace tabs with spaces in JSON strings
                cleaned += ' '
            elif char == '\r':
                # Remove carriage returns, keep only newlines
                continue
            elif ord(char) < 32 and char not in ['\n', '\t']:
                # Replace other control characters with spaces
                cleaned += ' '
            else:
                cleaned += char
        else:
            # Replace non-printable characters with space
            cleaned += ' '
    
    # Clean up multiple spaces
    cleaned = re.sub(r' +', ' ', cleaned)
    
    # Remove trailing spaces from each line
    lines = cleaned.split('\n')
    cleaned_lines = [line.rstrip() for line in lines]
    
    return '\n'.join(cleaned_lines)

def _fix_truncated_json(json_text: str) -> str:
    """
    Fix JSON that was truncated mid-string or has incomplete structures
    """
    # Look for the last occurrence of an opening quote without a closing quote
    lines = json_text.split('\n')
    
    # Work backwards to find incomplete strings
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i]
        
        # Count quotes in this line
        quote_count = line.count('"')
        
        # If odd number of quotes, this line has an unterminated string
        if quote_count % 2 == 1:
            # Find the last quote and see if we can close the string
            last_quote_pos = line.rfind('"')
            
            # If the line doesn't end properly, truncate and close it
            if last_quote_pos != -1:
                # Keep everything up to just before the last quote
                line_before_quote = line[:last_quote_pos]
                
                # If this looks like it's in the middle of a value, close it properly
                if ':' in line_before_quote or line_before_quote.strip().endswith(','):
                    # Close the string and add proper JSON structure
                    lines[i] = line_before_quote + '"'
                    
                    # Remove any lines after this one (they're likely incomplete)
                    lines = lines[:i+1]
                    
                    # Try to close the JSON object properly
                    if not lines[-1].strip().endswith('}'):
                        # Add closing braces as needed
                        brace_count = json_text.count('{') - json_text.count('}')
                        for _ in range(brace_count):
                            lines.append('}')
                    
                    break
    
    return '\n'.join(lines)

def _fix_truncated_json(json_text: str) -> str:
    """
    Fix JSON that was truncated mid-string
    """
    # Look for the last occurrence of an opening quote without a closing quote
    lines = json_text.split('\n')
    
    # Work backwards to find incomplete strings
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i]
        
        # Count quotes in this line
        quote_count = line.count('"')
        
        # If odd number of quotes, this line has an unterminated string
        if quote_count % 2 == 1:
            # Find the last quote and see if we can close the string
            last_quote_pos = line.rfind('"')
            
            # If the line doesn't end properly, truncate and close it
            if last_quote_pos != -1:
                # Keep everything up to just before the last quote
                line_before_quote = line[:last_quote_pos]
                
                # If this looks like it's in the middle of a value, close it properly
                if ':' in line_before_quote or line_before_quote.strip().endswith(','):
                    # Close the string and add proper JSON structure
                    lines[i] = line_before_quote + '"'
                    
                    # Remove any lines after this one (they're likely incomplete)
                    lines = lines[:i+1]
                    
                    # Try to close the JSON object properly
                    if not lines[-1].strip().endswith('}'):
                        # Add closing braces as needed
                        brace_count = json_text.count('{') - json_text.count('}')
                        for _ in range(brace_count):
                            lines.append('}')
                    
                    break
    
    return '\n'.join(lines)

def limit_file_content(content: str, max_length: int = 3000) -> str:
    """
    Limit file content to avoid token limits while preserving important parts.
    """
    if len(content) <= max_length:
        return content
    
    # Try to keep the beginning and end of the file
    half_length = max_length // 2
    return content[:half_length] + "\n// ... (content truncated) ...\n" + content[-half_length:]

def generate_pr_plan_with_files(title: str, body: str, file_contents: dict) -> dict:
    """
    Generate a PR plan with code snippets from a GitHub issue and file contents.
    """
    # Limit file contents to avoid token limits
    limited_contents = {}
    for file_path, content in file_contents.items():
        limited_contents[file_path] = limit_file_content(content)
    
    # Format file contents for the prompt
    formatted_files = []
    for file_path, content in limited_contents.items():
        formatted_files.append(f"File: {file_path}\n```\n{content}\n```\n")
    
    file_contents_str = "\n".join(formatted_files)
    
    try:
        # Format the prompt using the template
        formatted_prompt = pr_planner_prompt.format_messages(
            title=title, 
            body=body, 
            file_contents=file_contents_str
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
        print("--- RAW PR PLANNER RESPONSE ---")
        print(raw)

        # Remove any chain-of-thought tags and extract JSON
        raw_clean = re.sub(r"<think>[\s\S]*?</think>", "", raw)
        match = re.search(r"\{[\s\S]*\}", raw_clean)
        json_text = match.group(0) if match else raw_clean

        # Parse JSON safely with multiple attempts and retry logic
        max_attempts = 4
        for attempt in range(max_attempts):
            try:
                return json.loads(json_text)
            except json.JSONDecodeError as e:
                print(f"⚠️  JSON parsing failed (attempt {attempt + 1}/{max_attempts}): {str(e)}")
                
                if attempt == 0:
                    print(f"📄 Attempting to fix JSON...")
                    # Try to fix common JSON issues
                    json_text = _fix_json_issues(json_text)
                elif attempt == 1:
                    print(f"📄 Attempting aggressive JSON cleaning...")
                    # More aggressive cleaning for control characters and formatting
                    json_text = _aggressive_json_clean(json_text)
                elif attempt == 2:
                    print(f"📄 Attempting JSON reconstruction...")
                    # Try to reconstruct valid JSON from what we have
                    json_text = _reconstruct_json(json_text)
                else:
                    print(f"❌ All JSON fix attempts failed: {str(e)}")
                    print(f"📄 Raw JSON text: {json_text[:500]}...")
                    
                    # Check if this is a retry-worthy error
                    if "control character" in str(e).lower() or "invalid" in str(e).lower():
                        # Return a special response indicating retry is recommended
                        return {
                            "pr_title": "Analysis Incomplete - Retry Recommended",
                            "commit_plan": ["The AI response contained formatting errors", "Please try regenerating for a clean result"],
                            "files_to_modify": ["[Please regenerate for proper file list]"],
                            "code_snippets": {"error": "# JSON parsing failed due to control characters\n# Click 'Regenerate' to try again"},
                            "warning": "JSON parsing failed due to formatting issues",
                            "error_type": "json_control_characters",
                            "should_retry": True,
                            "raw_response": raw,
                        }
                    else:
                        # Return a standard fallback response
                        return {
                            "pr_title": "Generated PR Plan",
                            "commit_plan": ["Review and implement the changes described in the issue"],
                            "files_to_modify": ["README.md"],
                            "code_snippets": {"README.md": "# Please review the raw response for detailed implementation"},
                            "warning": "JSON parsing failed, showing simplified response",
                            "raw_response": raw,
                        }
    except Exception as e:
        print(f"Error in PR planning: {str(e)}")
        return {
            "pr_title": "Unable to generate PR",
            "commit_plan": ["An error occurred during generation"],
            "files_to_modify": ["README.md"],
            "code_snippets": {"README.md": "# Error occurred during generation"},
            "error": str(e),
            "should_retry": True,
        }

def _aggressive_json_clean(json_text: str) -> str:
    """
    More aggressive JSON cleaning for stubborn control character issues
    """
    # Start with basic control character cleaning
    json_text = _clean_control_characters(json_text)
    
    # Remove any remaining problematic characters using regex
    # Remove control characters except newlines and spaces
    json_text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ' ', json_text)
    
    # Handle specific problematic patterns from the error
    # Remove any incomplete function calls or code snippets
    json_text = re.sub(r'[a-zA-Z_][a-zA-Z0-9_]*\([^)]*$', '', json_text)
    
    # Remove any incomplete string literals at the end
    json_text = re.sub(r'[^"]*$', '', json_text)
    
    # Fix common JSON structure issues
    # Ensure proper quote escaping in strings
    lines = json_text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # If line contains a colon (likely a key-value pair)
        if ':' in line and not line.strip().startswith('//'):
            # Split on first colon to separate key and value
            parts = line.split(':', 1)
            if len(parts) == 2:
                key_part = parts[0].strip()
                value_part = parts[1].strip()
                
                # Ensure key is properly quoted
                if not (key_part.startswith('"') and key_part.endswith('"')):
                    # Extract the key name and quote it
                    key_name = key_part.strip().strip('"\'')
                    key_part = f'"{key_name}"'
                
                # Clean value part of problematic characters
                value_part = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ' ', value_part)
                
                # Remove any incomplete code snippets
                value_part = re.sub(r'[a-zA-Z_][a-zA-Z0-9_]*\([^)]*$', '', value_part)
                
                line = f"{key_part}: {value_part}"
        
        cleaned_lines.append(line)
    
    result = '\n'.join(cleaned_lines)
    
    # Final cleanup: ensure no double spaces
    result = re.sub(r' +', ' ', result)
    
    # Try to complete any incomplete JSON structures
    result = _fix_truncated_json(result)
    
    return result

def _reconstruct_json(json_text: str) -> str:
    """
    Attempt to reconstruct valid JSON from severely damaged text
    """
    print(f"🔧 Reconstructing JSON from damaged text...")
    
    # Extract what we can from the damaged JSON
    lines = json_text.split('\n')
    reconstructed_lines = []
    
    # Look for the start of the JSON object
    start_found = False
    for line in lines:
        if '{' in line and not start_found:
            start_found = True
            reconstructed_lines.append('{')
            continue
        
        if start_found:
            # Try to extract valid key-value pairs
            if ':' in line and '"' in line:
                # Look for a complete key-value pair
                colon_pos = line.find(':')
                if colon_pos > 0:
                    key_part = line[:colon_pos].strip()
                    value_part = line[colon_pos + 1:].strip()
                    
                    # Ensure key is properly quoted
                    if not (key_part.startswith('"') and key_part.endswith('"')):
                        key_name = key_part.strip().strip('"\'')
                        key_part = f'"{key_name}"'
                    
                    # Clean and truncate value if it's too long or damaged
                    if value_part.startswith('"'):
                        # Find the end of the string
                        end_quote = value_part.find('"', 1)
                        if end_quote > 0:
                            value_part = value_part[:end_quote + 1]
                        else:
                            # Truncate at a reasonable length and close
                            value_part = value_part[:100] + '"'
                    else:
                        # Not a string, try to extract what we can
                        value_part = value_part[:100]
                    
                    reconstructed_lines.append(f'  {key_part}: {value_part},')
            
            # Look for array items
            elif line.strip().startswith('"') and line.strip().endswith(','):
                reconstructed_lines.append(f'    {line.strip()}')
    
    # Close the JSON structure
    if reconstructed_lines:
        # Remove trailing comma from last item
        if reconstructed_lines[-1].endswith(','):
            reconstructed_lines[-1] = reconstructed_lines[-1][:-1]
        
        # Add closing brace
        reconstructed_lines.append('}')
        
        result = '\n'.join(reconstructed_lines)
        print(f"🔧 Reconstructed JSON: {result[:200]}...")
        return result
    
    # If reconstruction failed, return a minimal valid JSON
    print(f"🔧 Reconstruction failed, returning minimal JSON")
    return '{"pr_title": "Analysis Incomplete", "commit_plan": ["Please regenerate"], "files_to_modify": [], "code_snippets": {}}' 