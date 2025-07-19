from pydantic import BaseModel
from typing import Optional, Dict, List

class IssueRequest(BaseModel):
    title: str
    body: str

class FileTreeItem(BaseModel):
    path: str
    type: str
    sha: str

class FileSelectionRequest(BaseModel):
    title: str
    body: str
    file_tree: List[FileTreeItem]

class FileSelectionResponse(BaseModel):
    relevant_files: List[str]
    error: Optional[str] = None

class GenerateWithFilesRequest(BaseModel):
    title: str
    body: str
    file_contents: Dict[str, str]

class PRResponse(BaseModel):
    pr_title: str
    commit_plan: List[str]
    files_to_modify: List[str]
    code_snippets: Dict[str, str]
    error: Optional[str] = None
    raw_response: Optional[str] = None 