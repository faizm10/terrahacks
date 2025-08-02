from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
import logging
import sys
import os
import aiohttp
import openai
from datetime import datetime
import json

# Add parent directory to path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from services.conversation_store import conversation_store
from api.types.medical_types import FinishConversationResponse

logger = logging.getLogger(__name__)

router = APIRouter()

# Store session information
sessions = {}

class SessionRequest(BaseModel):
    session_id: str = "default"

class SDPOffer(BaseModel):
    sdp: str
    session_id: str = "default"

@router.post("/session")
async def create_session(request: SessionRequest):
    """Create an ephemeral key session for OpenAI Realtime API"""
    try:
        session_id = request.session_id if request else "default"
        logger.info(f"🔑 Creating ephemeral session for: {session_id}")
        
        # Get OpenAI API key from environment
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Create ephemeral key request
        ephemeral_request = {
            "model": "gpt-4o-realtime-preview",
            "modalities": ["text", "audio"],
            "instructions": "You are a helpful AI assistant. Respond naturally to the user's speech. Always respond with audio.",
            "voice": "alloy",
            "input_audio_format": "pcm16",
            "output_audio_format": "pcm16",
            "input_audio_transcription": {
                "model": "whisper-1",
                "language": "en"
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
        
        # Call OpenAI to create ephemeral session
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.openai.com/v1/realtime/sessions",
                headers={
                    "Authorization": f"Bearer {openai_api_key}",
                    "Content-Type": "application/json"
                },
                json=ephemeral_request
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"❌ OpenAI session creation failed: {response.status} - {error_text}")
                    raise HTTPException(status_code=response.status, detail=f"OpenAI API error: {error_text}")
                
                session_data = await response.json()
                logger.info(f"✅ OpenAI ephemeral session created: {session_data.get('id', 'unknown')}")
                
                # Store session info
                sessions[session_id] = {
                    "openai_session": session_data,
                    "created_at": datetime.now(),
                    "conversation_started": False
                }
                
                # Initialize conversation store
                conversation_store.create_session(session_id)
                
                return JSONResponse({
                    "client_secret": {
                        "value": session_data["client_secret"]["value"]
                    },
                    "session_id": session_id,
                    "openai_session_id": session_data.get("id"),
                    "status": "created"
                })
                
    except Exception as e:
        logger.error(f"❌ Session creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webrtc")
async def handle_webrtc_offer(offer: SDPOffer):
    """Handle WebRTC SDP offer and forward to OpenAI"""
    try:
        session_id = offer.session_id
        logger.info(f"🔗 Handling WebRTC offer for session: {session_id}")
        
        if session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found. Create session first.")
        
        session_info = sessions[session_id]
        ephemeral_key = session_info["openai_session"]["client_secret"]["value"]
        
        logger.info(f"📡 Forwarding SDP offer to OpenAI...")
        logger.debug(f"📋 SDP Offer preview: {offer.sdp[:200]}...")
        
        # Forward SDP offer to OpenAI Realtime API
        openai_webrtc_url = "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview"
        logger.info(f"🔗 OpenAI WebRTC URL: {openai_webrtc_url}")
        logger.info(f"🔑 Using ephemeral key: {ephemeral_key[:20]}...{ephemeral_key[-10:]}")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                openai_webrtc_url,
                headers={
                    "Authorization": f"Bearer {ephemeral_key}",
                    "Content-Type": "application/sdp"
                },
                data=offer.sdp
            ) as response:
                # OpenAI returns 201 for successful WebRTC connection creation
                if response.status not in [200, 201]:
                    error_text = await response.text()
                    logger.error(f"❌ OpenAI WebRTC offer failed: {response.status} - {error_text}")
                    raise HTTPException(status_code=response.status, detail=f"OpenAI WebRTC error: {error_text}")
                
                answer_sdp = await response.text()
                logger.info(f"✅ Received SDP answer from OpenAI (status: {response.status}, length: {len(answer_sdp)} chars)")
                logger.debug(f"📋 SDP Answer preview: {answer_sdp[:200]}...")
                
                # Validate SDP response
                if not answer_sdp.strip():
                    logger.error("❌ Empty SDP response from OpenAI")
                    raise HTTPException(status_code=500, detail="Empty SDP response from OpenAI")
                
                if not answer_sdp.startswith("v=0"):
                    logger.error(f"❌ Invalid SDP response format: {answer_sdp[:50]}...")
                    raise HTTPException(status_code=500, detail="Invalid SDP response format")
                
                # Mark conversation as started
                sessions[session_id]["conversation_started"] = True
                
                return PlainTextResponse(
                    content=answer_sdp,
                    media_type="application/sdp"
                )
                
    except aiohttp.ClientError as e:
        logger.error(f"❌ HTTP Client error: {e}")
        raise HTTPException(status_code=500, detail=f"Connection error to OpenAI: {str(e)}")
    except Exception as e:
        logger.error(f"❌ WebRTC offer error: {e}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/transcript")
async def save_transcript(data: dict):
    """Save transcript from frontend WebRTC data channel events"""
    try:
        session_id = data.get("session_id", "default")
        event_type = data.get("type")
        
        logger.debug(f"📝 Received transcript event: {event_type} for session: {session_id}")
        
        if event_type == "conversation.item.input_audio_transcription.completed":
            # User transcript
            transcript = data.get("transcript", "")
            if transcript:
                await conversation_store.add_transcript(session_id, "user", transcript)
                logger.info(f"✅ User transcript saved: {transcript}")
        
        elif event_type == "response.audio_transcript.done":
            # Assistant transcript
            transcript = data.get("transcript", "")
            if transcript:
                await conversation_store.add_transcript(session_id, "assistant", transcript)
                logger.info(f"✅ Assistant transcript saved: {transcript}")
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"❌ Transcript save error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{session_id}")
async def get_session_status(session_id: str = "default"):
    """Get session status"""
    if session_id not in sessions:
        return {"status": "not_found"}
    
    session_info = sessions[session_id]
    return {
        "status": "active",
        "session_id": session_id,
        "openai_session_id": session_info["openai_session"].get("id"),
        "conversation_started": session_info.get("conversation_started", False),
        "created_at": session_info["created_at"].isoformat()
    }

@router.delete("/disconnect/{session_id}")
async def disconnect_session(session_id: str = "default"):
    """Disconnect and cleanup session"""
    cleanup_tasks = []
    
    if session_id in sessions:
        sessions.pop(session_id, None)
        cleanup_tasks.append("session")
    
    # End conversation session
    conversation_store.end_session(session_id)
    cleanup_tasks.append("conversation")
    
    logger.info(f"🔒 Session disconnected: {session_id}, cleaned up: {cleanup_tasks}")
    
    return {
        "status": "disconnected",
        "cleaned_up": cleanup_tasks
    }

@router.post("/finish/{session_id}")
async def finish_conversation(session_id: str = "default") -> FinishConversationResponse:
    """Finish conversation, analyze transcript with LLM, and return results"""
    try:
        logger.info(f"🏁 Finishing conversation for session: {session_id}")
        
        # Step 1: Get conversation data before cleanup
        conversation = conversation_store.get_conversation(session_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Step 2: Extract transcript text for LLM analysis
        transcripts = conversation.get("transcripts", [])
        if not transcripts:
            raise HTTPException(status_code=400, detail="No conversation data to analyze")
        
        # Build conversation text
        conversation_text = ""
        for transcript in transcripts:
            role = "Patient" if transcript["role"] == "user" else "AI Assistant"
            conversation_text += f"{role}: {transcript['content']}\n"
        
        logger.info(f"📋 Analyzing conversation with {len(transcripts)} transcript entries")
        
        # Step 3: Send to LLM for medical analysis
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        client = openai.OpenAI(api_key=openai_api_key)
        
        analysis_prompt = f"""
You are a medical AI assistant. Analyze this patient conversation and provide a structured assessment.

Conversation:
{conversation_text}

Please provide your analysis in the following JSON format:
{{
    "symptoms": ["list of symptoms mentioned"],
    "severity": "low/medium/high",
    "potential_conditions": ["possible conditions to investigate"],
    "recommendations": "brief recommendations for next steps"
}}

Focus on:
- Extracting clear symptoms mentioned by the patient
- Assessing overall severity based on symptoms described
- Suggesting potential conditions that warrant investigation
- Providing actionable next steps

Be conservative and always recommend consulting a healthcare professional for serious concerns.
"""

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a medical AI assistant providing preliminary symptom analysis."},
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # Step 4: Parse LLM response
        try:
            content = response.choices[0].message.content
            if content is None:
                raise ValueError("Empty response from LLM")
            analysis_result = json.loads(content)
        except (json.JSONDecodeError, ValueError):
            logger.error("Failed to parse LLM response as JSON")
            # Fallback analysis
            analysis_result = {
                "symptoms": ["Analysis unavailable"],
                "severity": "unknown",
                "potential_conditions": ["Requires manual review"],
                "recommendations": "Please consult with a healthcare professional for proper evaluation."
            }
        
        # Step 5: Calculate session metrics
        duration_seconds = conversation.get("duration_seconds", 0)
        if not duration_seconds and conversation.get("start_time"):
            start = datetime.fromisoformat(conversation["start_time"])
            end = datetime.now()
            duration_seconds = (end - start).total_seconds()
        
        # Step 6: Store analysis results before cleanup
        conversation_store.store_analysis(session_id, {
            "session_id": session_id,
            "status": "analyzed",
            "duration_seconds": duration_seconds,
            "transcript_count": len(transcripts),
            "symptoms": analysis_result.get("symptoms", []),
            "severity": analysis_result.get("severity", "unknown"),
            "potential_conditions": analysis_result.get("potential_conditions", []),
            "recommendations": analysis_result.get("recommendations", "Consult a healthcare professional.")
        })
        
        # Step 7: Cleanup session (same as disconnect)
        cleanup_tasks = []
        if session_id in sessions:
            sessions.pop(session_id, None)
            cleanup_tasks.append("session")
        
        conversation_store.end_session(session_id)
        cleanup_tasks.append("conversation")
        
        logger.info(f"✅ Conversation analysis completed for session: {session_id}")
        logger.info(f"📊 Found {len(analysis_result.get('symptoms', []))} symptoms, severity: {analysis_result.get('severity', 'unknown')}")
        
        return FinishConversationResponse(
            session_id=session_id,
            status="analyzed",
            duration_seconds=duration_seconds,
            transcript_count=len(transcripts),
            symptoms=analysis_result.get("symptoms", []),
            severity=analysis_result.get("severity", "unknown"),
            potential_conditions=analysis_result.get("potential_conditions", []),
            recommendations=analysis_result.get("recommendations", "Consult a healthcare professional.")
        )
        
    except Exception as e:
        logger.error(f"❌ Error finishing conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/{session_id}")
async def get_analysis_results(session_id: str = "default"):
    """Get analysis results for a completed session"""
    try:
        analysis = conversation_store.get_analysis(session_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found for this session")
        
        return JSONResponse(content=analysis)
        
    except Exception as e:
        logger.error(f"❌ Error fetching analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))