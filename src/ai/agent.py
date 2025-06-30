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

# Load environment variables
load_dotenv()
# System-level instructions with escaped curly braces for literal JSON schema
SYSTEM_INSTRUCTIONS = r"""
You are a meticulous senior software engineer. Given a GitHub issue title and body, generate a structured pull request plan:
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
    "files_to_modify": ["<string>", ...],
    "code_snippets": {{"<file_path>": "<code snippet>", ...}}
  }}
"""

# Build chat-based prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate.from_template(SYSTEM_INSTRUCTIONS),
        HumanMessagePromptTemplate.from_template(
            """
Issue Title:
{title}

Issue Body:
{body}

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
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model="deepseek-r1-distill-llama-70b",
    temperature=0.3,
)


def generate_pr_plan(title: str, body: str) -> dict:
    """
    Generate a PR plan with code snippets from a GitHub issue.
    """
    response = (prompt | llm).invoke({"title": title, "body": body})
    raw = response.content.strip()

    # Debug raw output
    print("--- RAW LLM RESPONSE ---")
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
