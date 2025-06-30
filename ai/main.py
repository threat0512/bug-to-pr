from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from agent import generate_pr_plan

app = FastAPI()

class IssueRequest(BaseModel):
    title: str
    body: str

class PRResponse(BaseModel):
    pr_title: str
    commit_plan: List[str]
    files_to_modify: List[str]
    code_snippets: Dict[str, str]
    error: Optional[str] = None
    raw_response: Optional[str] = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/generate", response_model=PRResponse)
def generate(request: IssueRequest):
    try:
        print(f"Received request - Title: {request.title}, Body: {request.body[:100]}...")
        
        result = generate_pr_plan(request.title, request.body)
        
        print(f"Generated result: {result}")
        
        # Check if there was an error in generation
        if "error" in result and result["error"]:
            print(f"Error in result: {result['error']}")
            raise HTTPException(status_code=500, detail=f"PR generation failed: {result['error']}")
            
        # Ensure all required fields are present
        required_fields = ["pr_title", "commit_plan", "files_to_modify", "code_snippets"]
        for field in required_fields:
            if field not in result:
                result[field] = [] if field in ["commit_plan", "files_to_modify"] else {} if field == "code_snippets" else ""
        
        print(f"Final result to return: {result}")
        return PRResponse(**result)
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")