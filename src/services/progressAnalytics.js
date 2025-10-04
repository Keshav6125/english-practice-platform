import { ProgressService } from './progressService';

export class ProgressAnalytics {
  
  /**
   * Get comprehensive progress insights for the dashboard
   */
  static getProgressInsights() {
    const progressData = ProgressService.getProgressData();
    const allSessions = ProgressService.getAllSessions();
    const insights = [];

    if (!progressData || allSessions.length === 0) {
      return [{
        type: 'suggestion',
        title: 'Start Your Journey',
        description: 'Complete your first practice session to begin tracking your progress!'
      }];
    }

    // Overall improvement insight
    if (progressData.overallProgress.improvement > 0) {
      insights.push({
        type: 'improvement',
        title: 'Great Progress!',
        description: `Your average score has improved by ${progressData.overallProgress.improvement}% over recent sessions.`,
        value: progressData.overallProgress.improvement,
        trend: 'up'
      });
    } else if (progressData.overallProgress.improvement < -10) {
      insights.push({
        type: 'warning',
        title: 'Room for Improvement',
        description: `Your scores have declined by ${Math.abs(progressData.overallProgress.improvement)}%. Consider focusing on specific skills.`,
        value: Math.abs(progressData.overallProgress.improvement),
        trend: 'down'
      });
    }

    // Filler words insight
    const fillerWordTrend = ProgressService.getFillerWordTrend();
    if (fillerWordTrend.improvement > 20) {
      insights.push({
        type: 'improvement',
        title: 'Filler Words Reduced!',
        description: `You've reduced filler words by ${fillerWordTrend.improvement}% over the last 5 sessions.`,
        value: fillerWordTrend.improvement,
        trend: 'up'
      });
    }

    // Streak insights
    if (progressData.streaks.current >= 7) {
      insights.push({
        type: 'milestone',
        title: 'Streak Master!',
        description: `Amazing! You're on a ${progressData.streaks.current}-day practice streak.`,
        value: progressData.streaks.current
      });
    } else if (progressData.streaks.current === 0) {
      insights.push({
        type: 'suggestion',
        title: 'Build Your Streak',
        description: 'Start a practice streak today! Consistent practice leads to faster improvement.'
      });
    }

    // Skill-specific insights
    const skills = Object.entries(progressData.skillProgress);
    const improvingSkills = skills.filter(([_, skill]) => skill.trend === 'improving');
    const decliningSkills = skills.filter(([_, skill]) => skill.trend === 'declining');

    if (improvingSkills.length > 0) {
      const topSkill = improvingSkills.sort((a, b) => b[1].improvement - a[1].improvement)[0];
      insights.push({
        type: 'improvement',
        title: `${this.capitalizeSkill(topSkill[0])} is Improving!`,
        description: `Your ${topSkill[0]} has improved by ${topSkill[1].improvement}% recently.`,
        value: topSkill[1].improvement,
        trend: 'up'
      });
    }

    if (decliningSkills.length > 0) {
      const topDeclineSkill = decliningSkills.sort((a, b) => a[1].improvement - b[1].improvement)[0];
      insights.push({
        type: 'suggestion',
        title: `Focus on ${this.capitalizeSkill(topDeclineSkill[0])}`,
        description: `Your ${topDeclineSkill[0]} could use some attention. Try practicing scenarios that emphasize this skill.`
      });
    }

    // Session milestone insights
    const totalSessions = progressData.overallProgress.totalSessions;
    const milestones = [5, 10, 25, 50, 100];
    const nextMilestone = milestones.find(m => m > totalSessions);
    
    if (nextMilestone) {
      const remaining = nextMilestone - totalSessions;
      if (remaining <= 3) {
        insights.push({
          type: 'milestone',
          title: 'Milestone Approaching!',
          description: `You're only ${remaining} session${remaining > 1 ? 's' : ''} away from reaching ${nextMilestone} total sessions!`,
          value: remaining
        });
      }
    }

    return insights.slice(0, 6); // Return top 6 insights
  }

  /**
   * Get skill trend data for charts
   */
  static getSkillTrendData() {
    const allSessions = ProgressService.getAllSessions();
    const progressData = ProgressService.getProgressData();
    
    if (!progressData || allSessions.length === 0) {
      return [];
    }

    const recentSessions = allSessions.slice(-10); // Last 10 sessions
    const skills = ['grammar', 'vocabulary', 'fluency', 'pronunciation', 'tone'];

    return skills.map(skillName => {
      const skillData = progressData.skillProgress[skillName];
      const sessions = recentSessions.map((session, index) => ({
        session: index + 1,
        score: this.getSkillScore(session, skillName),
        date: session.startTime.toLocaleDateString()
      }));

      return {
        skill: this.capitalizeSkill(skillName),
        sessions,
        currentScore: skillData.currentScore,
        trend: skillData.trend,
        improvement: skillData.improvement
      };
    });
  }

  /**
   * Compare current performance with previous sessions
   */
  static getSessionComparison() {
    const allSessions = ProgressService.getAllSessions();
    
    if (allSessions.length < 2) {
      return [];
    }

    const last5Sessions = allSessions.slice(-5);
    const previous5Sessions = allSessions.slice(-10, -5);

    const metrics = [
      {
        metric: 'Overall Score',
        current: this.calculateAverage(last5Sessions, s => s.feedback?.overallScore || 0),
        previous: this.calculateAverage(previous5Sessions, s => s.feedback?.overallScore || 0)
      },
      {
        metric: 'Grammar',
        current: this.calculateAverage(last5Sessions, s => s.feedback?.grammarFeedback?.score || 0),
        previous: this.calculateAverage(previous5Sessions, s => s.feedback?.grammarFeedback?.score || 0)
      },
      {
        metric: 'Vocabulary',
        current: this.calculateAverage(last5Sessions, s => s.feedback?.vocabularyFeedback?.score || 0),
        previous: this.calculateAverage(previous5Sessions, s => s.feedback?.vocabularyFeedback?.score || 0)
      },
      {
        metric: 'Fluency',
        current: this.calculateAverage(last5Sessions, s => s.feedback?.fluencyFeedback?.score || 0),
        previous: this.calculateAverage(previous5Sessions, s => s.feedback?.fluencyFeedback?.score || 0)
      },
      {
        metric: 'Filler Words/min',
        current: this.calculateAverage(last5Sessions, s => s.feedback?.fillerWords?.frequency || 0),
        previous: this.calculateAverage(previous5Sessions, s => s.feedback?.fillerWords?.frequency || 0)
      }
    ];

    return metrics.map(metric => {
      const change = metric.current - metric.previous;
      const changePercent = metric.previous > 0 ? (change / metric.previous) * 100 : 0;
      
      let changeType = 'stable';
      
      // For filler words, lower is better
      if (metric.metric === 'Filler Words/min') {
        if (changePercent < -5) changeType = 'improvement';
        else if (changePercent > 5) changeType = 'decline';
      } else {
        if (changePercent > 5) changeType = 'improvement';
        else if (changePercent < -5) changeType = 'decline';
      }

      return {
        ...metric,
        change: Math.round(changePercent * 10) / 10,
        changeType
      };
    });
  }

  /**
   * Get practice time analysis
   */
  static getPracticeTimeAnalysis() {
    const allSessions = ProgressService.getAllSessions();
    
    if (allSessions.length === 0) {
      return {
        totalMinutes: 0,
        averageSessionLength: 0,
        longestSession: 0,
        recentActivity: []
      };
    }

    const totalMinutes = Math.round(allSessions.reduce((sum, s) => sum + s.duration, 0) / 60);
    const averageSessionLength = Math.round((totalMinutes / allSessions.length) * 10) / 10;
    const longestSession = Math.round(Math.max(...allSessions.map(s => s.duration)) / 60);

    // Group recent sessions by date
    const last14Days = allSessions.filter(session => {
      const daysDiff = (Date.now() - session.startTime.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 14;
    });

    const activityByDate = new Map();
    
    last14Days.forEach(session => {
      const dateKey = session.startTime.toLocaleDateString();
      const existing = activityByDate.get(dateKey) || { minutes: 0, sessions: 0 };
      activityByDate.set(dateKey, {
        minutes: existing.minutes + Math.round(session.duration / 60),
        sessions: existing.sessions + 1
      });
    });

    const recentActivity = Array.from(activityByDate.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days with activity

    return {
      totalMinutes,
      averageSessionLength,
      longestSession,
      recentActivity
    };
  }

  /**
   * Get achievement progress
   */
  static getAchievementProgress() {
    const achievements = ProgressService.getAchievements();
    const allSessions = ProgressService.getAllSessions();
    const progressData = ProgressService.getProgressData();

    const recentAchievements = achievements
      .filter(a => {
        const daysSince = (Date.now() - a.unlockedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      })
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, 3);

    // Calculate next possible achievements
    const nextAchievements = [];
    const sessionCount = allSessions.length;
    
    // Session milestones
    const milestones = [5, 10, 25, 50, 100];
    const nextMilestone = milestones.find(m => m > sessionCount);
    if (nextMilestone) {
      nextAchievements.push({
        title: `${nextMilestone} Sessions`,
        description: `Complete ${nextMilestone} practice sessions`,
        progress: Math.round((sessionCount / nextMilestone) * 100)
      });
    }

    // Perfect score achievement
    if (!achievements.some(a => a.id === 'perfect_score')) {
      const highestScore = allSessions.length > 0 
        ? Math.max(...allSessions.map(s => s.feedback?.overallScore || 0)) 
        : 0;
      nextAchievements.push({
        title: 'Excellence',
        description: 'Achieve a perfect score of 9+',
        progress: Math.round((highestScore / 9) * 100)
      });
    }

    // Improvement achievement
    if (!achievements.some(a => a.id === 'great_improvement') && progressData) {
      const improvement = Math.max(0, progressData.overallProgress?.improvement || 0);
      nextAchievements.push({
        title: 'Rising Star',
        description: 'Improve average score by 20%',
        progress: Math.min(100, Math.round((improvement / 20) * 100))
      });
    }

    return {
      unlockedCount: achievements.length,
      totalAvailable: 15, // Estimated total achievements
      recentAchievements: recentAchievements.map(a => ({
        title: a.title,
        unlockedAt: a.unlockedAt
      })),
      nextAchievements: nextAchievements.slice(0, 3)
    };
  }

  /**
   * Get weekly progress summary
   */
  static getWeeklyProgressSummary() {
    const allSessions = ProgressService.getAllSessions();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekSessions = allSessions.filter(s => s.startTime >= oneWeekAgo);
    const lastWeekSessions = allSessions.filter(s => s.startTime >= twoWeeksAgo && s.startTime < oneWeekAgo);

    const sessionsThisWeek = thisWeekSessions.length;
    const averageScoreThisWeek = thisWeekSessions.length > 0
      ? thisWeekSessions.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) / thisWeekSessions.length
      : 0;
    const totalPracticeTimeThisWeek = Math.round(thisWeekSessions.reduce((sum, s) => sum + s.duration, 0) / 60);

    const lastWeekSessionCount = lastWeekSessions.length;
    const lastWeekAverageScore = lastWeekSessions.length > 0
      ? lastWeekSessions.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) / lastWeekSessions.length
      : 0;
    const lastWeekPracticeTime = Math.round(lastWeekSessions.reduce((sum, s) => sum + s.duration, 0) / 60);

    return {
      sessionsThisWeek,
      averageScoreThisWeek: Math.round(averageScoreThisWeek * 10) / 10,
      totalPracticeTimeThisWeek,
      comparisonWithLastWeek: {
        sessions: sessionsThisWeek - lastWeekSessionCount,
        score: Math.round((averageScoreThisWeek - lastWeekAverageScore) * 10) / 10,
        time: totalPracticeTimeThisWeek - lastWeekPracticeTime
      }
    };
  }

  /**
   * Helper method to get skill score from session
   */
  static getSkillScore(session, skill) {
    switch (skill) {
      case 'grammar':
        return session.feedback?.grammarFeedback?.score || 0;
      case 'vocabulary':
        return session.feedback?.vocabularyFeedback?.score || 0;
      case 'fluency':
        return session.feedback?.fluencyFeedback?.score || 0;
      case 'pronunciation':
        return session.feedback?.pronunciationFeedback?.score || 0;
      case 'tone':
        return session.feedback?.toneFeedback?.score || 0;
      default:
        return 0;
    }
  }

  /**
   * Helper method to calculate average
   */
  static calculateAverage(sessions, getValue) {
    if (sessions.length === 0) return 0;
    
    const sum = sessions.reduce((total, session) => total + getValue(session), 0);
    return Math.round((sum / sessions.length) * 10) / 10;
  }

  /**
   * Helper method to capitalize skill names
   */
  static capitalizeSkill(skill) {
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  }
}