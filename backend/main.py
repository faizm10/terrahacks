from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import openai, stream, realtime
import uvicorn
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("🚀 Starting TerraHacks Backend API with comprehensive logging")

app = FastAPI(title="TerraHacks Backend API")

# Add CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

app.include_router(openai.router, prefix="/api/openai", tags=["OpenAI"])
app.include_router(stream.router, prefix="/api/stream", tags=["Streaming"])
app.include_router(realtime.router, prefix="/api/realtime", tags=["Realtime"])

@app.get("/")
def read_root():
    return {"message": "Welcome to TerraHacks Backend API"}

@app.get("/test")
def test_endpoint():
    return {
        "status": "success",
        "message": "Backend is working correctly!",
        "timestamp": "2024-01-01T00:00:00Z"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
