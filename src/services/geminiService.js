import { GoogleGenerativeAI } from '@google/generative-ai';

// Energy and Confidence level constants
export const EnergyLevel = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
};

export const ConfidenceLevel = {
  VERY_HESITANT: 'very_hesitant',
  HESITANT: 'hesitant',
  NEUTRAL: 'neutral',
  CONFIDENT: 'confident',
  VERY_CONFIDENT: 'very_confident'
};

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export class GeminiService {
  // Initialize conversation with scenario-specific opening
  static async initializeConversation(scenario) {
    try {
      const response = await fetch(`${API_BASE_URL}/initialize-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error initializing conversation:', error);
      throw new Error('Failed to initialize conversation');
    }
  }

  // Generate AI response for ongoing conversation
  static async generateConversationResponse(
    scenario,
    userMessage,
    conversationHistory = [],
    turnCount = 0
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          userMessage,
          conversationHistory,
          turnCount
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating conversation response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  // For speech transcription, we'll rely on browser Speech Recognition API
  static async transcribeAudio(audioBlob) {
    throw new Error('Audio transcription not implemented for Gemini. Please use browser speech recognition.');
  }

  // Generate comprehensive feedback report
  static async generateFeedbackReport(transcript, scenario, audioAnalysis) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          scenario,
          audioAnalysis
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const feedbackJson = await response.json();
      
      // Create feedback report with updated structure
      const feedbackReport = {
        id: `feedback_${Date.now()}`,
        sessionId: '',
        overallScore: feedbackJson.overallScore || 5,
        
        // Grammar & Sentence Structure
        grammarFeedback: {
          score: feedbackJson.grammarFeedback?.score || 5,
          errors: feedbackJson.grammarFeedback?.errors || [],
          correctionsCount: feedbackJson.grammarFeedback?.correctionsCount || 0,
          sentenceStructure: feedbackJson.grammarFeedback?.sentenceStructure || "Good sentence variety"
        },
        
        // Vocabulary Suggestions
        vocabularyFeedback: {
          score: feedbackJson.vocabularyFeedback?.score || 5,
          suggestions: feedbackJson.vocabularyFeedback?.suggestions || [],
          advancedWordsUsed: feedbackJson.vocabularyFeedback?.advancedWordsUsed || [],
          wordRepetition: feedbackJson.vocabularyFeedback?.wordRepetition || []
        },
        
        // Pronunciation Feedback
        pronunciationFeedback: {
          score: feedbackJson.pronunciationFeedback?.score || 5,
          clarity: feedbackJson.pronunciationFeedback?.clarity || "Clear pronunciation",
          issues: feedbackJson.pronunciationFeedback?.issues || [],
          improvementTips: feedbackJson.pronunciationFeedback?.improvementTips || []
        },
        
        // Fluency Feedback
        fluencyFeedback: {
          score: feedbackJson.fluencyFeedback?.score || 5,
          flow: feedbackJson.fluencyFeedback?.flow || "Good flow",
          pauseCount: feedbackJson.fluencyFeedback?.pauseCount || 0,
          fillerWords: feedbackJson.fluencyFeedback?.fillerWords || [],
          improvementTips: feedbackJson.fluencyFeedback?.improvementTips || []
        },
        
        // Conversation Feedback
        conversationFeedback: {
          score: feedbackJson.conversationFeedback?.score || 5,
          engagement: feedbackJson.conversationFeedback?.engagement || "Good engagement",
          responseQuality: feedbackJson.conversationFeedback?.responseQuality || "Good responses",
          improvementTips: feedbackJson.conversationFeedback?.improvementTips || []
        },
        
        // Overall Feedback
        strengths: feedbackJson.strengths || [],
        areasForImprovement: feedbackJson.areasForImprovement || [],
        practiceSuggestions: feedbackJson.practiceSuggestions || []
      };
      
      return feedbackReport;
    } catch (error) {
      console.error('Error generating feedback report:', error);
      throw new Error('Failed to generate feedback report');
    }
  }
}