from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
import logging
import json
import asyncio
import sys
import os

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from services.conversation_store import conversation_store

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/{session_id}")
async def websocket_transcript_stream(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for streaming transcripts to frontend"""
    await websocket.accept()
    
    # Subscribe to transcript updates
    queue = conversation_store.subscribe(session_id)
    
    try:
        logger.info(f"WebSocket connected for transcript streaming: {session_id}")
        
        # Send existing transcripts if any
        conversation = conversation_store.get_conversation(session_id)
        if conversation and conversation.get("transcripts"):
            for transcript in conversation["transcripts"]:
                await websocket.send_json({
                    "type": "transcript",
                    "data": transcript
                })
        
        # Stream new transcripts as they arrive
        while True:
            try:
                # Wait for new transcript with timeout
                transcript = await asyncio.wait_for(queue.get(), timeout=30.0)
                
                await websocket.send_json({
                    "type": "transcript",
                    "data": transcript
                })
                
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await websocket.send_json({"type": "ping"})
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Unsubscribe from updates
        conversation_store.unsubscribe(session_id, queue)



@router.get("/session/{session_id}")
async def get_session_info(session_id: str):
    """Get information about a conversation session"""
    
    conversation = conversation_store.get_conversation(session_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return JSONResponse(content={
        "session_id": session_id,
        "start_time": conversation["start_time"],
        "end_time": conversation.get("end_time"),
        "is_active": conversation.get("is_active", False),
        "transcript_count": len(conversation.get("transcripts", [])),
        "duration_seconds": conversation.get("duration_seconds")
    })