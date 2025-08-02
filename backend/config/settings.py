import os
from dotenv import load_dotenv

load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# WebSocket Configuration
WS_PING_INTERVAL = 20
WS_PING_TIMEOUT = 20

# Audio/Video Processing
AUDIO_CHUNK_SIZE = 1024
VIDEO_FRAME_RATE = 30 