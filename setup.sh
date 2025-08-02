#!/bin/bash

echo "🚀 Setting up MediAI WebSocket & WebRTC Integration"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "readme.md" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📋 Checking prerequisites..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "env" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv env
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source env/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔑 Creating .env file..."
    cat > .env << EOF
# OpenAI API Key for Whisper transcription
OPENAI_API_KEY=your_openai_api_key_here

# Backend configuration
HOST=0.0.0.0
PORT=8000
EOF
    echo "⚠️  Please update the OPENAI_API_KEY in backend/.env with your actual API key"
fi

# Test backend
echo "🧪 Testing backend..."
sleep 3
python test_websocket.py &
TEST_PID=$!
sleep 10
kill $TEST_PID 2>/dev/null

echo "✅ Backend setup completed"

# Setup Frontend
echo ""
echo "🔧 Setting up Frontend..."
cd ../frontend

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup completed"

# Start services
echo ""
echo "🚀 Starting services..."
echo ""

# Start backend in background
echo "🔧 Starting backend server..."
cd ../backend
source env/bin/activate
python main.py &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend connection
echo "🧪 Testing backend connection..."
if curl -s http://localhost:8000/test > /dev/null; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend in background
echo "🔧 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Test frontend connection
echo "🧪 Testing frontend connection..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📱 Access your application:"
echo "   • Main app: http://localhost:3000"
echo "   • Stream page: http://localhost:3000/stream"
echo "   • Test page: http://localhost:3000/test"
echo ""
echo "🔧 Backend API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "⚠️  Important:"
echo "   • Make sure to set your OpenAI API key in backend/.env"
echo "   • Allow camera and microphone permissions in your browser"
echo ""
echo "🛑 To stop services, press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"

# Wait for user to stop
wait 