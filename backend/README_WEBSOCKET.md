# WebSocket Implementation Guide

This document explains the WebSocket implementation in the TerraHacks backend, based on FastAPI's WebSocket documentation.

## Overview

The WebSocket implementation provides real-time bidirectional communication between the frontend and backend, supporting:

- **Real-time messaging**: Chat messages, status updates, and notifications
- **Audio/Video streaming**: Sending audio and video data for processing
- **Transcription requests**: Real-time audio transcription using OpenAI Whisper
- **Connection management**: Automatic reconnection, ping/pong health checks
- **Session management**: Multiple concurrent sessions with proper isolation

## Architecture

### Backend Components

1. **Connection Manager** (`ConnectionManager` class)
   - Manages active WebSocket connections
   - Handles connection lifecycle (connect, disconnect, cleanup)
   - Provides broadcasting and personal messaging capabilities
   - Tracks active sessions and connection counts

2. **WebSocket Endpoint** (`/api/stream/ws/{session_id}`)
   - Accepts WebSocket connections with session-based routing
   - Processes different message types (audio, video, chat, ping, etc.)
   - Handles connection errors and disconnections gracefully

3. **Message Handlers**
   - `process_audio_data()`: Handles audio data for transcription
   - `process_video_data()`: Handles video data for analysis
   - `handle_transcription_request()`: Processes transcription requests
   - `handle_chat_message()`: Broadcasts chat messages to all clients

### Frontend Components

1. **useWebSocket Hook** (`frontend/hooks/useWebSocket.ts`)
   - Manages WebSocket connection state
   - Provides methods for sending different message types
   - Handles automatic reconnection and error recovery
   - Implements ping/pong for connection health monitoring

2. **Test Page** (`frontend/app/test/page.tsx`)
   - Comprehensive testing interface
   - Manual and automated testing capabilities
   - Real-time status monitoring
   - Connection and message testing tools

## Message Types

### Client to Server Messages

| Type | Description | Payload |
|------|-------------|---------|
| `ping` | Health check ping | `{session_id, timestamp}` |
| `chat` | Chat message | `{message, session_id, timestamp}` |
| `audio` | Audio data | `{data: base64, session_id, timestamp}` |
| `video` | Video data | `{data: base64, session_id, timestamp}` |
| `transcription_request` | Request transcription | `{data: base64, session_id, timestamp}` |
| `test` | Test message | `{data, session_id, timestamp}` |

### Server to Client Messages

| Type | Description | Payload |
|------|-------------|---------|
| `connection_established` | Connection confirmed | `{message, session_id, timestamp}` |
| `pong` | Ping response | `{session_id, timestamp}` |
| `chat_message` | Broadcast chat message | `{message, session_id, timestamp}` |
| `audio_received` | Audio data acknowledged | `{session_id, timestamp}` |
| `video_received` | Video data acknowledged | `{session_id, timestamp}` |
| `transcription_result` | Transcription result | `{transcript, session_id, timestamp}` |
| `transcription_error` | Transcription error | `{error, session_id, timestamp}` |
| `webrtc_connected` | WebRTC connection established | `{session_id, timestamp}` |
| `webrtc_disconnected` | WebRTC connection closed | `{session_id, timestamp}` |
| `error` | Server error | `{message, session_id, timestamp}` |

## Usage Examples

### Basic Connection

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';

const { connect, disconnect, isConnected } = useWebSocket();

// Connect to a session
await connect('my-session');

// Disconnect
disconnect();
```

### Sending Messages

```typescript
const { sendChatMessage, sendPing, sendAudioData } = useWebSocket();

// Send a chat message
await sendChatMessage('Hello, world!');

// Send a ping
await sendPing();

// Send audio data
const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });
await sendAudioData(audioBlob);
```

### Receiving Messages

```typescript
const { transcript, error, connectionStatus } = useWebSocket();

// Monitor connection status
console.log('Connection status:', connectionStatus);

// Check for errors
if (error) {
  console.error('WebSocket error:', error);
}

// Get transcription results
console.log('Transcription:', transcript);
```

## Testing

### Backend Testing

Run the comprehensive WebSocket test suite:

```bash
cd backend
python test_websocket.py
```

This will test:
- Basic connection
- Ping/pong functionality
- Chat messaging
- Audio/video data handling
- Transcription requests
- Error handling

### Frontend Testing

1. **Manual Testing**: Visit `http://localhost:3000/test`
   - Connection controls
   - Message sending
   - Real-time status monitoring
   - Automated test suite

2. **Backend Test Page**: Visit `http://localhost:8000/api/stream/test-page`
   - Simple HTML test interface
   - Direct WebSocket testing
   - Message logging

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stream/ws/{session_id}` | WebSocket | WebSocket connection endpoint |
| `/api/stream/status/{session_id}` | GET | Get connection status |
| `/api/stream/disconnect/{session_id}` | DELETE | Disconnect session |
| `/api/stream/test-page` | GET | HTML test page |

## Configuration

### Environment Variables

```bash
# Backend .env file
OPENAI_API_KEY=your_openai_api_key_here
HOST=0.0.0.0
PORT=8000
```

### CORS Settings

The backend is configured with permissive CORS settings for development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
)
```

## Error Handling

### Connection Errors

- Automatic reconnection on connection loss
- Exponential backoff for reconnection attempts
- Graceful handling of network interruptions

### Message Errors

- Invalid message types are acknowledged with error responses
- Malformed JSON is handled gracefully
- Server errors are propagated to the client

### Session Management

- Sessions are automatically cleaned up on disconnect
- Orphaned connections are detected and removed
- Session state is maintained per connection

## Performance Considerations

### Connection Limits

- No hard limit on concurrent connections (configurable)
- Memory usage scales with active connections
- Consider Redis for production session management

### Message Size

- Audio/video data is base64 encoded
- Large messages may impact performance
- Consider chunking for large data transfers

### Health Monitoring

- Ping/pong every 30 seconds
- Connection status monitoring
- Automatic cleanup of stale connections

## Production Considerations

### Scaling

For production deployment, consider:

1. **Redis Integration**: Use Redis for session storage and message broadcasting
2. **Load Balancing**: Multiple backend instances with sticky sessions
3. **Monitoring**: Add metrics for connection counts and message rates
4. **Security**: Implement authentication and rate limiting

### Security

- Add authentication to WebSocket connections
- Implement rate limiting for message sending
- Validate message payloads
- Use WSS (WebSocket Secure) in production

### Monitoring

```python
# Add to your monitoring
logger.info(f"Active connections: {manager.get_connection_count()}")
logger.info(f"Active sessions: {manager.get_active_sessions()}")
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if backend is running on port 8000
   - Verify CORS settings
   - Check firewall settings

2. **Messages Not Received**
   - Verify WebSocket connection is established
   - Check browser console for errors
   - Ensure message format is correct

3. **Transcription Errors**
   - Verify OpenAI API key is set
   - Check audio data format
   - Monitor API rate limits

### Debug Commands

```bash
# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     http://localhost:8000/api/stream/ws/test

# Check connection status
curl http://localhost:8000/api/stream/status/test-session
```

## References

- [FastAPI WebSocket Documentation](https://fastapi.tiangolo.com/advanced/websockets/)
- [WebSocket Protocol RFC](https://tools.ietf.org/html/rfc6455)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text) 