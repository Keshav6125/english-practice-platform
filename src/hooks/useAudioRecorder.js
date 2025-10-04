import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recording, setRecording] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(0);
  const durationIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
        });
        const url = URL.createObjectURL(blob);
        const finalDuration = Date.now() - startTimeRef.current;

        const newRecording = {
          blob,
          url,
          duration: finalDuration,
          timestamp: new Date()
        };

        setRecording(newRecording);
        setIsRecording(false);
        setDuration(0);
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (durationIntervalRef.current) {
          window.clearInterval(durationIntervalRef.current);
        }
      };

      // Start recording
      startTimeRef.current = Date.now();
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Start duration counter
      durationIntervalRef.current = window.setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);

      // Start audio level monitoring
      updateAudioLevel();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Recording error:', err);
    }
  }, [updateAudioLevel]);

  const stopRecording = useCallback(async () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || !isRecording) {
        resolve(null);
        return;
      }

      const originalOnStop = mediaRecorderRef.current.onstop;
      mediaRecorderRef.current.onstop = (event) => {
        if (originalOnStop && mediaRecorderRef.current) {
          originalOnStop.call(mediaRecorderRef.current, event);
        }
        // Wait a bit for the recording state to update
        setTimeout(() => {
          resolve(recording);
        }, 100);
      };

      mediaRecorderRef.current.stop();
    });
  }, [isRecording, recording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      if (durationIntervalRef.current) {
        window.clearInterval(durationIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      
      // Resume duration counter
      const pausedDuration = duration;
      startTimeRef.current = Date.now() - pausedDuration;
      durationIntervalRef.current = window.setInterval(() => {
        setDuration(Date.now() - startTimeRef.current);
      }, 100);

      // Resume audio level monitoring
      updateAudioLevel();
    }
  }, [duration, updateAudioLevel]);

  const clearRecording = useCallback(() => {
    if (recording?.url) {
      URL.revokeObjectURL(recording.url);
    }
    setRecording(null);
    setDuration(0);
    setAudioLevel(0);
    setError(null);
  }, [recording]);

  return {
    isRecording,
    audioLevel,
    duration,
    recording,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    error
  };
};