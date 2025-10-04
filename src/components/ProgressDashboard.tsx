import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  ExpandMore,
  EmojiEvents,
  Schedule,
  Assessment,
  Lightbulb,
  Warning,
  CheckCircle,
  Star,
  LocalFireDepartment,
  BarChart,
  Psychology,
  Speed,
  RecordVoiceOver,
  EmojiObjects,
  Refresh
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { ProgressService } from '../services/progressService.js';
import { ProgressAnalytics } from '../services/progressAnalytics.js';
import { AnimatedProgressRing, ScoreRing, MiniScoreRing } from './AnimatedProgressRing';

// import type { ProgressData } from '../types.js';

interface ProgressDashboardProps {
  onStartPractice: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ onStartPractice }) => {
  const [progressData, setProgressData] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [skillTrends, setSkillTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | false>('overview');

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = () => {
    setIsLoading(true);
    try {
      const data = ProgressService.getProgressData();
      const progressInsights = ProgressAnalytics.getProgressInsights();
      const trends = ProgressAnalytics.getSkillTrendData();
      
      setProgressData(data);
      setInsights(progressInsights);
      setSkillTrends(trends);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'milestone':
        return <EmojiEvents color="primary" />;
      case 'suggestion':
        return <Lightbulb color="info" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'success';
      case 'warning':
        return 'warning';
      case 'milestone':
        return 'primary';
      case 'suggestion':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend: string, value: number) => {
    if (trend === 'improving' || value > 0) return <TrendingUp color="success" />;
    if (trend === 'declining' || value < 0) return <TrendingDown color="error" />;
    return <TrendingFlat color="action" />;
  };

  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const SKILL_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const skillIcons = {
    Grammar: <Psychology />,
    Vocabulary: <EmojiObjects />,
    Fluency: <Speed />,
    Pronunciation: <RecordVoiceOver />,
    Tone: <Assessment />
  };

  const fillerWordTrend = ProgressService.getFillerWordTrend();
  const weeklyProgress = ProgressAnalytics.getWeeklyProgressSummary();
  const sessionComparison = ProgressAnalytics.getSessionComparison();
  const practiceTimeAnalysis = ProgressAnalytics.getPracticeTimeAnalysis();
  const achievementProgress = ProgressAnalytics.getAchievementProgress();

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading your progress...
        </Typography>
      </Box>
    );
  }

  if (!progressData) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, textAlign: 'center' }}>
        <Card>
          <CardContent sx={{ py: 6 }}>
            <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Start Your Progress Journey
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Complete your first practice session to begin tracking your English speaking progress!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={onStartPractice}
            >
              Start First Session
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          py: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Progress Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh data">
            <IconButton onClick={loadProgressData}>
              <Refresh />
            </IconButton>
          </Tooltip>
          {/* Development Helper */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // DevDataGenerator.generateSampleSessions(15); // Removed
              setTimeout(() => loadProgressData(), 500);
            }}
          >
            Generate Sample Data
          </Button>
          <Button
            variant="contained"
            onClick={onStartPractice}
            startIcon={<BarChart />}
          >
            New Session
          </Button>
        </Box>
      </Box>

      {/* Content Container */}
      <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 3, width: '100%' }}>

      {/* Key Insights */}
      {insights.length > 0 && (
        <Card sx={{ mb: 3, mx: { xs: 2, sm: 3, lg: 4 } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Insights
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {insights.map((insight, index) => (
                <Box key={index}>
                  <Alert 
                    severity={getInsightColor(insight.type) as any}
                    icon={getInsightIcon(insight.type)}
                    sx={{ height: '100%' }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {insight.title}
                    </Typography>
                    <Typography variant="body2">
                      {insight.description}
                    </Typography>
                  </Alert>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <Accordion 
        expanded={expandedSection === 'overview'} 
        onChange={handleSectionChange('overview')}
        sx={{ mb: 2, mx: { xs: 2, sm: 3, lg: 4 } }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <Assessment />
            <Typography variant="h6">Overview</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            <Box>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {progressData.overallProgress.totalSessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sessions
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ScoreRing score={progressData.overallProgress.averageScore} label="Average Score" size={100} />
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <Typography variant="h4" color="warning.main">
                    {progressData.overallProgress.totalPracticeTime}
                  </Typography>
                  <Schedule color="action" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Practice Minutes
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <Typography variant="h4" color="error.main">
                    {progressData.streaks.current}
                  </Typography>
                  <LocalFireDepartment color="action" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Day Streak
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Level: <Chip label={formatLevel(progressData.overallProgress.currentLevel)} color="primary" />
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress to next level
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(progressData.overallProgress.averageScore * 10, 100)} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Paper>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Skill Progress Charts */}
      {skillTrends.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'skills'} 
          onChange={handleSectionChange('skills')}
          sx={{ mb: 2, mx: { xs: 2, sm: 3, lg: 4 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <BarChart />
              <Typography variant="h6">Skill Trends</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
              <Box>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Progress Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis domain={[0, 10]} />
                      <RechartsTooltip />
                      {skillTrends.map((skill, index) => (
                        <Line
                          key={skill.skill}
                          type="monotone"
                          dataKey="score"
                          data={skill.sessions}
                          stroke={SKILL_COLORS[index]}
                          strokeWidth={2}
                          name={skill.skill}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>
              <Box>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Current Skill Scores
                  </Typography>
                  <List>
                    {skillTrends.map((skill, index) => (
                      <ListItem key={skill.skill} divider>
                        <ListItemIcon>
                          {skillIcons[skill.skill as keyof typeof skillIcons]}
                        </ListItemIcon>
                        <ListItemText 
                          primary={skill.skill}
                          secondary={`${skill.currentScore.toFixed(1)}/10`}
                        />
                        <Box display="flex" alignItems="center" gap={1}>
                          {getTrendIcon(skill.trend, skill.improvement)}
                          <Typography 
                            variant="body2" 
                            color={skill.improvement > 0 ? 'success.main' : skill.improvement < 0 ? 'error.main' : 'text.secondary'}
                          >
                            {skill.improvement > 0 ? '+' : ''}{skill.improvement}%
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Filler Words Progress */}
      <Accordion 
        expanded={expandedSection === 'filler'} 
        onChange={handleSectionChange('filler')}
        sx={{ mb: 2, mx: { xs: 2, sm: 3, lg: 4 } }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <Speed />
            <Typography variant="h6">Filler Words Analysis</Typography>
            {fillerWordTrend.improvement > 0 && (
              <Chip 
                label={`↓ ${fillerWordTrend.improvement}%`} 
                color="success" 
                size="small" 
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            <Box>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {fillerWordTrend.current}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current (per minute)
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" color="text.secondary">
                  {fillerWordTrend.previous}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Previous 5 Sessions
                </Typography>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                  <Typography 
                    variant="h3" 
                    color={fillerWordTrend.improvement > 0 ? 'success.main' : 'error.main'}
                  >
                    {fillerWordTrend.improvement > 0 ? '↓' : fillerWordTrend.improvement < 0 ? '↑' : '→'}
                    {Math.abs(fillerWordTrend.improvement)}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Improvement
                </Typography>
              </Paper>
            </Box>
          </Box>
          {fillerWordTrend.improvement > 20 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Excellent Progress!
              </Typography>
              <Typography variant="body2">
                You've reduced your filler words by {fillerWordTrend.improvement}% over your last 5 sessions. Keep up the great work!
              </Typography>
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Session History */}
      {progressData.sessionHistory.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'history'} 
          onChange={handleSectionChange('history')}
          sx={{ mb: 2, mx: { xs: 2, sm: 3, lg: 4 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <Schedule />
              <Typography variant="h6">Recent Sessions</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {progressData.sessionHistory.slice(-6).reverse().map((session, index) => (
                <Box key={session.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Chip 
                          label={`${session.score.toFixed(1)}/10`}
                          color={session.score >= 8 ? 'success' : session.score >= 6 ? 'warning' : 'error'}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {session.date.toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {session.scenario}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
                      </Typography>
                      {session.keyImprovements.length > 0 && (
                        <Box mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            Key improvements:
                          </Typography>
                          <Typography variant="body2">
                            {session.keyImprovements.join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Achievements */}
      {achievementProgress.unlockedCount > 0 && (
        <Accordion 
          expanded={expandedSection === 'achievements'} 
          onChange={handleSectionChange('achievements')}
          sx={{ mb: 2, mx: { xs: 2, sm: 3, lg: 4 } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <EmojiEvents />
              <Typography variant="h6">Achievements</Typography>
              <Chip 
                label={`${achievementProgress.unlockedCount}/${achievementProgress.totalAvailable}`}
                color="primary"
                size="small"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Recent Achievements
                </Typography>
                {achievementProgress.recentAchievements.length > 0 ? (
                  <List>
                    {achievementProgress.recentAchievements.map((achievement, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Star color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={achievement.title}
                          secondary={achievement.unlockedAt.toLocaleDateString()}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent achievements
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Next Goals
                </Typography>
                <List>
                  {achievementProgress.nextAchievements.map((achievement, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={achievement.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {achievement.description}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={achievement.progress} 
                              sx={{ mt: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {achievement.progress}% complete
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      </Box>
    </Box>
  );
};