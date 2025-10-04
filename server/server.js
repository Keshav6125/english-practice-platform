// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables (works locally; hosts inject env at runtime)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ---- Basic safety / parsing ----
app.use(express.json({ limit: '1mb' }));

// ---- CORS (allow only what you set in ALLOWED_ORIGINS) ----
const allowlist = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// If allowlist is empty → allow localhost during dev
if (allowlist.length === 0) {
  allowlist.push('http://localhost:5173');
}

const corsOptions = {
  origin(origin, cb) {
    // allow non-browser or same-origin requests
    if (!origin) return cb(null, true);
    if (allowlist.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight

// ---- Gemini client (server-side only) ----
if (!process.env.GEMINI_API_KEY) {
  console.warn(
    '⚠️  GEMINI_API_KEY is not set. Endpoints will fail until you add it to your server environment.'
  );
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---- Helpers ----
function safeScenario(s) {
  // tolerate missing/partial scenario from client
  const category = s?.category || 'free_topic';
  const title = s?.title || 'General practice';
  const context = s?.context || '';
  return { category, title, context };
}

function ensureModel() {
  // keep your original model; change here if you need another
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// ---- Health check ----
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend proxy is running',
    allowlist,
    time: Date.now(),
  });
});

// ---- Initialize conversation ----
app.post('/api/initialize-conversation', async (req, res) => {
  try {
    const scenario = safeScenario(req.body?.scenario);

    let openingPrompt = '';
    switch (scenario.category) {
      case 'job_interview':
        openingPrompt =
          'You are an HR interviewer. Greet the candidate and ask them to begin with "Tell me about yourself." Be professional and friendly.';
        break;
      case 'presentation':
        openingPrompt =
          'You are a professor. Welcome the student warmly and ask them to introduce their presentation topic. Encourage them to begin.';
        break;
      case 'free_topic':
        openingPrompt =
          'You are a friendly conversation partner. Greet the student and ask what topic they would like to discuss today. Be encouraging.';
        break;
      default:
        openingPrompt = 'You are a helpful conversation partner practicing English with a student.';
    }

    const model = ensureModel();
    const prompt = `${openingPrompt}

Scenario: ${scenario.title}
Context: ${scenario.context}

Start the conversation naturally and appropriately for this scenario. The student just said: "Hello, I'm ready to start practicing."

Keep your response brief (1–2 sentences) and welcoming.`;

    const result = await model.generateContent(prompt);
    const textResponse = result?.response?.text?.() || "Hello! Let's begin our practice session.";

    res.json({ response: textResponse });
  } catch (err) {
    console.error('Error initializing conversation:', err);
    res.status(500).json({ error: 'Failed to initialize conversation' });
  }
});

// ---- Generate conversation response ----
app.post('/api/generate-response', async (req, res) => {
  try {
    const scenario = safeScenario(req.body?.scenario);
    const userMessage = String(req.body?.userMessage ?? '').trim();
    const conversationHistory = Array.isArray(req.body?.conversationHistory)
      ? req.body.conversationHistory
      : [];
    const turnCount = Number.isFinite(req.body?.turnCount) ? Number(req.body.turnCount) : 0;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    let systemPrompt = '';
    switch (scenario.category) {
      case 'job_interview':
        systemPrompt = `You are conducting a professional job interview. Ask relevant interview questions, listen to responses, and ask thoughtful follow-ups.

Common questions:
- Tell me about yourself
- Why should we hire you?
- What are your strengths and weaknesses?
- Describe a challenging situation you handled
- Where do you see yourself in 5 years?
- Why do you want this job?

Adapt to similar scenarios:
- Job descriptions → interviewer
- Casual topics → friendly partner
- Customer service → act as customer
- Workplace → colleague/manager
- Academic → professor/study partner

Be dynamic and realistic.`;
        break;
      default:
        systemPrompt = 'You are a helpful conversation partner practicing English with a student.';
    }

    const historyText = conversationHistory
      .map((m) => `${m.role === 'user' ? 'Student' : 'You'}: ${m.content}`)
      .join('\n');

    const model = ensureModel();
    const prompt = `${systemPrompt}

Scenario: ${scenario.title}
Context: ${scenario.context}

Previous conversation:
${historyText}

Student just said: "${userMessage}"

Guidelines:
- Keep responses conversational and natural (1–2 sentences)
- Ask engaging follow-up questions
- Adapt to the student's level
- Be encouraging and supportive
- Stay in character for the scenario
- If they struggle, gently help them continue

Respond as the conversation partner:`;

    const result = await model.generateContent(prompt);
    const textResponse = result?.response?.text?.() || "That's interesting. Can you tell me more?";

    res.json({ response: textResponse, turnCount });
  } catch (err) {
    console.error('Error generating conversation response:', err);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// ---- Generate feedback ----
app.post('/api/generate-feedback', async (req, res) => {
  try {
    const scenario = safeScenario(req.body?.scenario);
    const transcript = String(req.body?.transcript ?? '').trim();
    const audioAnalysis = req.body?.audioAnalysis;

    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }

    const feedbackPrompt = `Analyze this English speaking practice session and provide detailed feedback in JSON format.

Scenario: ${scenario.title} (${scenario.category})
Student's speech transcript: "${transcript}"
${audioAnalysis ? `Audio analysis: Duration ${audioAnalysis.duration}ms, Speaking rate: ${audioAnalysis.speakingRate} WPM, Pauses: ${audioAnalysis.pauseCount}` : ''}

Provide your response in this exact JSON format only (no prose outside JSON):
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

    const model = ensureModel();
    const result = await model.generateContent(feedbackPrompt);
    const raw = result?.response?.text?.() || '{}';

    // Strip code fences if present
    const clean = raw.replace(/```json\s*|\s*```/g, '').trim();

    let feedbackJson;
    try {
      feedbackJson = JSON.parse(clean);
    } catch (parseErr) {
      console.error('JSON parse failed, returning minimal payload. Raw was:', raw);
      feedbackJson = { overallScore: 5 };
    }

    res.json(feedbackJson);
  } catch (err) {
    console.error('Error generating feedback report:', err);
    res.status(500).json({ error: 'Failed to generate feedback report' });
  }
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`✅ Server listening on :${PORT}`);
  console.log(`✅ Allowed origins: ${allowlist.join(', ')}`);
});
