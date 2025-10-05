import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import {
  Mic,
  Stop,
  Send,
  VolumeUp,
  Person,
  SmartToy
} from '@mui/icons-material';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { GeminiService } from '../services/geminiService';
// import type { Scenario, PracticeSession as PracticeSessionType, SessionStatus } from '../types.js';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PracticeSessionProps {
  scenario: any;
  onSessionComplete: (session: any) => void;
  onExit: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  scenario,
  onSessionComplete,
  onExit
}) => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [isWaitingForUser, setIsWaitingForUser] = useState(false);
  const [aiSpeechMode, setAiSpeechMode] = useState<'auto' | 'manual'>('manual');
  const [userMicMode, setUserMicMode] = useState<'auto' | 'manual'>('manual');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [lastSpokenMessageTimestamp, setLastSpokenMessageTimestamp] = useState<number | null>(null);
  const [lastAutoMicMessageTimestamp, setLastAutoMicMessageTimestamp] = useState<number | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const activeSpeechTimestampRef = useRef<number | null>(null);

  const {
    isRecording,
    audioLevel,
    duration,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError
  } = useAudioRecorder();

  const {
    transcript,
    interimTranscript,
    resetTranscript,
    startListening,
    stopListening,
    isSupported: speechSupported,
    error: speechError
  } = useSpeechRecognition();

  const latestAiMessage = useMemo(() => {
    for (let i = conversation.length - 1; i >= 0; i -= 1) {
      if (conversation[i].role === 'assistant') {
        return conversation[i];
      }
    }
    return null;
  }, [conversation]);

  // Load persisted auto-mode preferences
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedAiMode = window.localStorage.getItem('aiSpeechMode');
    if (storedAiMode === 'auto' || storedAiMode === 'manual') {
      setAiSpeechMode(storedAiMode);
    }
    const storedUserMode = window.localStorage.getItem('userMicMode');
    if (storedUserMode === 'auto' || storedUserMode === 'manual') {
      setUserMicMode(storedUserMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem('aiSpeechMode', aiSpeechMode);
  }, [aiSpeechMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem('userMicMode', userMicMode);
  }, [userMicMode]);

  // Initialize session with AI greeting
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsProcessing(true);
        const greeting = await GeminiService.initializeConversation(scenario);
        const aiMessage: ConversationMessage = {
          role: 'assistant',
          content: greeting,
          timestamp: new Date()
        };
        setConversation([aiMessage]);
        setIsWaitingForUser(true);
      } catch (err) {
        setError('Failed to initialize conversation. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    initializeSession();
  }, [scenario]);

  // Handle voice recording and transcription
  const handleStartRecording = useCallback(async () => {
    try {
      setInfoMessage(null);
      if (!speechSupported) {
        const unsupportedMessage =
          'Speech recognition is not supported in this browser. Please try using a supported browser like Chrome or Edge for microphone features.';
        setError(unsupportedMessage);
        setInfoMessage(unsupportedMessage);
        return false;
      }
      setError(null);
      resetTranscript();
      await startRecording();
      startListening();
      return true;
    } catch (err) {
      setError('Failed to start recording. Please check your microphone permissions.');
      return false;
    }
  }, [
    setError,
    setInfoMessage,
    speechSupported,
    resetTranscript,
    startRecording,
    startListening
  ]);

  const handleAutoStartRecording = useCallback(async () => {
    if (isRecording) {
      return true;
    }
    const started = await handleStartRecording();
    if (!started) {
      setInfoMessage('Automatic microphone activation was blocked. Please tap the mic button.');
      return false;
    }
    setInfoMessage(null);
    return true;
  }, [handleStartRecording, isRecording]);

  const handleAiSpeechCompletion = useCallback(
    (timestamp: number, warningMessage?: string) => {
      if (warningMessage) {
        setInfoMessage(warningMessage);
      }
      setIsAiSpeaking(false);
      if (userMicMode === 'auto') {
        if (lastAutoMicMessageTimestamp !== timestamp && !isRecording) {
          handleAutoStartRecording();
        }
        setLastAutoMicMessageTimestamp(timestamp);
      }
    },
    [handleAutoStartRecording, isRecording, lastAutoMicMessageTimestamp, userMicMode]
  );

  const handleStopRecording = useCallback(async () => {
    try {
      setIsProcessing(true);
      const audioRecording = await stopRecording();
      stopListening();

      if (!speechSupported) {
        setIsProcessing(false);
        return;
      }

      // Wait a moment for speech recognition to finish processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      let finalTranscript = transcript.trim() || interimTranscript.trim();

      // Since Gemini doesn't have audio transcription, rely on browser speech recognition
      if (!finalTranscript) {
        setError('No speech detected. Please try speaking again or ensure your microphone is working.');
        setIsProcessing(false);
        return;
      }

      console.log('Processing transcript:', finalTranscript);
      await processUserMessage(finalTranscript);
      resetTranscript(); // Clear transcript after processing
      clearRecording();
    } catch (err) {
      console.error('Recording processing error:', err);
      setError('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [
    stopRecording,
    stopListening,
    speechSupported,
    transcript,
    interimTranscript,
    clearRecording,
    resetTranscript
  ]);

  // Process user message and get AI response
  const processUserMessage = async (message: string) => {
    try {
      setIsWaitingForUser(false);
      
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      const updatedConversation = [...conversation, userMessage];
      setConversation(updatedConversation);
      
      // Prepare conversation history for API
      const apiHistory = updatedConversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Get AI response
      const response = await GeminiService.generateConversationResponse(
        scenario,
        message,
        apiHistory.slice(1), // Remove initial greeting from history
        turnCount
      );
      
      // Add AI response to conversation
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      const finalConversation = [...updatedConversation, aiMessage];
      setConversation(finalConversation);
      setTurnCount(prev => prev + 1);
      setIsWaitingForUser(true);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
      setIsWaitingForUser(true);
    }
  };

  // Complete session and generate feedback
  const handleCompleteSession = async () => {
    try {
      setIsProcessing(true);
      const endTime = new Date();
      const sessionDuration = endTime.getTime() - sessionStartTime.getTime();

      // Generate full transcript from user messages
      const fullTranscript = conversation
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join(' ');

      console.log('Completing session with transcript:', fullTranscript);
      console.log('Session duration:', sessionDuration);
      console.log('Conversation history:', conversation);

      if (!fullTranscript.trim()) {
        setError('No conversation to analyze. Please speak with the AI first.');
        setIsProcessing(false);
        return;
      }

      // Generate feedback report
      const feedback = await GeminiService.generateFeedbackReport(
        fullTranscript,
        scenario,
        {
          duration: sessionDuration,
          pauseCount: 0,
          speakingRate: GeminiService.analyzeAudioCharacteristics(fullTranscript, sessionDuration).speakingRate
        }
      );

      const session: any = {
        id: `session_${Date.now()}`,
        userId: 'current_user',
        scenarioId: scenario.id,
        startTime: sessionStartTime,
        endTime,
        duration: Math.floor(sessionDuration / 1000),
        transcript: fullTranscript,
        aiResponse: conversation.filter(msg => msg.role === 'assistant').map(msg => msg.content).join('\n'),
        feedback,
        status: 'completed'
      };

      console.log('Session created:', session);
      onSessionComplete(session);
    } catch (err) {
      console.error('Session completion error:', err);
      setError(`Failed to generate feedback: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format duration for display
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Text-to-speech for AI responses
  const speakAiResponse = useCallback(
    (message: ConversationMessage) => {
      const text = message.content;
      const timestamp = message.timestamp.getTime();
      setInfoMessage(null);
      if (!text) {
        return false;
      }
      if (typeof window === 'undefined') {
        return false;
      }

      if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
        setInfoMessage('Text-to-speech is not supported in this browser. The AI will respond with text only.');
        setLastSpokenMessageTimestamp(timestamp);
        handleAiSpeechCompletion(timestamp);
        return false;
      }

      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => {
        if (activeSpeechTimestampRef.current === timestamp) {
          activeSpeechTimestampRef.current = null;
          handleAiSpeechCompletion(timestamp);
        }
      };

      utterance.onerror = () => {
        if (activeSpeechTimestampRef.current === timestamp) {
          activeSpeechTimestampRef.current = null;
          handleAiSpeechCompletion(
            timestamp,
            'Unable to play speech audio automatically. Please use the speaker button to retry.'
          );
        }
      };

      activeSpeechTimestampRef.current = timestamp;
      setIsAiSpeaking(true);
      setLastSpokenMessageTimestamp(timestamp);
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [handleAiSpeechCompletion]
  );

  useEffect(() => {
    if (aiSpeechMode !== 'auto') {
      return;
    }
    if (!latestAiMessage) {
      return;
    }
    const timestamp = latestAiMessage.timestamp.getTime();
    if (lastSpokenMessageTimestamp === timestamp) {
      return;
    }
    speakAiResponse(latestAiMessage);
  }, [aiSpeechMode, lastSpokenMessageTimestamp, latestAiMessage, speakAiResponse]);

  useEffect(() => {
    if (userMicMode !== 'auto') {
      return;
    }
    if (!latestAiMessage) {
      return;
    }
    if (!isWaitingForUser || isRecording || isAiSpeaking) {
      return;
    }
    const timestamp = latestAiMessage.timestamp.getTime();
    if (lastSpokenMessageTimestamp !== timestamp) {
      return;
    }
    if (lastAutoMicMessageTimestamp === timestamp) {
      return;
    }
    handleAutoStartRecording();
    setLastAutoMicMessageTimestamp(timestamp);
  }, [
    handleAutoStartRecording,
    isAiSpeaking,
    isRecording,
    isWaitingForUser,
    lastAutoMicMessageTimestamp,
    lastSpokenMessageTimestamp,
    latestAiMessage,
    userMicMode
  ]);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3, backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Session Header */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, rgba(79,70,229,0.05), rgba(6,182,212,0.05))',
        border: '1px solid var(--color-divider)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" sx={{ 
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--color-text)'
            }}>
              {scenario.title}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setShowExitDialog(true)}
              sx={{
                borderRadius: 'var(--radius-button)',
                borderColor: 'var(--color-divider)',
                color: 'var(--color-muted)',
                '&:hover': {
                  borderColor: 'var(--color-error)',
                  color: 'var(--color-error)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)'
                }
              }}
            >
              Exit Session
            </Button>
          </Box>
          
          <Typography variant="body1" sx={{ color: '#4B5563', mb: 3, lineHeight: 1.6 }}>
            {scenario.description}
          </Typography>

          <Box display="flex" gap={1.5} mb={3} flexWrap="wrap">
            <Chip 
              label={scenario.category.replace('_', ' ')} 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(79,70,229,0.1)',
                color: 'var(--color-accent)',
                fontWeight: 500
              }}
            />
            <Chip 
              label={scenario.difficulty} 
              size="small" 
              sx={{
                backgroundColor: scenario.difficulty === 'beginner' ? 'rgba(16,185,129,0.1)' :
                                scenario.difficulty === 'intermediate' ? 'rgba(245,158,11,0.1)' :
                                'rgba(239,68,68,0.1)',
                color: scenario.difficulty === 'beginner' ? 'var(--color-success)' :
                       scenario.difficulty === 'intermediate' ? 'var(--color-warning)' :
                       'var(--color-error)',
                fontWeight: 500
              }}
            />
            <Chip 
              label={`${scenario.duration} min`} 
              size="small" 
              sx={{
                backgroundColor: 'rgba(6,182,212,0.1)',
                color: 'var(--color-accent2)',
                fontWeight: 500
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ 
            fontStyle: 'italic', 
            color: '#4B5563',
            padding: 2,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--color-divider)'
          }}>
            💬 Context: {scenario.context}
          </Typography>
        </CardContent>
      </Card>

      {/* Error Display */}
      {(error || recordingError || speechError) && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={error ? () => setError(null) : undefined}
        >
          {[error, recordingError, speechError]
            .filter(Boolean)
            .map((message, index) => (
              <div key={index}>{message}</div>
            ))}
        </Alert>
      )}

      {infoMessage && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setInfoMessage(null)}>
          {infoMessage}
        </Alert>
      )}

      {/* Conversation Display */}
      <Card sx={{ 
        mb: 4, 
        maxHeight: 500, 
        overflow: 'auto',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-divider)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <CardContent>
          <Typography variant="h6" mb={3} sx={{ 
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            💬 Conversation
          </Typography>
          {conversation.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                mb: 3,
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'slide-in var(--duration-medium) var(--easing)'
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ 
                  mr: 2, 
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <SmartToy />
                </Avatar>
              )}
              <Paper
                className="card-glass"
                sx={{
                  p: 3,
                  maxWidth: '75%',
                  backgroundColor: message.role === 'user' 
                    ? 'rgba(79,70,229,0.08)' 
                    : 'rgba(255,255,255,0.9)',
                  borderRadius: 'var(--radius-card)',
                  border: message.role === 'user' 
                    ? '1px solid rgba(79,70,229,0.2)'
                    : '1px solid var(--color-divider)',
                  position: 'relative',
                  boxShadow: 'var(--shadow-card)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Typography variant="body1" sx={{ 
                  color: 'var(--color-text)',
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>
                  {message.content}
                </Typography>
                {message.role === 'assistant' && (
                  <IconButton
                    size="small"
                    onClick={() => speakAiResponse(message)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(79,70,229,0.1)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all var(--duration-short) var(--easing)'
                    }}
                  >
                    <VolumeUp fontSize="small" />
                  </IconButton>
                )}
              </Paper>
              {message.role === 'user' && (
                <Avatar sx={{ 
                  ml: 2, 
                  background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <Person />
                </Avatar>
              )}
            </Box>
          ))}
          
          {isProcessing && (
            <Box display="flex" alignItems="center" gap={2} justifyContent="center" py={3}>
              <LinearProgress sx={{ 
                width: 200, 
                height: 6,
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(79,70,229,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent2))'
                }
              }} />
              <Typography variant="body2" sx={{ color: 'var(--color-muted)', fontWeight: 500 }}>
                AI is thinking...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Recording Interface */}
      <Card sx={{
        mb: 3,
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-divider)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            width="100%"
            mb={3}
          >
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
                AI speech:
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={aiSpeechMode}
                onChange={(_, value) => {
                  if (value === 'auto' || value === 'manual') {
                    setAiSpeechMode(value);
                  }
                }}
                aria-label="AI speech start mode"
                sx={{
                  backgroundColor: 'rgba(79,70,229,0.05)',
                  borderRadius: 'var(--radius-pill)',
                  '& .MuiToggleButtonGroup-grouped': {
                    border: 'none',
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'var(--color-accent)',
                      color: 'white'
                    }
                  }
                }}
              >
                <ToggleButton value="auto" aria-label="AI speech automatic mode">
                  Auto
                </ToggleButton>
                <ToggleButton value="manual" aria-label="AI speech manual mode">
                  Manual
                </ToggleButton>
              </ToggleButtonGroup>
              {aiSpeechMode === 'auto' && (
                <Tooltip title="AI responses will play automatically">
                  <Chip label="AI Auto On" size="small" color="primary" variant="outlined" />
                </Tooltip>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
                User mic:
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={userMicMode}
                onChange={(_, value) => {
                  if (value === 'auto' || value === 'manual') {
                    setUserMicMode(value);
                  }
                }}
                aria-label="User microphone start mode"
                sx={{
                  backgroundColor: 'rgba(16,185,129,0.08)',
                  borderRadius: 'var(--radius-pill)',
                  '& .MuiToggleButtonGroup-grouped': {
                    border: 'none',
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'var(--color-success)',
                      color: 'white'
                    }
                  }
                }}
              >
                <ToggleButton value="auto" aria-label="User microphone automatic mode">
                  Auto
                </ToggleButton>
                <ToggleButton value="manual" aria-label="User microphone manual mode">
                  Manual
                </ToggleButton>
              </ToggleButtonGroup>
              {userMicMode === 'auto' && (
                <Tooltip title="Your microphone will open automatically when it's your turn">
                  <Chip label="Mic Auto On" size="small" color="success" variant="outlined" />
                </Tooltip>
              )}
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
            {/* Recording Status */}
            {isRecording && (
              <Box display="flex" alignItems="center" gap={3} width="100%" p={2} sx={{
                backgroundColor: 'rgba(239,68,68,0.05)',
                borderRadius: 'var(--radius-button)',
                border: '1px solid rgba(239,68,68,0.2)'
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-error)',
                    animation: 'pulse-record 1200ms var(--easing) infinite'
                  }} />
                  <Typography variant="body1" sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
                    Recording: {formatDuration(duration)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(audioLevel * 100, 100)} 
                  sx={{ 
                    flex: 1,
                    height: 8,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'var(--color-error)',
                      borderRadius: 'var(--radius-pill)'
                    }
                  }}
                />
              </Box>
            )}

            {/* Transcript Display */}
            {(transcript || interimTranscript) && (
              <Paper className="card-glass" sx={{ 
                p: 3, 
                width: '100%', 
                minHeight: 80,
                backgroundColor: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(79,70,229,0.2)',
                borderRadius: 'var(--radius-card)'
              }}>
                <Typography variant="body2" sx={{ 
                  color: 'var(--color-accent)', 
                  fontWeight: 600,
                  mb: 1
                }}>
                  🎤 Your Speech:
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'var(--color-text)',
                  lineHeight: 1.6,
                  fontSize: '1.05rem'
                }}>
                  {transcript}
                  {interimTranscript && (
                    <span style={{ opacity: 0.6, fontStyle: 'italic', color: 'var(--color-muted)' }}>
                      {interimTranscript}
                    </span>
                  )}
                </Typography>
              </Paper>
            )}

            {/* Modern Record Button */}
            <Box display="flex" alignItems="center" gap={4}>
              {!isRecording && isWaitingForUser ? (
                <Tooltip
                  title={
                    speechSupported
                      ? ''
                      : 'Speech recognition is not supported in this browser. Please try another browser to use the microphone.'
                  }
                  disableHoverListener={speechSupported}
                >
                  <span>
                    <button
                      className={`record-button ${isRecording ? 'recording' : ''}`}
                      onClick={handleStartRecording}
                      disabled={isProcessing || !speechSupported}
                      style={{
                        border: 'none',
                        background:
                          isProcessing || !speechSupported
                            ? 'rgba(156,163,175,0.3)'
                            : 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
                        color: 'white',
                        cursor: isProcessing || !speechSupported ? 'not-allowed' : 'pointer',
                        opacity: speechSupported ? 1 : 0.6
                      }}
                    >
                      <Mic sx={{ fontSize: 32 }} />
                    </button>
                  </span>
                </Tooltip>
              ) : isRecording ? (
                <button
                  className="record-button recording"
                  onClick={handleStopRecording}
                  disabled={isProcessing}
                  style={{
                    border: 'none',
                    background: 'var(--color-error)',
                    color: 'white'
                  }}
                >
                  <Stop sx={{ fontSize: 32 }} />
                </button>
              ) : null}

              {/* Control Buttons */}
              <Box display="flex" gap={2}>
                {/* Manual text input as fallback */}
                {!isRecording && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const userInput = prompt('Type your message (fallback for speech recognition):');
                      if (userInput && userInput.trim()) {
                        processUserMessage(userInput.trim());
                      }
                    }}
                    disabled={isProcessing}
                    sx={{
                      borderRadius: 'var(--radius-button)',
                      borderColor: 'var(--color-divider)',
                      color: 'var(--color-muted)',
                      '&:hover': {
                        borderColor: 'var(--color-accent)',
                        backgroundColor: 'rgba(79,70,229,0.05)'
                      }
                    }}
                  >
                    ⌨️ Type Message
                  </Button>
                )}

                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleCompleteSession}
                  disabled={isProcessing || conversation.filter(msg => msg.role === 'user').length < 1}
                  sx={{
                    background: 'linear-gradient(135deg, var(--color-success), #059669)',
                    borderRadius: 'var(--radius-button)',
                    boxShadow: 'var(--shadow-card)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      transform: 'translateY(-2px)',
                      boxShadow: 'var(--shadow-float)'
                    },
                    '&:disabled': {
                      background: 'rgba(156,163,175,0.3)',
                      color: 'rgba(156,163,175,0.6)'
                    }
                  }}
                >
                  ✨ Complete Session
                </Button>
              </Box>
            </Box>

            {/* Status Messages */}
            {!isWaitingForUser && !isProcessing && conversation.length > 0 && (
              <Typography variant="body2" sx={{ 
                color: '#4B5563',
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                ⏳ Waiting for AI response...
              </Typography>
            )}
            
            {isWaitingForUser && !isRecording && (
              <Typography variant="body1" sx={{ 
                color: 'var(--color-accent)', 
                fontWeight: 600,
                textAlign: 'center',
                animation: 'slide-in var(--duration-medium) var(--easing)'
              }}>
                {latestAiMessage ? '🎤 Your turn to speak!' : '🚀 Ready to start conversation'}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle>Exit Practice Session?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to exit? Your progress will be lost if you haven't completed the session.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExitDialog(false)}>Cancel</Button>
          <Button onClick={onExit} color="error">
            Exit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};