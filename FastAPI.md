# FastAPI Backend Setup Guide

## 🚀 Quick Start

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
# If you have uv installed (recommended)
uv sync

# Or if you have pip
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a `.env` file in the backend directory:
```bash
# backend/.env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start the Server
```bash
python main.py
```

The server will start at: **http://localhost:8000**

## 📋 What's Included

### API Endpoints
- **GET /** - Welcome message
- **GET /test** - Simple test endpoint
- **POST /api/openai/chat/completions** - OpenAI chat completion

### CORS Configuration
The backend is configured to accept requests from:
- http://localhost:3000 (Frontend)
- http://127.0.0.1:3000 (Frontend alternative)

## 🔧 Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**2. Missing dependencies**
```bash
# Install with uv
uv sync

# Or with pip
pip install fastapi uvicorn python-dotenv openai
```

**3. Environment variables not loading**
- Make sure `.env` file is in the `backend/` directory
- Check that `python-dotenv` is installed

### Testing the API

**Test with curl:**
```bash
# Test basic endpoint
curl http://localhost:8000/

# Test the test endpoint
curl http://localhost:8000/test

# Test CORS (should return 200 OK)
curl -X OPTIONS http://localhost:8000/ \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"
```

## 📁 Project Structure

```
backend/
├── main.py              # Main FastAPI app
├── api/
│   ├── routes/
│   │   └── openai.py   # OpenAI API routes
│   └── types/
│       └── openai_types.py
├── config/
│   └── config.py
├── pyproject.toml       # Dependencies
└── .env                 # Environment variables
```

## 🌐 Frontend Integration

The backend is configured to work with the Next.js frontend running on `http://localhost:3000`.

**Test the connection:**
- Visit: http://localhost:3000/testing
- Visit: http://localhost:3000/test-connection

## 🚀 Production Notes

For production deployment:
1. Change CORS origins to your actual domain
2. Use environment variables for all sensitive data
3. Consider using a process manager like PM2
4. Set up proper logging and monitoring

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Test endpoints with curl before trying from frontend 