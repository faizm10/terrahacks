# 🚀 MediAI WebSocket & WebRTC Integration Guide

This guide provides everything you need to get the WebSocket-based audio/video streaming and transcription functionality working with your frontend `/stream` page.

## ✅ **What's Been Implemented**

### Backend Features
- ✅ **WebSocket Server**: Real-time bidirectional communication
- ✅ **Audio Processing**: Microphone data capture and streaming
- ✅ **Video Processing**: Camera data capture and streaming
- ✅ **Transcription**: OpenAI Whisper integration
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Session Management**: Multi-user session support

### Frontend Features
- ✅ **WebSocket Hook**: Real-time connection management
- ✅ **WebRTC Hook**: Enhanced with audio support
- ✅ **Stream Page**: Dual-panel layout with video + transcription
- ✅ **Test Page**: Integration testing interface
- ✅ **Error Display**: Real-time error feedback

## 🚀 **Quick Start**

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
./setup.sh
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend
source env/bin/activate
pip install -r requirements.txt

# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=your_actual_api_key_here" > .env

# Start backend
python main.py
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🎯 **Testing the Integration**

### 1. Test Page (Recommended First Step)
Navigate to `http://localhost:3000/test` and click "Run All Tests" to verify:
- ✅ WebSocket connection
- ✅ WebRTC stream initialization
- ✅ Backend connection
- ✅ Audio/video permissions

### 2. Stream Page
Navigate to `http://localhost:3000/stream` to use the full functionality:
- 🎥 **Video Feed**: Live camera preview
- 🎙️ **Audio Recording**: Click "Start Recording" to begin transcription
- 📝 **Live Transcription**: Real-time speech-to-text
- 🔄 **Dual Connection**: WebRTC + WebSocket simultaneously

## 📋 **API Endpoints**

### WebSocket Endpoints
- `ws://localhost:8000/api/stream/ws/{session_id}` - WebSocket connection
- `GET /api/stream/status/{session_id}` - Connection status
- `DELETE /api/stream/disconnect/{session_id}` - Disconnect

### HTTP Endpoints
- `POST /api/stream/connect` - WebRTC connection setup
- `GET /test` - Backend health check

## 🔧 **Configuration**

### Backend Environment Variables
```bash
# backend/.env
OPENAI_API_KEY=your_openai_api_key_here
HOST=0.0.0.0
PORT=8000
```

### Frontend Configuration
The frontend automatically connects to:
- Backend: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/api/stream/ws/default`

## 🧪 **Testing Commands**

### Test WebSocket Connection
```bash
cd backend
source env/bin/activate
python test_websocket.py
```

### Test Backend Health
```bash
curl http://localhost:8000/test
```

### Test Frontend Connection
```bash
curl http://localhost:3000
```

## 🔍 **Troubleshooting**

### Common Issues

#### 1. WebSocket Connection Failed
**Symptoms**: "WebSocket connection error" in frontend
**Solutions**:
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify firewall isn't blocking WebSocket connections

#### 2. Camera/Microphone Access Denied
**Symptoms**: "Failed to access camera/microphone"
**Solutions**:
- Allow browser permissions for camera and microphone
- Check device has working camera/microphone
- Try refreshing the page and allowing permissions again

#### 3. Transcription Not Working
**Symptoms**: No transcription results
**Solutions**:
- Verify OpenAI API key is set correctly in `backend/.env`
- Check OpenAI API quota and billing
- Ensure audio is being captured (check browser console)

#### 4. WebRTC Connection Issues
**Symptoms**: "Peer connection error"
**Solutions**:
- Check STUN server configuration
- Ensure backend is accessible from frontend
- Try different browser (Chrome recommended)

### Debug Mode

#### Backend Debug
```python
# Add to backend/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### Frontend Debug
Open browser developer tools and check:
- Console for WebSocket messages
- Network tab for connection status
- Application tab for permissions

## 📁 **File Structure**

```
terrahacks/
├── backend/
│   ├── api/routes/stream.py      # WebSocket & WebRTC endpoints
│   ├── config/settings.py        # Configuration
│   ├── test_websocket.py         # WebSocket test
│   ├── requirements.txt          # Dependencies
│   └── main.py                  # FastAPI app
├── frontend/
│   ├── hooks/useWebSocket.ts     # WebSocket hook
│   ├── hooks/useWebRTC.ts        # WebRTC hook
│   ├── app/stream/page.tsx       # Stream page
│   └── app/test/page.tsx         # Test page
├── setup.sh                      # Automated setup
└── INTEGRATION_GUIDE.md         # This guide
```

## 🔄 **Data Flow**

```
Frontend Browser
    ↓ (getUserMedia)
Camera + Microphone
    ↓ (WebRTC)
Backend WebRTC Handler
    ↓ (WebSocket)
Backend WebSocket Handler
    ↓ (OpenAI API)
Whisper Transcription
    ↓ (WebSocket)
Frontend Display
```

## 🚀 **Next Steps**

1. **Set OpenAI API Key**: Update `backend/.env` with your actual API key
2. **Test Integration**: Use the test page to verify everything works
3. **Use Stream Page**: Navigate to `/stream` for full functionality
4. **Customize**: Modify the UI and add your own features

## 📞 **Support**

If you encounter issues:

1. **Check the test page** first: `http://localhost:3000/test`
2. **Review browser console** for error messages
3. **Check backend logs** for server-side errors
4. **Verify permissions** for camera and microphone
5. **Test WebSocket connection** using the test script

## 🎉 **Success Indicators**

You'll know everything is working when:
- ✅ Test page shows all green checkmarks
- ✅ Stream page loads without errors
- ✅ Camera preview appears
- ✅ "Start Recording" button is enabled
- ✅ Transcription appears when you speak
- ✅ No error messages in browser console

---

**Happy coding! 🚀** 