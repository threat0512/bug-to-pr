from fastapi import FastAPI
import os
from generate_plan import router as generate_router

app = FastAPI()

app.include_router(generate_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
