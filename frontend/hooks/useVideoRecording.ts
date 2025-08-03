'use client';

import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase/client';

interface UseVideoRecordingReturn {
  isRecording: boolean;
  recordingBlob: Blob | null;
  recordingUrl: string | null;
  error: string | null;
  startRecording: (stream: MediaStream) => Promise<void>;
  stopRecording: () => Promise<void>;
  saveToSupabase: (sessionId: string) => Promise<string | null>;
  clearRecording: () => void;
}

export const useVideoRecording = (): UseVideoRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async (stream: MediaStream) => {
    try {
      setError(null);
      recordedChunksRef.current = [];
      
      // Create MediaRecorder with video stream
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm'
        });
        setRecordingBlob(blob);
        
        // Create URL for preview
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        
        console.log('✅ Video recording completed:', {
          size: blob.size,
          duration: blob.size / 1024 / 1024, // Approximate MB
          url: url
        });
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      console.log('🎥 Started video recording');
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMsg);
      console.error('❌ Error starting recording:', err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('🛑 Stopped video recording');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMsg);
      console.error('❌ Error stopping recording:', err);
    }
  }, [isRecording]);

  const saveToSupabase = useCallback(async (sessionId: string): Promise<string | null> => {
    try {
      if (!recordingBlob) {
        throw new Error('No recording available to save');
      }

      console.log('💾 Saving video to Supabase storage...');
      
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `session-${sessionId}-${timestamp}.webm`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos') // Make sure this bucket exists in your Supabase project
        .upload(filename, recordingBlob, {
          contentType: 'video/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('video-recordings')
        .getPublicUrl(filename);

      console.log('✅ Video saved to Supabase:', {
        filename,
        size: recordingBlob.size,
        url: urlData.publicUrl
      });

      return urlData.publicUrl;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save video';
      setError(errorMsg);
      console.error('❌ Error saving video:', err);
      return null;
    }
  }, [recordingBlob]);

  const clearRecording = useCallback(() => {
    // Clean up blob URL
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
    
    setRecordingBlob(null);
    setRecordingUrl(null);
    setError(null);
    
    console.log('🧹 Cleared video recording');
  }, [recordingUrl]);

  return {
    isRecording,
    recordingBlob,
    recordingUrl,
    error,
    startRecording,
    stopRecording,
    saveToSupabase,
    clearRecording,
  };
}; 