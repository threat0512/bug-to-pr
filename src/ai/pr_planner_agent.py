import os
import json
import re
from dotenv import load_dotenv
from langchain_groq.chat_models import ChatGroq
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from pydantic_settings import BaseSettings

# Get the root directory (3 levels up from src/ai/)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Settings(BaseSettings):
    groq_api_key: str
    groq_model: str
    groq_temperature: float

    class Config:
        env_file = os.path.join(ROOT_DIR, ".env")
        extra = "ignore"

settings = Settings()

# Load environment variables from root .env file
load_dotenv(os.path.join(ROOT_DIR, ".env"))

# System-level instructions for PR planning with file contents
PR_PLANNER_SYSTEM_INSTRUCTIONS = r"""
You are a meticulous senior software engineer. Given a GitHub issue title, body, and the content of relevant files, generate a structured pull request plan:
1. A concise PR title
2. A list of commit steps
3. A list of files to modify
4. Example code snippets (in diff or fenced code) for each file

Important:
- Do NOT output any internal reasoning or chain-of-thought.
- Output ONLY valid JSON matching this schema exactly:
  {{
    "pr_title": "<string>",
    "commit_plan": ["<string>", ...],
    "files_to_modify": ["<file_path>", ...],
    "code_snippets": {{"<file_path>": "<code snippet>", ...}}
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

llm = ChatGroq(
    groq_api_key=settings.groq_api_key,
    model=settings.groq_model,
    temperature=settings.groq_temperature,
)

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
        response = (pr_planner_prompt | llm).invoke({
            "title": title, 
            "body": body, 
            "file_contents": file_contents_str
        })
        raw = response.content.strip()

        # Debug raw output
        print("--- RAW PR PLANNER RESPONSE ---")
        print(raw)

        # Remove any chain-of-thought tags and extract JSON
        raw_clean = re.sub(r"<think>[\s\S]*?</think>", "", raw)
        match = re.search(r"\{[\s\S]*\}", raw_clean)
        json_text = match.group(0) if match else raw_clean

        # Parse JSON safely
        try:
            return json.loads(json_text)
        except json.JSONDecodeError as e:
            return {
                "pr_title": "Unable to generate PR",
                "commit_plan": [],
                "files_to_modify": [],
                "code_snippets": {},
                "error": str(e),
                "raw_response": raw,
            }
    except Exception as e:
        print(f"Error in PR planning: {str(e)}")
        return {
            "pr_title": "Unable to generate PR",
            "commit_plan": [],
            "files_to_modify": [],
            "code_snippets": {},
            "error": f"PR planning failed: {str(e)}",
        } 