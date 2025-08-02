import asyncio
import json
import base64
import logging
from typing import Optional, Callable, Dict, Any
import websockets
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class OpenAIRealtimeClient:
    """WebSocket client for OpenAI Realtime API"""
    
    def __init__(self, session_id: str, on_transcript: Optional[Callable] = None):
        self.session_id = session_id
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview")
        self.ws_url = "wss://api.openai.com/v1/realtime?model=" + self.model
        self.websocket = None
        self.on_transcript = on_transcript
        self.is_connected = False
        
    async def connect(self):
        """Establish WebSocket connection to OpenAI Realtime API"""
        try:
            # Use the correct header format for websockets library
            additional_headers = {
                "Authorization": f"Bearer {self.api_key}",
                "OpenAI-Beta": "realtime=v1"
            }
            
            self.websocket = await websockets.connect(
                self.ws_url,
                additional_headers=additional_headers
            )
            self.is_connected = True
            logger.info(f"Connected to OpenAI Realtime API for session {self.session_id}")
            
            # Start listening for messages
            asyncio.create_task(self._listen())
            
            # Configure session
            await self._configure_session()
            
        except Exception as e:
            logger.error(f"Failed to connect to OpenAI Realtime API: {e}")
            import traceback
            logger.error(traceback.format_exc())
            raise
            
    async def _configure_session(self):
        """Configure the session with desired settings"""
        config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": "You are a helpful AI assistant. Respond naturally to the user's speech. Always respond with audio.",
                "voice": "alloy",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 500
                },
                "temperature": 0.8,
                "max_response_output_tokens": 4096
            }
        }
        
        await self.send_event(config)
        logger.info("Session configuration sent")
        
    async def send_event(self, event: Dict[str, Any]):
        """Send an event to the OpenAI Realtime API"""
        if self.websocket:
            await self.websocket.send(json.dumps(event))
            
    async def send_audio(self, audio_data: bytes):
        """Send audio data to OpenAI"""
        # Track audio data sent
        if not hasattr(self, '_audio_bytes_sent'):
            self._audio_bytes_sent = 0
            self._audio_chunks_sent = 0
        
        self._audio_bytes_sent += len(audio_data)
        self._audio_chunks_sent += 1
        
        logger.info(f"🎵 Sending audio chunk {self._audio_chunks_sent}: {len(audio_data)} bytes (total: {self._audio_bytes_sent} bytes)")
        
        # Convert PCM16 audio to base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        logger.debug(f"🔄 Converted to base64: {len(audio_base64)} chars")
        
        event = {
            "type": "input_audio_buffer.append",
            "audio": audio_base64
        }
        await self.send_event(event)
        logger.debug(f"✅ Audio event sent to OpenAI")
        
    async def _listen(self):
        """Listen for messages from OpenAI Realtime API"""
        try:
            while self.is_connected and self.websocket:
                message = await self.websocket.recv()
                event = json.loads(message)
                await self._handle_event(event)
                
        except websockets.exceptions.ConnectionClosed:
            logger.info("WebSocket connection closed")
            self.is_connected = False
        except Exception as e:
            logger.error(f"Error in WebSocket listener: {e}")
            self.is_connected = False
            
    async def _handle_event(self, event: Dict[str, Any]):
        """Handle events from OpenAI Realtime API"""
        event_type = event.get("type")
        
        logger.debug(f"🤖 Received OpenAI event: {event_type}")
        
        if event_type == "session.created":
            session_info = event.get('session', {})
            logger.info(f"✅ OpenAI session created: {session_info.get('id')}")
            
        elif event_type == "session.updated":
            logger.info("✅ OpenAI session updated successfully")
            
        elif event_type == "input_audio_buffer.speech_started":
            logger.info("🗣️ Speech started detected by OpenAI")
            
        elif event_type == "input_audio_buffer.speech_stopped":
            logger.info("🤐 Speech stopped detected by OpenAI")
            
        elif event_type == "conversation.item.input_audio_transcription.completed":
            # User's speech transcribed
            transcript = event.get("transcript", "")
            logger.info(f"📝 User transcription completed: '{transcript}'")
            if transcript and self.on_transcript:
                await self.on_transcript(self.session_id, "user", transcript)
                logger.info(f"✅ User transcript saved: {transcript}")
            else:
                logger.warning("⚠️ Empty user transcript received")
                
        elif event_type == "response.audio_transcript.delta":
            # Assistant's response transcript (streaming)
            delta = event.get("delta", "")
            if delta:
                logger.debug(f"📝 Assistant transcript delta: '{delta}'")
                
        elif event_type == "response.audio_transcript.done":
            # Assistant's complete response transcript
            transcript = event.get("transcript", "")
            logger.info(f"📝 Assistant transcription completed: '{transcript}'")
            if transcript and self.on_transcript:
                await self.on_transcript(self.session_id, "assistant", transcript)
                logger.info(f"✅ Assistant transcript saved: {transcript}")
            else:
                logger.warning("⚠️ Empty assistant transcript received")
                
        elif event_type == "response.audio.delta":
            # Audio response chunk - we'll handle this later for playback
            audio_data = event.get("delta", "")
            if audio_data:
                logger.debug(f"🔊 Received audio delta: {len(audio_data)} chars")
            
        elif event_type == "error":
            error = event.get("error", {})
            logger.error(f"❌ OpenAI API error: {error}")
            
        else:
            logger.debug(f"❓ Unhandled OpenAI event type: {event_type}")
            
    async def disconnect(self):
        """Close the WebSocket connection"""
        self.is_connected = False
        if self.websocket:
            await self.websocket.close()
            logger.info(f"Disconnected from OpenAI Realtime API for session {self.session_id}")