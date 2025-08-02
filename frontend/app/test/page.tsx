'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function TestPage() {
  const {
    isConnected,
    isStreaming,
    transcript,
    error,
    connectionStatus,
    activeSessions,
    totalConnections,
    connect,
    disconnect,
    sendAudioData,
    sendVideoData,
    requestTranscription,
    sendChatMessage,
    sendPing,
    getConnectionStatus,
  } = useWebSocket();

  const [sessionId, setSessionId] = useState('test-session');
  const [chatMessage, setChatMessage] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // Auto-connect on component mount
  useEffect(() => {
    connect(sessionId);
  }, []);

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        getConnectionStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, getConnectionStatus]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleConnect = async () => {
    addTestResult('Connecting to WebSocket...');
    await connect(sessionId);
  };

  const handleDisconnect = () => {
    addTestResult('Disconnecting from WebSocket...');
    disconnect();
  };

  const handleSendPing = async () => {
    addTestResult('Sending ping...');
    await sendPing();
  };

  const handleSendChat = async () => {
    if (chatMessage.trim()) {
      addTestResult(`Sending chat message: "${chatMessage}"`);
      await sendChatMessage(chatMessage);
      setChatMessage('');
    }
  };

  const handleSendTestAudio = async () => {
    addTestResult('Sending test audio data...');
    // Create a dummy audio blob
    const dummyAudio = new Blob(['test audio data'], { type: 'audio/wav' });
    await sendAudioData(dummyAudio);
  };

  const handleSendTestVideo = async () => {
    addTestResult('Sending test video data...');
    // Create a dummy video blob
    const dummyVideo = new Blob(['test video data'], { type: 'video/mp4' });
    await sendVideoData(dummyVideo);
  };

  const handleRequestTranscription = async () => {
    addTestResult('Requesting transcription...');
    // Create a dummy audio blob
    const dummyAudio = new Blob(['test audio data'], { type: 'audio/wav' });
    await requestTranscription(dummyAudio);
  };

  const runAutomatedTests = async () => {
    setIsTesting(true);
    addTestResult('Starting automated tests...');

    try {
      // Test 1: Connection
      addTestResult('Test 1: Connection test');
      await connect(sessionId);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 2: Ping
      addTestResult('Test 2: Ping test');
      await sendPing();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 3: Chat
      addTestResult('Test 3: Chat test');
      await sendChatMessage('Automated test message');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 4: Audio
      addTestResult('Test 4: Audio test');
      const dummyAudio = new Blob(['test audio data'], { type: 'audio/wav' });
      await sendAudioData(dummyAudio);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 5: Video
      addTestResult('Test 5: Video test');
      const dummyVideo = new Blob(['test video data'], { type: 'video/mp4' });
      await sendVideoData(dummyVideo);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test 6: Transcription
      addTestResult('Test 6: Transcription test');
      await requestTranscription(dummyAudio);
      await new Promise(resolve => setTimeout(resolve, 2000));

      addTestResult('All automated tests completed!');
    } catch (err) {
      addTestResult(`Test error: ${err}`);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">WebSocket Test Page</h1>
        <p className="text-muted-foreground">
          Test WebSocket functionality and real-time communication
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Connection Status
            <Badge variant={isConnected ? "default" : "destructive"}>
              {connectionStatus}
            </Badge>
          </CardTitle>
          <CardDescription>
            WebSocket connection and session information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Connected</p>
              <p className="text-2xl font-bold">{isConnected ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Streaming</p>
              <p className="text-2xl font-bold">{isStreaming ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Sessions</p>
              <p className="text-2xl font-bold">{activeSessions.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Connections</p>
              <p className="text-2xl font-bold">{totalConnections}</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Connection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Controls</CardTitle>
          <CardDescription>
            Manage WebSocket connection and session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleConnect} disabled={isConnected}>
              Connect
            </Button>
            <Button onClick={handleDisconnect} disabled={!isConnected} variant="outline">
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Message Controls</CardTitle>
          <CardDescription>
            Send different types of messages to test WebSocket functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={handleSendPing} disabled={!isConnected} size="sm">
              Send Ping
            </Button>
            <Button onClick={handleSendTestAudio} disabled={!isConnected} size="sm">
              Send Audio
            </Button>
            <Button onClick={handleSendTestVideo} disabled={!isConnected} size="sm">
              Send Video
            </Button>
            <Button onClick={handleRequestTranscription} disabled={!isConnected} size="sm">
              Request Transcription
            </Button>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Input
              placeholder="Type a chat message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1"
            />
            <Button onClick={handleSendChat} disabled={!isConnected || !chatMessage.trim()}>
              Send Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automated Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Testing</CardTitle>
          <CardDescription>
            Run a series of automated tests to verify WebSocket functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={runAutomatedTests} 
              disabled={!isConnected || isTesting}
              className="flex-1"
            >
              {isTesting ? 'Running Tests...' : 'Run Automated Tests'}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Real-time test results and message logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto border rounded-md p-4 bg-muted">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No test results yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcription Results */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcription Results</CardTitle>
            <CardDescription>
              Real-time transcription from audio data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 overflow-y-auto border rounded-md p-4 bg-muted">
              <p className="text-sm whitespace-pre-wrap">{transcript}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backend Test Page Link */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Test Page</CardTitle>
          <CardDescription>
            Access the backend WebSocket test page for additional testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.open('http://localhost:8000/api/stream/test-page', '_blank')}
            variant="outline"
          >
            Open Backend Test Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 