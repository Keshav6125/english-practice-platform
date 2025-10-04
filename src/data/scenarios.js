// Constants for scenario categories and proficiency levels
export const ScenarioCategory = {
  FREE_TOPIC: 'free_topic',
  PRESENTATION: 'presentation',
  JOB_INTERVIEW: 'job_interview',
  STORYTELLING: 'storytelling',
  NETWORKING: 'networking',
  GROUP_DISCUSSION: 'group_discussion',
  REALISTIC_ROLEPLAY: 'realistic_roleplay'
};

export const ProficiencyLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  NATIVE: 'native'
};

export const scenarios = [
  // 🟢 Free Topic (Flagship Mode)
  {
    id: 'free_topic_01',
    title: '🟢 Free Topic (Flagship Mode)',
    description: 'Speak on any topic of choice for 2 minutes (e.g., "my favorite movie," "importance of fitness").',
    category: ScenarioCategory.FREE_TOPIC,
    difficulty: ProficiencyLevel.INTERMEDIATE,
    duration: 2,
    tags: ['free choice', 'personal expression', 'creativity', 'spontaneous'],
    prompt: 'Choose any topic you\'re passionate about and speak naturally about it.',
    context: 'This is your flagship practice mode where you can speak freely about any topic that interests you. The AI will listen and ask follow-up questions to keep the conversation flowing. Topics could include your favorite movie, importance of fitness, hobbies, travel experiences, current events, personal interests, or anything you want to discuss. The goal is natural, spontaneous conversation practice.'
  },

  // 📊 Presentation Practice
  {
    id: 'presentation_01',
    title: '📊 Presentation Practice',
    description: 'Explain a concept/project as if presenting in class.',
    category: ScenarioCategory.PRESENTATION,
    difficulty: ProficiencyLevel.INTERMEDIATE,
    duration: 3,
    tags: ['academic', 'explanation', 'public speaking', 'education'],
    prompt: 'Present your topic as if you are giving a class presentation.',
    context: 'You are presenting to a professor and classmates in an academic setting. The professor will listen to your presentation and ask clarifying questions, request elaborations, and provide feedback. Structure your presentation clearly with an introduction, main points, and conclusion. Be prepared to explain concepts in detail and answer questions about your topic.'
  },

  // 💼 Interview Simulation
  {
    id: 'job_interview_01',
    title: '💼 Interview Simulation',
    description: 'Mock HR round practice with common interview questions like "Tell me about yourself" and "Why should we hire you?"',
    category: ScenarioCategory.JOB_INTERVIEW,
    difficulty: ProficiencyLevel.INTERMEDIATE,
    duration: 3,
    tags: ['interview', 'professional', 'career', 'HR questions'],
    prompt: 'You are in a professional job interview setting.',
    context: 'This simulates a real job interview with an HR representative or hiring manager. The interviewer will ask common questions like "Tell me about yourself," "Why should we hire you?" "What are your strengths and weaknesses?" and other typical interview questions. Respond professionally and confidently, and be prepared for follow-up questions based on your answers.'
  },

  // 📖 Storytelling & Personal Expression
  {
    id: 'storytelling_01',
    title: '📖 Storytelling & Personal Expression',
    description: 'Narrate a personal story or incident with clarity and emotion.',
    category: ScenarioCategory.STORYTELLING,
    difficulty: ProficiencyLevel.INTERMEDIATE,
    duration: 3,
    tags: ['storytelling', 'personal experience', 'emotion', 'narrative'],
    prompt: 'Share a personal story or meaningful experience from your life.',
    context: 'Tell a story that had an impact on you - it could be a funny incident, a challenging moment you overcame, a memorable trip, a learning experience, or any meaningful event that shaped you. The listener will show genuine interest and ask follow-up questions about details, emotions, and outcomes. Focus on bringing your story to life with vivid details and emotional expression.'
  },

  // 🤝 Networking Conversation
  {
    id: 'networking_01',
    title: '🤝 Networking Conversation',
    description: 'Practice small talk and introductions with AI simulating a peer or professional.',
    category: ScenarioCategory.NETWORKING,
    difficulty: ProficiencyLevel.INTERMEDIATE,
    duration: 3,
    tags: ['networking', 'small talk', 'professional', 'introductions', 'social skills'],
    prompt: 'You are at a networking event. Practice making connections and engaging in professional small talk.',
    context: 'You are at a professional networking event, conference, or social gathering. Practice introducing yourself, making small talk, asking engaging questions, and building professional relationships. The AI will simulate a friendly professional who is interested in getting to know you. Focus on being personable, professional, and genuinely interested in the conversation.'
  },

  // 👥 Group Discussion Simulation
  {
    id: 'group_discussion_01',
    title: '👥 Group Discussion Simulation',
    description: 'AI plays 2–3 participants. Student argues or presents points clearly.',
    category: ScenarioCategory.GROUP_DISCUSSION,
    difficulty: ProficiencyLevel.ADVANCED,
    duration: 4,
    tags: ['debate', 'discussion', 'argumentation', 'group dynamics', 'critical thinking'],
    prompt: 'Participate in a group discussion where you need to present and defend your viewpoints.',
    context: 'You are participating in a group discussion with 2-3 other people (played by the AI). The discussion will cover various topics where you need to clearly articulate your position, respond to different viewpoints, and engage in constructive debate. The AI will present different perspectives and challenge your ideas to help you practice argumentation and discussion skills in a group setting.'
  },

  // 🎭 Realistic Roleplay Modules
  {
    id: 'realistic_roleplay_01',
    title: '🎭 Realistic Roleplay Modules',
    description: 'AI interviewer/friend: paste a job description or topic to generate tailored questions and responses.',
    category: ScenarioCategory.REALISTIC_ROLEPLAY,
    difficulty: ProficiencyLevel.INTERMEDIATE,
    duration: 4,
    tags: ['roleplay', 'customizable', 'adaptive', 'tailored', 'dynamic', 'job-specific', 'topic-based'],
    prompt: 'Provide a job description, topic, or scenario you want to practice, and the AI will adapt its role accordingly.',
    context: 'This is a dynamic roleplay scenario where you can paste any job description, discussion topic, or specific situation you want to practice. The AI will intelligently adapt its role - becoming an interviewer for job descriptions, a friend for casual topics, a customer for service scenarios, a colleague for workplace situations, or any other appropriate character. Simply provide the context at the start, and the AI will generate tailored questions and responses that match your specific practice needs. Perfect for preparing for real-world situations with customized, relevant practice.',
    isCustomizable: true,
    supportedRoles: ['interviewer', 'friend', 'colleague', 'customer', 'mentor', 'peer', 'expert', 'casual_conversation_partner'],
    customization: {
      allowJobDescription: true,
      allowTopicInput: true,
      allowScenarioDescription: true,
      adaptiveQuestions: true
    }
  }
];

export const getScenariosByCategory = (category) => {
  return scenarios.filter(scenario => scenario.category === category);
};

export const getScenariosByDifficulty = (difficulty) => {
  return scenarios.filter(scenario => scenario.difficulty === difficulty);
};

export const getScenarioById = (id) => {
  return scenarios.find(scenario => scenario.id === id);
};

export const searchScenarios = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return scenarios.filter(scenario => 
    scenario.title.toLowerCase().includes(lowercaseQuery) ||
    scenario.description.toLowerCase().includes(lowercaseQuery) ||
    scenario.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getRandomScenario = (difficulty) => {
  const filteredScenarios = difficulty 
    ? getScenariosByDifficulty(difficulty)
    : scenarios;
  
  const randomIndex = Math.floor(Math.random() * filteredScenarios.length);
  return filteredScenarios[randomIndex];
};