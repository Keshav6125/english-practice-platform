import { useState, useRef, useCallback, useEffect } from 'react';

export const useSpeechRecognition = (config = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isSupported = useRef(false);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      isSupported.current = true;
      recognitionRef.current = new SpeechRecognition();
    } else {
      isSupported.current = false;
      setError('Speech recognition is not supported in this browser');
    }
  }, []);

  // Configure speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    // Apply configuration
    recognition.continuous = config.continuous ?? true;
    recognition.interimResults = config.interimResults ?? true;
    recognition.lang = config.language ?? 'en-US';
    recognition.maxAlternatives = config.maxAlternatives ?? 1;

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptText;
          setConfidence(result[0].confidence);
        } else {
          interimText += transcriptText;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      
      // Handle specific errors
      switch (event.error) {
        case 'no-speech':
          setError('No speech detected. Please try speaking again.');
          break;
        case 'audio-capture':
          setError('Audio capture failed. Please check your microphone.');
          break;
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone access.');
          break;
        case 'network':
          setError('Network error occurred. Please check your connection.');
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onnomatch = () => {
      setError('No speech was recognized');
    };

    return () => {
      if (recognition) {
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onnomatch = null;
      }
    };
  }, [config]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported.current) {
      setError('Speech recognition is not available');
      return;
    }

    try {
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      console.error('Speech recognition start error:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSupported.current
  };
};