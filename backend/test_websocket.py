#!/usr/bin/env python3
"""
WebSocket Test Script for TerraHacks Backend
Tests the WebSocket functionality and various message types
"""

import asyncio
import websockets
import json
import time
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketTester:
    def __init__(self, uri: str = "ws://localhost:8000/api/stream/ws/test-session"):
        self.uri = uri
        self.websocket = None
        self.session_id = "test-session"
        self.messages_received = []
        self.test_results = {}

    async def connect(self):
        """Connect to WebSocket"""
        try:
            logger.info(f"Connecting to {self.uri}")
            self.websocket = await websockets.connect(self.uri)
            logger.info("✅ WebSocket connected successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect: {e}")
            return False

    async def disconnect(self):
        """Disconnect from WebSocket"""
        if self.websocket:
            await self.websocket.close()
            logger.info("WebSocket disconnected")

    async def send_message(self, message: Dict[str, Any]):
        """Send a message to the WebSocket"""
        try:
            await self.websocket.send(json.dumps(message))
            logger.info(f"📤 Sent: {message['type']}")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to send message: {e}")
            return False

    async def receive_messages(self, timeout: int = 5):
        """Receive messages for a specified time"""
        try:
            start_time = time.time()
            while time.time() - start_time < timeout:
                try:
                    message = await asyncio.wait_for(self.websocket.recv(), timeout=1.0)
                    data = json.loads(message)
                    self.messages_received.append(data)
                    logger.info(f"📥 Received: {data['type']}")
                except asyncio.TimeoutError:
                    continue
                except Exception as e:
                    logger.error(f"❌ Error receiving message: {e}")
                    break
        except Exception as e:
            logger.error(f"❌ Error in receive_messages: {e}")

    async def test_connection(self):
        """Test basic connection"""
        logger.info("🧪 Testing basic connection...")
        success = await self.connect()
        if success:
            await self.receive_messages(3)  # Wait for connection_established message
            self.test_results['connection'] = 'PASS'
            logger.info("✅ Connection test passed")
        else:
            self.test_results['connection'] = 'FAIL'
            logger.error("❌ Connection test failed")
        return success

    async def test_ping_pong(self):
        """Test ping/pong functionality"""
        logger.info("🧪 Testing ping/pong...")
        ping_message = {
            "type": "ping",
            "session_id": self.session_id,
            "timestamp": time.time()
        }
        
        await self.send_message(ping_message)
        await self.receive_messages(2)
        
        # Check if we received a pong
        pong_received = any(msg.get('type') == 'pong' for msg in self.messages_received)
        if pong_received:
            self.test_results['ping_pong'] = 'PASS'
            logger.info("✅ Ping/pong test passed")
        else:
            self.test_results['ping_pong'] = 'FAIL'
            logger.error("❌ Ping/pong test failed")
        return pong_received

    async def test_chat_message(self):
        """Test chat message functionality"""
        logger.info("🧪 Testing chat message...")
        chat_message = {
            "type": "chat",
            "message": "Hello from test client!",
            "session_id": self.session_id,
            "timestamp": time.time()
        }
        
        await self.send_message(chat_message)
        await self.receive_messages(2)
        
        # Check if we received a chat message back
        chat_received = any(msg.get('type') == 'chat_message' for msg in self.messages_received)
        if chat_received:
            self.test_results['chat'] = 'PASS'
            logger.info("✅ Chat message test passed")
        else:
            self.test_results['chat'] = 'FAIL'
            logger.error("❌ Chat message test failed")
        return chat_received

    async def test_transcription_request(self):
        """Test transcription request (with dummy audio data)"""
        logger.info("🧪 Testing transcription request...")
        
        # Create dummy audio data (base64 encoded)
        dummy_audio = "SGVsbG8gV29ybGQ="  # "Hello World" in base64
        
        transcription_message = {
            "type": "transcription_request",
            "data": dummy_audio,
            "session_id": self.session_id,
            "timestamp": time.time()
        }
        
        await self.send_message(transcription_message)
        await self.receive_messages(3)
        
        # Check if we received a transcription response (success or error)
        transcription_response = any(
            msg.get('type') in ['transcription_result', 'transcription_error'] 
            for msg in self.messages_received
        )
        if transcription_response:
            self.test_results['transcription'] = 'PASS'
            logger.info("✅ Transcription request test passed")
        else:
            self.test_results['transcription'] = 'FAIL'
            logger.error("❌ Transcription request test failed")
        return transcription_response

    async def test_audio_data(self):
        """Test audio data sending"""
        logger.info("🧪 Testing audio data...")
        
        # Create dummy audio data
        dummy_audio = "SGVsbG8gV29ybGQ="  # "Hello World" in base64
        
        audio_message = {
            "type": "audio",
            "data": dummy_audio,
            "session_id": self.session_id,
            "timestamp": time.time()
        }
        
        await self.send_message(audio_message)
        await self.receive_messages(2)
        
        # Check if we received an audio_received response
        audio_received = any(msg.get('type') == 'audio_received' for msg in self.messages_received)
        if audio_received:
            self.test_results['audio'] = 'PASS'
            logger.info("✅ Audio data test passed")
        else:
            self.test_results['audio'] = 'FAIL'
            logger.error("❌ Audio data test failed")
        return audio_received

    async def test_video_data(self):
        """Test video data sending"""
        logger.info("🧪 Testing video data...")
        
        # Create dummy video data
        dummy_video = "SGVsbG8gV29ybGQ="  # "Hello World" in base64
        
        video_message = {
            "type": "video",
            "data": dummy_video,
            "session_id": self.session_id,
            "timestamp": time.time()
        }
        
        await self.send_message(video_message)
        await self.receive_messages(2)
        
        # Check if we received a video_received response
        video_received = any(msg.get('type') == 'video_received' for msg in self.messages_received)
        if video_received:
            self.test_results['video'] = 'PASS'
            logger.info("✅ Video data test passed")
        else:
            self.test_results['video'] = 'FAIL'
            logger.error("❌ Video data test failed")
        return video_received

    async def test_unknown_message(self):
        """Test handling of unknown message type"""
        logger.info("🧪 Testing unknown message type...")
        
        unknown_message = {
            "type": "unknown_type",
            "data": "test",
            "session_id": self.session_id,
            "timestamp": time.time()
        }
        
        await self.send_message(unknown_message)
        await self.receive_messages(2)
        
        # Check if we received an unknown_message response
        unknown_response = any(msg.get('type') == 'unknown_message' for msg in self.messages_received)
        if unknown_response:
            self.test_results['unknown_message'] = 'PASS'
            logger.info("✅ Unknown message test passed")
        else:
            self.test_results['unknown_message'] = 'FAIL'
            logger.error("❌ Unknown message test failed")
        return unknown_response

    def print_results(self):
        """Print test results"""
        logger.info("\n" + "="*50)
        logger.info("📊 WebSocket Test Results")
        logger.info("="*50)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result == 'PASS')
        
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result == 'PASS' else "❌ FAIL"
            logger.info(f"{test_name.replace('_', ' ').title()}: {status}")
        
        logger.info("-"*50)
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests}")
        logger.info(f"Failed: {total_tests - passed_tests}")
        logger.info(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        logger.info("="*50)

    async def run_all_tests(self):
        """Run all WebSocket tests"""
        logger.info("🚀 Starting WebSocket Tests")
        logger.info("="*50)
        
        try:
            # Test connection first
            if not await self.test_connection():
                logger.error("❌ Cannot proceed with tests - connection failed")
                return False
            
            # Run all tests
            await self.test_ping_pong()
            await self.test_chat_message()
            await self.test_audio_data()
            await self.test_video_data()
            await self.test_transcription_request()
            await self.test_unknown_message()
            
            # Print results
            self.print_results()
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Test execution failed: {e}")
            return False
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = WebSocketTester()
    success = await tester.run_all_tests()
    
    if success:
        logger.info("🎉 All tests completed!")
    else:
        logger.error("💥 Tests failed!")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 