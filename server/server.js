import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Gemini client with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend proxy is running' });
});

// Initialize conversation endpoint
app.post('/api/initialize-conversation', async (req, res) => {
  try {
    const { scenario } = req.body;
    
    let openingPrompt = '';
    
    // Scenario-specific conversation starters
    switch (scenario.category) {
      case 'job_interview':
        openingPrompt = `You are an HR interviewer conducting a professional job interview. Start the interview naturally by greeting the candidate and asking them to begin with "Tell me about yourself." Be professional but friendly.`;
        break;
      case 'presentation':
        openingPrompt = `You are a professor and the student is about to give a presentation. Welcome them warmly and ask them to introduce their topic. Encourage them to begin their presentation.`;
        break;
      case 'free_topic':
        openingPrompt = `You are a friendly conversation partner. The student wants to practice speaking on any topic they choose. Warmly greet them and ask what topic they'd like to discuss today. Be encouraging and supportive.`;
        default:
        openingPrompt = `You are a helpful conversation partner practicing English with a student.`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `${openingPrompt}

Scenario: ${scenario.title}
Context: ${scenario.context}

Start the conversation naturally and appropriately for this scenario. The student just said: "Hello, I'm ready to start practicing."

Keep your response brief (1-2 sentences) and welcoming.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text() || 'Hello! Let\'s begin our practice session.';
    
    res.json({ response: textResponse });
  } catch (error) {
    console.error('Error initializing conversation:', error);
    res.status(500).json({ error: 'Failed to initialize conversation' });
  }
});

// Generate conversation response endpoint
app.post('/api/generate-response', async (req, res) => {
  try {
    const { scenario, userMessage, conversationHistory = [], turnCount = 0 } = req.body;
    
    // Build conversation context based on scenario
    let systemPrompt = '';
    
    switch (scenario.category) {
      case 'job_interview':
        systemPrompt = `You are conducting a professional job interview. Ask relevant interview questions, listen to responses, and ask thoughtful follow-up questions. 

Common questions to ask during the interview:
- Tell me about yourself
- Why should we hire you?
- What are your strengths and weaknesses?
- Describe a challenging situation you handled
- Where do you see yourself in 5 years?
- Why do you want this job?

- For job descriptions: Become a professional interviewer asking relevant questions
- For casual topics: Become a friendly conversation partner  
- For customer service scenarios: Become a customer with appropriate concerns
- For workplace situations: Become a colleague or manager
- For academic topics: Become a professor or study partner
- For any other context: Adapt appropriately to the situation

Analyze their input and immediately embody the most suitable character. Ask tailored questions that match the scenario they want to practice. Be dynamic and responsive to create realistic, valuable practice experiences.`;
        break;
        
      default:
        systemPrompt = `You are a helpful conversation partner practicing English with a student.`;
    }

    // Build conversation history text
    const historyText = conversationHistory.map(msg => 
      `${msg.role === 'user' ? 'Student' : 'You'}: ${msg.content}`
    ).join('\n');

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `${systemPrompt}

Scenario: ${scenario.title}
Context: ${scenario.context}

Previous conversation:
${historyText}

Student just said: "${userMessage}"

Guidelines:
- Keep responses conversational and natural (1-2 sentences)
- Ask engaging follow-up questions
- Adapt to the student's level
- Be encouraging and supportive
- Stay in character for the scenario
- If they seem to struggle, gently help them continue

Respond as the conversation partner:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text() || 'That\'s interesting. Can you tell me more?';
    
    res.json({ response: textResponse });
  } catch (error) {
    console.error('Error generating conversation response:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Generate feedback report endpoint
app.post('/api/generate-feedback', async (req, res) => {
  try {
    const { transcript, scenario, audioAnalysis } = req.body;
    
    const feedbackPrompt = `Analyze this English speaking practice session and provide detailed feedback in JSON format.

Scenario: ${scenario.title} (${scenario.category})
Student's speech transcript: "${transcript}"
${audioAnalysis ? `Audio analysis: Duration ${audioAnalysis.duration}ms, Speaking rate: ${audioAnalysis.speakingRate} WPM, Pauses: ${audioAnalysis.pauseCount}` : ''}

Provide your response in this exact JSON format:
{
  "overallScore": 8,
  "grammarFeedback": {
    "score": 7,
    "errors": ["Example error 1", "Example error 2"],
    "correctionsCount": 2,
    "sentenceStructure": "Good sentence variety"
  },
  "vocabularyFeedback": {
    "score": 9,
    "suggestions": ["suggestion1", "suggestion2"],
    "advancedWordsUsed": ["advancedWord1", "advancedWord2"],
    "wordRepetition": ["repeatedWord1"]
  },
  "pronunciationFeedback": {
    "score": 8,
    "clarity": "Clear pronunciation",
    "issues": ["issue1", "issue2"],
    "improvementTips": ["tip1", "tip2"]
  },
  "fluencyFeedback": {
    "score": 7,
    "flow": "Good flow with minor interruptions",
    "pauseCount": 3,
    "fillerWords": ["uh", "um"],
    "improvementTips": ["tip1", "tip2"]
  },
  "conversationFeedback": {
    "score": 9,
    "engagement": "High engagement",
    "responseQuality": "Thoughtful responses",
    "improvementTips": ["tip1", "tip2"]
  },
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"],
  "practiceSuggestions": ["suggestion1", "suggestion2"]
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(feedbackPrompt);
    const response = await result.response;
    const responseText = response.text() || '{}';
    
    // Clean the response text to extract JSON
    const cleanJsonText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();
    
    const feedbackJson = JSON.parse(cleanJsonText);
    
    res.json(feedbackJson);
  } catch (error) {
    console.error('Error generating feedback report:', error);
    res.status(500).json({ error: 'Failed to generate feedback report' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Allowed origins: ${process.env.ALLOWED_ORIGINS || 'All origins allowed'}`);
});