from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from aiortc.contrib.media import MediaRecorder
import asyncio
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Global peer connection storage (in production, use proper session management)
peer_connections = {}

class WebRTCOffer(BaseModel):
    sdp: str
    type: str
    session_id: str = "default"

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
        # Create a new peer connection (aiortc handles lower level stuff)
        pc = RTCPeerConnection()
        peer_connections[offer.session_id] = pc
        
        # Track (airortc handles lower level stuff)
        @pc.on("track")
        def on_track(track):
            logger.info(f"Received track: {track.kind}")
            if track.kind == "video":
                video_track = VideoTrack(track)
                logger.info("video_track",video_track)
        
        # Connection state change (airortc handles lower level stuff)
        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            logger.info(f"Connection state is {pc.connectionState}")
            if pc.connectionState == "failed":
                await pc.close()
                peer_connections.pop(offer.session_id, None)
        
        # Set description
        await pc.setRemoteDescription(RTCSessionDescription(
            sdp=offer.sdp,
            type=offer.type
        ))
        
        # Create answer & return it
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        
        return JSONResponse({
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
            "status": "success"
        })
        
    except Exception as e:
        logger.error(f"WebRTC connection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# get the connection status
@router.get("/status/{session_id}")
async def get_connection_status(session_id: str = "default"):
    pc = peer_connections.get(session_id)
    if not pc:
        return {"status": "not_connected"}
    
    return {
        "status": "connected" if pc.connectionState == "connected" else pc.connectionState,
        "connection_state": pc.connectionState
    }

# disconnect the connection
@router.delete("/disconnect/{session_id}")
async def disconnect_webrtc(session_id: str = "default"):
    pc = peer_connections.get(session_id)
    if pc:
        await pc.close()
        peer_connections.pop(session_id, None)
        return {"status": "disconnected"}
    
    return {"status": "not_found"}