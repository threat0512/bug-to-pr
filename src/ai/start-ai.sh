#!/bin/bash

# Start Python AI service (assumes venv and dependencies are already set up)
cd "$(dirname "$0")"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH"
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Start the FastAPI app using uvicorn
venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001 --reload