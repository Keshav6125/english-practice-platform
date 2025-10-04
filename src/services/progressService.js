export class ProgressService {
  static STORAGE_KEY = 'english-practice-sessions';
  static ACHIEVEMENTS_KEY = 'english-practice-achievements';
  static USER_PROGRESS_KEY = 'english-practice-user-progress';

  /**
   * Save a completed practice session
   */
  static saveSession(session) {
    try {
      console.log('ProgressService.saveSession called with:', session);
      
      const sessions = this.getAllSessions();
      console.log('Current sessions count:', sessions.length);
      
      sessions.push(session);
      
      // Keep only the last 100 sessions to prevent storage overflow
      const recentSessions = sessions.slice(-100);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentSessions));
      console.log('Session saved to localStorage. New count:', recentSessions.length);
      
      // Update progress data after saving session
      this.updateProgressData(session);
      console.log('Progress data updated');
      
      // Check for new achievements
      this.checkAndUnlockAchievements(session, recentSessions);
      console.log('Achievement check completed');
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  /**
   * Get all saved sessions
   */
  static getAllSessions() {
    try {
      const sessionsJson = localStorage.getItem(this.STORAGE_KEY);
      if (!sessionsJson) return [];
      
      const sessions = JSON.parse(sessionsJson);
      
      // Convert date strings back to Date objects
      return sessions.map((session) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
        feedback: {
          ...session.feedback,
          createdAt: new Date(session.feedback.createdAt)
        }
      }));
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  /**
   * Get sessions from the last N days
   */
  static getRecentSessions(days = 30) {
    const sessions = this.getAllSessions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return sessions.filter(session => session.startTime >= cutoffDate);
  }

  /**
   * Get last N sessions
   */
  static getLastSessions(count = 5) {
    const sessions = this.getAllSessions();
    return sessions.slice(-count);
  }

  /**
   * Update overall progress data
   */
  static updateProgressData(latestSession) {
    try {
      const allSessions = this.getAllSessions();
      const progressData = this.calculateProgressData(allSessions);
      
      localStorage.setItem(this.USER_PROGRESS_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.error('Failed to update progress data:', error);
    }
  }

  /**
   * Get current progress data
   */
  static getProgressData() {
    try {
      const progressJson = localStorage.getItem(this.USER_PROGRESS_KEY);
      if (!progressJson) {
        // Calculate initial progress data if not exists
        const sessions = this.getAllSessions();
        if (sessions.length > 0) {
          const progressData = this.calculateProgressData(sessions);
          localStorage.setItem(this.USER_PROGRESS_KEY, JSON.stringify(progressData));
          return progressData;
        }
        return null;
      }
      
      const progress = JSON.parse(progressJson);
      
      // Convert date strings back to Date objects
      return {
        ...progress,
        overallProgress: {
          ...progress.overallProgress
        },
        skillProgress: {
          grammar: { ...progress.skillProgress.grammar, lastUpdated: new Date(progress.skillProgress.grammar.lastUpdated) },
          vocabulary: { ...progress.skillProgress.vocabulary, lastUpdated: new Date(progress.skillProgress.vocabulary.lastUpdated) },
          fluency: { ...progress.skillProgress.fluency, lastUpdated: new Date(progress.skillProgress.fluency.lastUpdated) },
          pronunciation: { ...progress.skillProgress.pronunciation, lastUpdated: new Date(progress.skillProgress.pronunciation.lastUpdated) },
          tone: { ...progress.skillProgress.tone, lastUpdated: new Date(progress.skillProgress.tone.lastUpdated) }
        },
        sessionHistory: progress.sessionHistory.map((session) => ({
          ...session,
          date: new Date(session.date)
        })),
        achievements: progress.achievements.map((achievement) => ({
          ...achievement,
          unlockedAt: new Date(achievement.unlockedAt)
        })),
        streaks: {
          ...progress.streaks,
          lastPracticeDate: new Date(progress.streaks.lastPracticeDate)
        }
      };
    } catch (error) {
      console.error('Failed to load progress data:', error);
      return null;
    }
  }

  /**
   * Calculate comprehensive progress data from sessions
   */
  static calculateProgressData(sessions) {
    if (sessions.length === 0) {
      return this.getInitialProgressData();
    }

    const recentSessions = sessions.slice(-10);
    const totalPracticeTime = sessions.reduce((total, session) => total + session.duration, 0);
    const averageScore = sessions.reduce((sum, session) => sum + session.feedback.overallScore, 0) / sessions.length;

    // Calculate skill improvements
    const skillProgress = this.calculateSkillProgress(sessions);
    
    // Calculate overall improvement (comparing last 5 sessions to previous 5)
    const improvement = this.calculateImprovement(sessions);

    // Calculate streaks
    const streaks = this.calculateStreaks(sessions);

    // Create session summaries for history
    const sessionHistory = recentSessions.map(session => ({
      id: session.id,
      date: session.startTime,
      scenario: session.scenarioId,
      duration: session.duration,
      score: session.feedback.overallScore,
      keyImprovements: session.feedback.strengths.slice(0, 2)
    }));

    const overallProgress = {
      currentLevel: this.calculateCurrentLevel(averageScore),
      totalSessions: sessions.length,
      totalPracticeTime: Math.floor(totalPracticeTime / 60), // Convert to minutes
      averageScore,
      improvement
    };

    // Get achievements
    const achievements = this.getAchievements();

    return {
      userId: 'current_user',
      overallProgress,
      skillProgress,
      sessionHistory,
      achievements,
      streaks
    };
  }

  /**
   * Calculate improvement percentage comparing recent sessions to older ones
   */
  static calculateImprovement(sessions) {
    if (sessions.length < 6) return 0;

    const recentAvg = sessions.slice(-5).reduce((sum, s) => sum + s.feedback.overallScore, 0) / 5;
    const olderAvg = sessions.slice(-10, -5).reduce((sum, s) => sum + s.feedback.overallScore, 0) / 5;
    
    if (olderAvg === 0) return 0;
    
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  }

  /**
   * Calculate skill-specific progress and trends
   */
  static calculateSkillProgress(sessions) {
    const calculateSkillMetric = (getScore) => {
      const scores = sessions.map(getScore);
      const currentScore = scores[scores.length - 1] || 0;
      
      // Calculate improvement over last 10 sessions
      let improvement = 0;
      if (scores.length >= 6) {
        const recentAvg = scores.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const olderAvg = scores.slice(-10, -5).reduce((a, b) => a + b, 0) / 5;
        if (olderAvg > 0) {
          improvement = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
        }
      }

      // Determine trend
      let trend = 'stable';
      if (improvement > 5) trend = 'improving';
      else if (improvement < -5) trend = 'declining';

      return {
        currentScore,
        improvement,
        trend,
        lastUpdated: new Date()
      };
    };

    return {
      grammar: calculateSkillMetric(s => s.feedback?.grammarFeedback?.score || 0),
      vocabulary: calculateSkillMetric(s => s.feedback?.vocabularyFeedback?.score || 0),
      fluency: calculateSkillMetric(s => s.feedback?.fluencyFeedback?.score || 0),
      pronunciation: calculateSkillMetric(s => s.feedback?.pronunciationFeedback?.score || 0),
      tone: calculateSkillMetric(s => s.feedback?.toneFeedback?.score || 0)
    };
  }

  /**
   * Calculate practice streaks
   */
  static calculateStreaks(sessions) {
    if (sessions.length === 0) {
      return {
        current: 0,
        longest: 0,
        lastPracticeDate: new Date()
      };
    }

    const sortedSessions = sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const lastSession = sortedSessions[sortedSessions.length - 1];
    
    // Group sessions by date
    const sessionsByDate = new Map();
    sortedSessions.forEach(session => {
      const dateKey = session.startTime.toDateString();
      if (!sessionsByDate.has(dateKey)) {
        sessionsByDate.set(dateKey, []);
      }
      sessionsByDate.get(dateKey).push(session);
    });

    const practiceDates = Array.from(sessionsByDate.keys()).sort();
    
    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // Calculate streaks
    for (let i = 0; i < practiceDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(practiceDates[i - 1]);
        const currDate = new Date(practiceDates[i]);
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Update current streak if this extends to today or yesterday
      if (practiceDates[i] === today || practiceDates[i] === yesterday) {
        currentStreak = tempStreak;
      }
    }

    // If last practice was more than 1 day ago, current streak is 0
    const lastPracticeDate = new Date(practiceDates[practiceDates.length - 1]);
    const daysSinceLastPractice = Math.floor((Date.now() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastPractice > 1) {
      currentStreak = 0;
    }

    return {
      current: currentStreak,
      longest: longestStreak,
      lastPracticeDate: lastSession.startTime
    };
  }

  /**
   * Determine current proficiency level based on average score
   */
  static calculateCurrentLevel(averageScore) {
    if (averageScore >= 8.5) return 'advanced';
    if (averageScore >= 7) return 'intermediate';
    return 'beginner';
  }

  /**
   * Get initial progress data for new users
   */
  static getInitialProgressData() {
    return {
      userId: 'current_user',
      overallProgress: {
        currentLevel: 'beginner',
        totalSessions: 0,
        totalPracticeTime: 0,
        averageScore: 0,
        improvement: 0
      },
      skillProgress: {
        grammar: { currentScore: 0, improvement: 0, trend: 'stable', lastUpdated: new Date() },
        vocabulary: { currentScore: 0, improvement: 0, trend: 'stable', lastUpdated: new Date() },
        fluency: { currentScore: 0, improvement: 0, trend: 'stable', lastUpdated: new Date() },
        pronunciation: { currentScore: 0, improvement: 0, trend: 'stable', lastUpdated: new Date() },
        tone: { currentScore: 0, improvement: 0, trend: 'stable', lastUpdated: new Date() }
      },
      sessionHistory: [],
      achievements: [],
      streaks: {
        current: 0,
        longest: 0,
        lastPracticeDate: new Date()
      }
    };
  }

  /**
   * Check and unlock achievements based on progress
   */
  static checkAndUnlockAchievements(latestSession, allSessions) {
    const existingAchievements = this.getAchievements();
    const existingIds = new Set(existingAchievements.map(a => a.id));
    const newAchievements = [];

    // First Session Achievement
    if (allSessions.length === 1 && !existingIds.has('first_session')) {
      newAchievements.push({
        id: 'first_session',
        title: 'First Steps',
        description: 'Completed your first practice session!',
        icon: '🎯',
        unlockedAt: new Date(),
        category: 'practice'
      });
    }

    // Perfect Score Achievement
    if (latestSession.feedback.overallScore >= 9 && !existingIds.has('perfect_score')) {
      newAchievements.push({
        id: 'perfect_score',
        title: 'Excellence',
        description: 'Achieved a perfect score of 9+ in a session!',
        icon: '⭐',
        unlockedAt: new Date(),
        category: 'skill'
      });
    }

    // Session Milestones
    const milestones = [5, 10, 25, 50, 100];
    milestones.forEach(milestone => {
      const achievementId = `sessions_${milestone}`;
      if (allSessions.length >= milestone && !existingIds.has(achievementId)) {
        newAchievements.push({
          id: achievementId,
          title: `${milestone} Sessions`,
          description: `Completed ${milestone} practice sessions!`,
          icon: milestone >= 50 ? '🏆' : '🎖️',
          unlockedAt: new Date(),
          category: 'practice'
        });
      }
    });

    // Improvement Achievement
    const progressData = this.getProgressData();
    if (progressData && progressData.overallProgress.improvement >= 20 && !existingIds.has('great_improvement')) {
      newAchievements.push({
        id: 'great_improvement',
        title: 'Rising Star',
        description: 'Improved your average score by 20%!',
        icon: '📈',
        unlockedAt: new Date(),
        category: 'improvement'
      });
    }

    // Save new achievements
    if (newAchievements.length > 0) {
      const allAchievements = [...existingAchievements, ...newAchievements];
      localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(allAchievements));
    }
  }

  /**
   * Get all unlocked achievements
   */
  static getAchievements() {
    try {
      const achievementsJson = localStorage.getItem(this.ACHIEVEMENTS_KEY);
      if (!achievementsJson) return [];
      
      const achievements = JSON.parse(achievementsJson);
      return achievements.map((achievement) => ({
        ...achievement,
        unlockedAt: new Date(achievement.unlockedAt)
      }));
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return [];
    }
  }

  /**
   * Clear all progress data (for testing or reset)
   */
  static clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ACHIEVEMENTS_KEY);
    localStorage.removeItem(this.USER_PROGRESS_KEY);
    console.log('All progress data cleared');
  }

  /**
   * Remove any test/sample sessions and keep only real user sessions
   */
  static clearTestData() {
    try {
      const sessions = this.getAllSessions();
      console.log('Before filtering:', sessions.length, 'sessions');
      
      // Filter out any sessions that might be test data
      const realSessions = sessions.filter(session => {
        // More lenient filtering - only remove obvious test data
        const hasValidTranscript = session.transcript && session.transcript.length > 3;
        const hasReasonableDuration = session.duration > 10; // At least 10 seconds
        const notObviousTest = !session.transcript.toLowerCase().includes('this is a test');
        const hasValidId = session.id && !session.id.toLowerCase().includes('test');
        
        const isValid = hasValidTranscript && hasReasonableDuration && notObviousTest && hasValidId;
        
        if (!isValid) {
          console.log('Filtering out session:', {
            id: session.id,
            transcriptLength: session.transcript?.length || 0,
            duration: session.duration,
            transcript: session.transcript?.substring(0, 50) + '...',
            reason: !hasValidTranscript ? 'invalid transcript' : 
                    !hasReasonableDuration ? 'too short duration' : 
                    !notObviousTest ? 'contains test content' : 'invalid ID'
          });
        }
        
        return isValid;
      });
      
      console.log('After filtering:', realSessions.length, 'sessions');
      
      // Save filtered sessions
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(realSessions));
      
      // Recalculate progress data
      if (realSessions.length > 0) {
        const progressData = this.calculateProgressData(realSessions);
        localStorage.setItem(this.USER_PROGRESS_KEY, JSON.stringify(progressData));
      } else {
        localStorage.removeItem(this.USER_PROGRESS_KEY);
      }
      
      console.log(`Session filtering complete: ${sessions.length} -> ${realSessions.length}`);
      return realSessions.length;
    } catch (error) {
      console.error('Failed to clear test data:', error);
      return 0;
    }
  }

  /**
   * Get filler word trend analysis
   */
  static getFillerWordTrend(sessions = 5) {
    const allSessions = this.getAllSessions();
    if (allSessions.length < 2) {
      return { current: 0, previous: 0, improvement: 0 };
    }

    const recentSessions = allSessions.slice(-sessions);
    const previousSessions = allSessions.slice(-(sessions * 2), -sessions);

    const currentAvg = recentSessions.reduce((sum, s) => sum + (s.feedback?.fillerWords?.frequency || 0), 0) / recentSessions.length;
    const previousAvg = previousSessions.length > 0 
      ? previousSessions.reduce((sum, s) => sum + (s.feedback?.fillerWords?.frequency || 0), 0) / previousSessions.length 
      : currentAvg;

    const improvement = previousAvg > 0 ? Math.round(((previousAvg - currentAvg) / previousAvg) * 100) : 0;

    return {
      current: Math.round(currentAvg * 10) / 10,
      previous: Math.round(previousAvg * 10) / 10,
      improvement
    };
  }
}