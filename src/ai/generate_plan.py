from fastapi import APIRouter, HTTPException
from schemas.issue import IssueRequest, PRResponse, FileSelectionRequest, FileSelectionResponse, GenerateWithFilesRequest
from agent import generate_pr_plan
from file_selector_agent import select_relevant_files
from pr_planner_agent import generate_pr_plan_with_files

router = APIRouter()

@router.post("/generate", response_model=PRResponse)
def generate(request: IssueRequest):
    try:
        print(
            f"Received request - Title: {request.title}, Body: {request.body[:100]}..."
        )

        result = generate_pr_plan(request.title, request.body)

        print(f"Generated result: {result}")

        # Check if there was an error in generation
        if "error" in result and result["error"]:
            print(f"Error in result: {result['error']}")
            raise HTTPException(
                status_code=500, detail=f"PR generation failed: {result['error']}"
            )

        # Ensure all required fields are present
        required_fields = [
            "pr_title",
            "commit_plan",
            "files_to_modify",
            "code_snippets",
        ]
        for field in required_fields:
            if field not in result:
                result[field] = (
                    []
                    if field in ["commit_plan", "files_to_modify"]
                    else {}
                    if field == "code_snippets"
                    else ""
                )

        print(f"Final result to return: {result}")
        return PRResponse(**result)
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/select-files", response_model=FileSelectionResponse)
def select_files(request: FileSelectionRequest):
    try:
        print(
            f"Received file selection request - Title: {request.title}, Body: {request.body[:100]}..."
        )

        # Convert FileTreeItem to the format expected by select_relevant_files
        file_tree = [{"path": item.path, "type": item.type, "sha": item.sha} for item in request.file_tree]
        
        result = select_relevant_files(request.title, request.body, file_tree)

        print(f"File selection result: {result}")

        # Check if there was an error in selection
        if result.get("error"):
            print(f"Error in file selection: {result['error']}")
            raise HTTPException(
                status_code=500, detail=f"File selection failed: {result['error']}"
            )

        return FileSelectionResponse(**result)
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/generate-with-files", response_model=PRResponse)
def generate_with_files(request: GenerateWithFilesRequest):
    try:
        print(
            f"Received file-based generation request - Title: {request.title}, Body: {request.body[:100]}..."
        )

        result = generate_pr_plan_with_files(request.title, request.body, request.file_contents)

        print(f"Generated file-based result: {result}")

        # Check if there was an error in generation
        if "error" in result and result["error"]:
            print(f"Error in result: {result['error']}")
            raise HTTPException(
                status_code=500, detail=f"PR generation failed: {result['error']}"
            )

        # Ensure all required fields are present
        required_fields = [
            "pr_title",
            "commit_plan",
            "files_to_modify",
            "code_snippets",
        ]
        for field in required_fields:
            if field not in result:
                result[field] = (
                    []
                    if field in ["commit_plan", "files_to_modify"]
                    else {}
                    if field == "code_snippets"
                    else ""
                )

        print(f"Final file-based result to return: {result}")
        return PRResponse(**result)
    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") 