#!/bin/bash

echo "🚀 Starting Bug to PR Services..."

# Load environment variables from root .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env"
else
    echo "⚠️  No .env file found. Using default values."
fi

# Set default values if not set
export AI_SERVICE_URL=${AI_SERVICE_URL:-"http://localhost:8000"}
export BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
export FRONTEND_URL=${FRONTEND_URL:-"http://localhost:3000"}
export AI_SERVICE_HOST=${AI_SERVICE_HOST:-"0.0.0.0"}
export AI_SERVICE_PORT=${AI_SERVICE_PORT:-"8000"}

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check ports
echo "Checking ports..."
check_port 8000 || exit 1  # Python AI service
check_port 3001 || exit 1  # NestJS backend
check_port 3000 || exit 1  # Next.js frontend

# Start Python AI service
echo "🐍 Starting Python AI service on port $AI_SERVICE_PORT..."
cd src/ai

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed or not in PATH"
    exit 1
fi

# Remove existing virtual environment if it's corrupted
if [ -d "venv" ]; then
    echo "Removing existing virtual environment..."
    rm -rf venv
fi

# Create fresh virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
python -m pip install -r requirements.txt

# Check if GROQ_API_KEY is set
if [ -z "$GROQ_API_KEY" ]; then
    echo "⚠️  Warning: GROQ_API_KEY environment variable is not set"
    echo "   Please set it in your .env file:"
    echo "   GROQ_API_KEY=your_api_key_here"
fi

# Start AI service in background
echo "Starting AI service..."
cd venv/bin
HOST=$AI_SERVICE_HOST PORT=$AI_SERVICE_PORT ./uvicorn ../../main:app --host $AI_SERVICE_HOST --port $AI_SERVICE_PORT --reload &
AI_PID=$!
cd ../../..

# Wait a moment for AI service to start
sleep 3

# Start NestJS backend
echo "🟢 Starting NestJS backend on port 3001..."
cd src/backend
npm install
AI_SERVICE_URL=$AI_SERVICE_URL GITHUB_TOKEN=$GITHUB_TOKEN npm run start:dev &
BACKEND_PID=$!
cd ../..

# Wait a moment for backend to start
sleep 3

# Start Next.js frontend
echo "⚛️  Starting Next.js frontend on port 3000..."
cd src/frontend
npm install
BACKEND_URL=$BACKEND_URL npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "🎉 All services started!"
echo "   AI Service:     $AI_SERVICE_URL"
echo "   Backend API:    $BACKEND_URL"
echo "   Frontend:       $FRONTEND_URL"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $AI_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for all processes
wait 