// Core constants for the English Practice Platform

export const ProficiencyLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  NATIVE: 'native'
};

export const ScenarioCategory = {
  FREE_TOPIC: 'free_topic',
  PRESENTATION: 'presentation',
  JOB_INTERVIEW: 'job_interview',
  STORYTELLING: 'storytelling',
  NETWORKING: 'networking',
  GROUP_DISCUSSION: 'group_discussion'
};

export const SessionStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

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

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatar]
 * @property {Date} joinDate
 * @property {number} totalSessions
 * @property {string} currentLevel
 */

/**
 * @typedef {Object} Scenario
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} difficulty
 * @property {number} duration - in minutes
 * @property {string[]} tags
 * @property {string} prompt
 * @property {string} context
 */

/**
 * @typedef {Object} PracticeSession
 * @property {string} id
 * @property {string} userId
 * @property {string} scenarioId
 * @property {Date} startTime
 * @property {Date} [endTime]
 * @property {number} duration - in seconds
 * @property {string} [audioUrl]
 * @property {string} transcript
 * @property {string} aiResponse
 * @property {FeedbackReport} feedback
 * @property {string} status
 */

/**
 * @typedef {Object} FeedbackReport
 * @property {string} id
 * @property {string} sessionId
 * @property {number} overallScore - 0-10
 * @property {GrammarFeedback} grammarFeedback
 * @property {VocabularyFeedback} vocabularyFeedback
 * @property {FluencyFeedback} fluencyFeedback
 * @property {PronunciationFeedback} pronunciationFeedback
 * @property {ToneFeedback} toneFeedback
 * @property {FillerWordAnalysis} fillerWords
 * @property {string[]} suggestions
 * @property {string[]} strengths
 * @property {string[]} areasForImprovement
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} GrammarFeedback
 * @property {number} score - 0-10
 * @property {GrammarError[]} errors
 * @property {number} correctionsCount
 */

/**
 * @typedef {Object} GrammarError
 * @property {string} text
 * @property {string} correction
 * @property {string} explanation
 * @property {Object} position
 * @property {number} position.start
 * @property {number} position.end
 */

/**
 * @typedef {Object} VocabularyFeedback
 * @property {number} score - 0-10
 * @property {VocabularySuggestion[]} suggestions
 * @property {number} diversityScore
 * @property {number} appropriatenessScore
 */

/**
 * @typedef {Object} VocabularySuggestion
 * @property {string} original
 * @property {string} suggested
 * @property {string} reason
 * @property {Object} position
 * @property {number} position.start
 * @property {number} position.end
 */

/**
 * @typedef {Object} FluencyFeedback
 * @property {number} score - 0-10
 * @property {number} speakingRate - words per minute
 * @property {number} pauseFrequency
 * @property {number} hesitationCount
 * @property {number} overallFlow
 */

/**
 * @typedef {Object} PronunciationFeedback
 * @property {number} score - 0-10
 * @property {Mispronunciation[]} mispronunciations
 * @property {number} clarity
 * @property {string} accent
 */

/**
 * @typedef {Object} Mispronunciation
 * @property {string} word
 * @property {string} correctPronunciation
 * @property {Object} position
 * @property {number} position.start
 * @property {number} position.end
 * @property {number} confidence
 */

/**
 * @typedef {Object} ToneFeedback
 * @property {number} score - 0-10
 * @property {string} energy
 * @property {string} confidence
 * @property {number} engagement
 * @property {number} appropriateness
 */

/**
 * @typedef {Object} FillerWordAnalysis
 * @property {number} totalCount
 * @property {number} frequency - per minute
 * @property {FillerWordCount[]} types
 */

/**
 * @typedef {Object} FillerWordCount
 * @property {string} word
 * @property {number} count
 * @property {number[]} positions
 */

/**
 * @typedef {Object} ProgressData
 * @property {string} userId
 * @property {OverallProgress} overallProgress
 * @property {SkillProgress} skillProgress
 * @property {SessionSummary[]} sessionHistory
 * @property {Achievement[]} achievements
 * @property {StreakData} streaks
 */

/**
 * @typedef {Object} OverallProgress
 * @property {string} currentLevel
 * @property {number} totalSessions
 * @property {number} totalPracticeTime - in minutes
 * @property {number} averageScore
 * @property {number} improvement - percentage
 */

/**
 * @typedef {Object} SkillProgress
 * @property {SkillMetric} grammar
 * @property {SkillMetric} vocabulary
 * @property {SkillMetric} fluency
 * @property {SkillMetric} pronunciation
 * @property {SkillMetric} tone
 */

/**
 * @typedef {Object} SkillMetric
 * @property {number} currentScore
 * @property {number} improvement
 * @property {'improving'|'stable'|'declining'} trend
 * @property {Date} lastUpdated
 */

/**
 * @typedef {Object} SessionSummary
 * @property {string} id
 * @property {Date} date
 * @property {string} scenario
 * @property {number} duration
 * @property {number} score
 * @property {string[]} keyImprovements
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 * @property {Date} unlockedAt
 * @property {'practice'|'improvement'|'streak'|'skill'} category
 */

/**
 * @typedef {Object} StreakData
 * @property {number} current
 * @property {number} longest
 * @property {Date} lastPracticeDate
 */

/**
 * @typedef {Object} AudioRecording
 * @property {Blob} blob
 * @property {string} url
 * @property {number} duration
 * @property {Date} timestamp
 */

/**
 * @typedef {Object} SpeechRecognitionConfig
 * @property {string} language
 * @property {boolean} continuous
 * @property {boolean} interimResults
 * @property {number} maxAlternatives
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {string} [error]
 * @property {string} [message]
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {*[]} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {boolean} hasNext
 * @property {boolean} hasPrev
 */

/**
 * @typedef {Object} AppState
 * @property {User|null} user
 * @property {PracticeSession|null} currentSession
 * @property {boolean} isRecording
 * @property {boolean} isProcessing
 * @property {Scenario|null} selectedScenario
 */