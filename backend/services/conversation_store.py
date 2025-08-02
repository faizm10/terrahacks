import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import uuid4
import asyncio

logger = logging.getLogger(__name__)


class ConversationStore:
    """In-memory storage for conversation transcripts"""
    
    def __init__(self):
        self.conversations: Dict[str, Dict[str, Any]] = {}
        self.subscribers: Dict[str, List[asyncio.Queue]] = {}
        
    def create_session(self, session_id: str) -> None:
        """Initialize a new conversation session"""
        if session_id not in self.conversations:
            self.conversations[session_id] = {
                "session_id": session_id,
                "start_time": datetime.now().isoformat(),
                "end_time": None,
                "transcripts": [],
                "is_active": True
            }
            self.subscribers[session_id] = []
            logger.info(f"Created new conversation session: {session_id}")
            
    async def add_transcript(self, session_id: str, role: str, content: str) -> None:
        """Add a transcript entry to the conversation"""
        logger.info(f"📋 Adding transcript for session {session_id}: [{role.upper()}] {content}")
        
        if session_id not in self.conversations:
            logger.info(f"📋 Session {session_id} not found, creating new session")
            self.create_session(session_id)
            
        transcript_entry = {
            "id": str(uuid4()),
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id
        }
        
        self.conversations[session_id]["transcripts"].append(transcript_entry)
        transcript_count = len(self.conversations[session_id]["transcripts"])
        
        # Log to console for debugging
        logger.info(f"✅ Transcript saved (#{transcript_count}): [{role.upper()}] {content}")
        
        # Notify all subscribers
        await self._notify_subscribers(session_id, transcript_entry)
        logger.debug(f"📡 Notified subscribers for session {session_id}")
        
    async def _notify_subscribers(self, session_id: str, transcript: Dict[str, Any]) -> None:
        """Notify all WebSocket subscribers of new transcript"""
        if session_id in self.subscribers:
            subscriber_count = len(self.subscribers[session_id])
            logger.debug(f"📡 Notifying {subscriber_count} subscribers for session {session_id}")
            for i, queue in enumerate(self.subscribers[session_id]):
                try:
                    await queue.put(transcript)
                    logger.debug(f"📡 Notified subscriber {i+1}/{subscriber_count}")
                except asyncio.QueueFull:
                    logger.warning(f"⚠️ Subscriber queue full for session {session_id}, subscriber {i+1}")
        else:
            logger.warning(f"⚠️ No subscribers found for session {session_id}")
                    
    def subscribe(self, session_id: str) -> asyncio.Queue:
        """Subscribe to transcript updates for a session"""
        if session_id not in self.subscribers:
            self.subscribers[session_id] = []
            
        queue = asyncio.Queue(maxsize=100)
        self.subscribers[session_id].append(queue)
        return queue
        
    def unsubscribe(self, session_id: str, queue: asyncio.Queue) -> None:
        """Unsubscribe from transcript updates"""
        if session_id in self.subscribers and queue in self.subscribers[session_id]:
            self.subscribers[session_id].remove(queue)
            
    def end_session(self, session_id: str) -> None:
        """Mark a conversation session as ended"""
        if session_id in self.conversations:
            self.conversations[session_id]["end_time"] = datetime.now().isoformat()
            self.conversations[session_id]["is_active"] = False
            
            # Calculate duration
            start = datetime.fromisoformat(self.conversations[session_id]["start_time"])
            end = datetime.fromisoformat(self.conversations[session_id]["end_time"])
            duration = (end - start).total_seconds()
            self.conversations[session_id]["duration_seconds"] = duration
            
            logger.info(f"Ended conversation session: {session_id} (duration: {duration}s)")
            
    def get_conversation(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get a complete conversation by session ID"""
        return self.conversations.get(session_id)
    
    def store_analysis(self, session_id: str, analysis_result: Dict[str, Any]) -> None:
        """Store analysis results for a session"""
        if session_id in self.conversations:
            self.conversations[session_id]["analysis"] = analysis_result
            logger.info(f"Analysis stored for session: {session_id}")
    
    def get_analysis(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get analysis results for a session"""
        conversation = self.conversations.get(session_id)
        if conversation:
            return conversation.get("analysis")
        return None
        
            


# Global instance
conversation_store = ConversationStore()