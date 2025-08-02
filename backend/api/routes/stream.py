from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from aiortc.contrib.media import MediaRecorder
import asyncio
import json
import logging
import base64
import io
from typing import Dict, List
import websockets
import openai
import os
from dotenv import load_dotenv
from config.settings import OPENAI_API_KEY

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter()

# Global peer connection storage (in production, use proper session management)
peer_connections = {}

# Connection Manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected for session {session_id}")
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "message": f"Connected to session {session_id}",
            "session_id": session_id,
            "timestamp": asyncio.get_event_loop().time()
        }, session_id)

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WebSocket disconnected for session {session_id}")

    async def send_personal_message(self, message: dict, session_id: str):
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to session {session_id}: {e}")
                # Remove broken connection
                self.disconnect(session_id)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        disconnected_sessions = []
        for session_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to session {session_id}: {e}")
                disconnected_sessions.append(session_id)
        
        # Clean up broken connections
        for session_id in disconnected_sessions:
            self.disconnect(session_id)

    def get_connection_count(self) -> int:
        return len(self.active_connections)

    def get_active_sessions(self) -> List[str]:
        return list(self.active_connections.keys())

# Initialize connection manager
manager = ConnectionManager()

# Initialize OpenAI client
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

class WebRTCOffer(BaseModel):
    sdp: str
    type: str
    session_id: str = "default"

class WebSocketMessage(BaseModel):
    type: str  # "audio", "video", "transcription_request", "ping", "chat"
    data: str = ""  # base64 encoded data
    session_id: str = "default"
    timestamp: float = 0.0
    message: str = ""  # For chat messages

class VideoTrack(MediaStreamTrack):
    kind = "video"
    
    def __init__(self, track):
        super().__init__()
        self.track = track
        
    async def recv(self):
        frame = await self.track.recv()
        # Here you can process the video frame
        # For now, we just pass it through
        logger.info(f"Received video frame: {frame.width}x{frame.height}")
        return frame

class AudioTrack(MediaStreamTrack):
    kind = "audio"
    
    def __init__(self, track):
        super().__init__()
        self.track = track
        
    async def recv(self):
        frame = await self.track.recv()
        # Process audio frame for transcription
        logger.info(f"Received audio frame: {len(frame.planes[0])} bytes")
        return frame

# WebRTC Connection Timeline:
# 1. Frontend creates offer (what it wants to send)
# 2. Frontend sends offer to this /connect endpoint via HTTP POST
# 3. Backend processes offer and creates answer (what it can receive)
# 4. Backend sends answer back to frontend via HTTP response
# 5. Frontend applies answer to complete WebRTC handshake
# 6. P2P connection established - video streaming begins
# 7. Video frames flow directly: Frontend Camera → WebRTC → Backend on_track()

@router.post("/connect")
async def connect_webrtc(offer: WebRTCOffer):
    try:
        logger.info(f"Received WebRTC offer for session {offer.session_id}")
        
        # Create a new peer connection with proper configuration
        pc = RTCPeerConnection()
        peer_connections[offer.session_id] = pc
        
        # Set up event handlers
        @pc.on("track")
        def on_track(track):
            logger.info(f"Received track: {track.kind} for session {offer.session_id}")
            if track.kind == "video":
                video_track = VideoTrack(track)
                logger.info(f"Video track created for session {offer.session_id}")
            elif track.kind == "audio":
                audio_track = AudioTrack(track)
                logger.info(f"Audio track created for session {offer.session_id}")
        
        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.info(f"Connection state changed to {pc.connectionState} for session {offer.session_id}")
            if pc.connectionState == "failed":
                logger.error(f"WebRTC connection failed for session {offer.session_id}")
                await pc.close()
                peer_connections.pop(offer.session_id, None)
            elif pc.connectionState == "connected":
                logger.info(f"WebRTC connection established for session {offer.session_id}")
                # Notify WebSocket clients about WebRTC connection
                await manager.broadcast({
                    "type": "webrtc_connected",
                    "session_id": offer.session_id,
                    "timestamp": asyncio.get_event_loop().time()
                })
            elif pc.connectionState == "closed":
                logger.info(f"WebRTC connection closed for session {offer.session_id}")
                peer_connections.pop(offer.session_id, None)
                # Notify WebSocket clients about WebRTC disconnection
                await manager.broadcast({
                    "type": "webrtc_disconnected",
                    "session_id": offer.session_id,
                    "timestamp": asyncio.get_event_loop().time()
                })
        
        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            logger.info(f"ICE connection state: {pc.iceConnectionState} for session {offer.session_id}")
        
        @pc.on("icegatheringstatechange")
        async def on_icegatheringstatechange():
            logger.info(f"ICE gathering state: {pc.iceGatheringState} for session {offer.session_id}")
        
        # Set the remote description (the offer from the client)
        logger.info(f"Setting remote description for session {offer.session_id}")
        await pc.setRemoteDescription(RTCSessionDescription(
            sdp=offer.sdp,
            type=offer.type
        ))
        
        # Create and set the local description (the answer)
        logger.info(f"Creating answer for session {offer.session_id}")
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        
        logger.info(f"WebRTC connection setup completed for session {offer.session_id}")
        
        return JSONResponse({
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
            "status": "success",
            "session_id": offer.session_id
        })
        
    except Exception as e:
        logger.error(f"WebRTC connection error for session {offer.session_id}: {e}")
        # Clean up on error
        if offer.session_id in peer_connections:
            pc = peer_connections[offer.session_id]
            await pc.close()
            peer_connections.pop(offer.session_id, None)
        raise HTTPException(status_code=500, detail=f"WebRTC connection failed: {str(e)}")

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str = "default"):
    await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Process different message types
            if message.get("type") == "audio":
                # Handle audio data for transcription
                await process_audio_data(message, session_id)
            elif message.get("type") == "video":
                # Handle video data for analysis
                await process_video_data(message, session_id)
            elif message.get("type") == "transcription_request":
                # Handle transcription request
                await handle_transcription_request(message, session_id)
            elif message.get("type") == "ping":
                # Handle ping/pong for connection health
                await manager.send_personal_message({
                    "type": "pong",
                    "session_id": session_id,
                    "timestamp": asyncio.get_event_loop().time()
                }, session_id)
            elif message.get("type") == "chat":
                # Handle chat messages
                await handle_chat_message(message, session_id)
            elif message.get("type") == "test":
                # Handle test messages
                await manager.send_personal_message({
                    "type": "test_response",
                    "message": "Test message received",
                    "session_id": session_id,
                    "timestamp": asyncio.get_event_loop().time()
                }, session_id)
            else:
                logger.warning(f"Unknown message type: {message.get('type')}")
                # Send acknowledgment for unknown message types
                await manager.send_personal_message({
                    "type": "unknown_message",
                    "message": f"Unknown message type: {message.get('type')}",
                    "session_id": session_id,
                    "timestamp": asyncio.get_event_loop().time()
                }, session_id)
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
    finally:
        # Clean up connection
        manager.disconnect(session_id)
        logger.info(f"WebSocket cleanup completed for session {session_id}")

async def process_audio_data(message: dict, session_id: str):
    """Process audio data and send for transcription"""
    try:
        audio_data = base64.b64decode(message.get("data", ""))
        
        # Here you would typically:
        # 1. Buffer the audio data
        # 2. Send to Whisper API when you have enough data
        # 3. Return transcription results
        
        logger.info(f"Received audio data: {len(audio_data)} bytes for session {session_id}")
        
        # For now, just acknowledge receipt
        await manager.send_personal_message({
            "type": "audio_received",
            "session_id": session_id,
            "timestamp": asyncio.get_event_loop().time()
        }, session_id)
        
    except Exception as e:
        logger.error(f"Error processing audio data: {e}")
        await manager.send_personal_message({
            "type": "error",
            "message": f"Error processing audio data: {str(e)}",
            "session_id": session_id,
            "timestamp": asyncio.get_event_loop().time()
        }, session_id)

async def process_video_data(message: dict, session_id: str):
    """Process video data for analysis"""
    try:
        video_data = base64.b64decode(message.get("data", ""))
        
        logger.info(f"Received video data: {len(video_data)} bytes for session {session_id}")
        
        # Here you would typically:
        # 1. Process video frames
        # 2. Send to GPT-4V for analysis
        # 3. Return analysis results
        
        await manager.send_personal_message({
            "type": "video_received",
            "session_id": session_id,
            "timestamp": asyncio.get_event_loop().time()
        }, session_id)
        
    except Exception as e:
        logger.error(f"Error processing video data: {e}")
        await manager.send_personal_message({
            "type": "error",
            "message": f"Error processing video data: {str(e)}",
            "session_id": session_id,
            "timestamp": asyncio.get_event_loop().time()
        }, session_id)

async def handle_transcription_request(message: dict, session_id: str):
    """Handle transcription request using OpenAI Whisper"""
    try:
        audio_data = base64.b64decode(message.get("data", ""))
        
        # Create a temporary file for the audio data
        with io.BytesIO(audio_data) as audio_file:
            # Send to OpenAI Whisper API
            transcript = openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
            
            # Send transcription result back
            await manager.send_personal_message({
                "type": "transcription_result",
                "session_id": session_id,
                "transcript": transcript,
                "timestamp": asyncio.get_event_loop().time()
            }, session_id)
            
    except Exception as e:
        logger.error(f"Error in transcription: {e}")
        await manager.send_personal_message({
            "type": "transcription_error",
            "session_id": session_id,
            "error": str(e),
            "timestamp": asyncio.get_event_loop().time()
        }, session_id)

async def handle_chat_message(message: dict, session_id: str):
    """Handle chat messages and broadcast to all connected clients"""
    try:
        chat_message = message.get("message", "")
        logger.info(f"Chat message from session {session_id}: {chat_message}")
        
        # Broadcast chat message to all connected clients
        await manager.broadcast({
            "type": "chat_message",
            "session_id": session_id,
            "message": chat_message,
            "timestamp": asyncio.get_event_loop().time()
        })
        
    except Exception as e:
        logger.error(f"Error handling chat message: {e}")

# get the connection status
@router.get("/status/{session_id}")
async def get_connection_status(session_id: str = "default"):
    pc = peer_connections.get(session_id)
    ws_connected = session_id in manager.active_connections
    
    if not pc and not ws_connected:
        return {"status": "not_connected"}
    
    return {
        "status": "connected" if pc and pc.connectionState == "connected" else pc.connectionState if pc else "websocket_only",
        "connection_state": pc.connectionState if pc else "websocket_only",
        "websocket_connected": ws_connected,
        "active_sessions": manager.get_active_sessions(),
        "total_connections": manager.get_connection_count()
    }

# disconnect the connection
@router.delete("/disconnect/{session_id}")
async def disconnect_webrtc(session_id: str = "default"):
    pc = peer_connections.get(session_id)
    
    if pc:
        await pc.close()
        peer_connections.pop(session_id, None)
    
    # Disconnect WebSocket if connected
    if session_id in manager.active_connections:
        websocket = manager.active_connections[session_id]
        await websocket.close()
        manager.disconnect(session_id)
        
    return {"status": "disconnected"}

# Add a simple HTML test page for WebSocket testing
@router.get("/test-page")
async def get_test_page():
    html = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>WebSocket Test</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .container { max-width: 800px; margin: 0 auto; }
                .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
                .connected { background-color: #d4edda; color: #155724; }
                .disconnected { background-color: #f8d7da; color: #721c24; }
                .messages { height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
                input, button { margin: 5px; padding: 5px; }
                .controls { margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>WebSocket Test Page</h1>
                
                <div id="status" class="status disconnected">
                    Disconnected
                </div>
                
                <div class="controls">
                    <input type="text" id="sessionId" value="test-session" placeholder="Session ID">
                    <button onclick="connect()">Connect</button>
                    <button onclick="disconnect()">Disconnect</button>
                    <button onclick="sendTest()">Send Test</button>
                    <button onclick="sendPing()">Send Ping</button>
                </div>
                
                <div class="controls">
                    <input type="text" id="messageText" placeholder="Chat message">
                    <button onclick="sendChat()">Send Chat</button>
                </div>
                
                <div id="messages" class="messages"></div>
            </div>
            
            <script>
                let ws = null;
                let sessionId = 'test-session';
                
                function updateStatus(connected) {
                    const status = document.getElementById('status');
                    if (connected) {
                        status.textContent = 'Connected';
                        status.className = 'status connected';
                    } else {
                        status.textContent = 'Disconnected';
                        status.className = 'status disconnected';
                    }
                }
                
                function addMessage(message) {
                    const messages = document.getElementById('messages');
                    const messageDiv = document.createElement('div');
                    messageDiv.textContent = new Date().toLocaleTimeString() + ': ' + message;
                    messages.appendChild(messageDiv);
                    messages.scrollTop = messages.scrollHeight;
                }
                
                function connect() {
                    sessionId = document.getElementById('sessionId').value || 'test-session';
                    ws = new WebSocket(`ws://localhost:8000/api/stream/ws/${sessionId}`);
                    
                    ws.onopen = function(event) {
                        updateStatus(true);
                        addMessage('Connected to WebSocket');
                    };
                    
                    ws.onmessage = function(event) {
                        try {
                            const message = JSON.parse(event.data);
                            addMessage('Received: ' + JSON.stringify(message, null, 2));
                        } catch (e) {
                            addMessage('Received: ' + event.data);
                        }
                    };
                    
                    ws.onerror = function(event) {
                        addMessage('WebSocket error: ' + event);
                        updateStatus(false);
                    };
                    
                    ws.onclose = function(event) {
                        addMessage('WebSocket closed: ' + event.code + ' - ' + event.reason);
                        updateStatus(false);
                    };
                }
                
                function disconnect() {
                    if (ws) {
                        ws.close();
                        ws = null;
                    }
                }
                
                function sendTest() {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        const message = {
                            type: 'test',
                            data: 'Test message',
                            session_id: sessionId,
                            timestamp: Date.now()
                        };
                        ws.send(JSON.stringify(message));
                        addMessage('Sent test message');
                    }
                }
                
                function sendPing() {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        const message = {
                            type: 'ping',
                            session_id: sessionId,
                            timestamp: Date.now()
                        };
                        ws.send(JSON.stringify(message));
                        addMessage('Sent ping');
                    }
                }
                
                function sendChat() {
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        const messageText = document.getElementById('messageText').value;
                        if (messageText.trim()) {
                            const message = {
                                type: 'chat',
                                message: messageText,
                                session_id: sessionId,
                                timestamp: Date.now()
                            };
                            ws.send(JSON.stringify(message));
                            addMessage('Sent chat: ' + messageText);
                            document.getElementById('messageText').value = '';
                        }
                    }
                }
            </script>
        </body>
    </html>
    """
    return HTMLResponse(html)