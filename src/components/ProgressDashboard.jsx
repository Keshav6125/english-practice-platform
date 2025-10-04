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

export const ProgressDashboard = ({ onStartPractice }) => {
  const [progressData, setProgressData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [skillTrends, setSkillTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('overview');

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
      console.log('ProgressDashboard loaded data:', data);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (panel) => (
    _event,
    isExpanded
  ) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const getInsightIcon = (type) => {
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

  const getInsightColor = (type) => {
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

  const getTrendIcon = (trend, value) => {
    if (trend === 'improving' || value > 0) return <TrendingUp color="success" />;
    if (trend === 'declining' || value < 0) return <TrendingDown color="error" />;
    return <TrendingFlat color="action" />;
  };

  const formatLevel = (level) => {
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
    <Box sx={{ 
      width: '100%', 
      minHeight: '100%', 
      backgroundColor: 'var(--color-bg)'
    }}>
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          py: 4,
          borderBottom: '1px solid var(--color-divider)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <Typography variant="h3" sx={{ 
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📈 Progress Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={loadProgressData}
              sx={{
                backgroundColor: 'rgba(79,70,229,0.1)',
                color: 'var(--color-accent)',
                '&:hover': {
                  backgroundColor: 'rgba(79,70,229,0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            onClick={onStartPractice}
            startIcon={<BarChart />}
            sx={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
              borderRadius: 'var(--radius-button)',
              boxShadow: 'var(--shadow-card)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5B21B6, #0891B2)',
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-float)'
              }
            }}
          >
            New Session
          </Button>
        </Box>
      </Box>

      {/* Content Container */}
      <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 3, width: '100%' }}>

      {/* Key Insights */}
      {insights.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Insights
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {insights.map((insight, index) => (
                <Box key={index}>
                  <Alert 
                    severity={getInsightColor(insight.type)}
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
        sx={{ mb: 2 }}
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
      {progressData.sessionHistory.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'skills'} 
          onChange={handleSectionChange('skills')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <BarChart />
              <Typography variant="h6">Skill Progress Charts</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
              {/* Line Chart - Progress Over Time */}
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Progress Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData.sessionHistory.slice(-10).map((session, index) => ({
                      session: `Session ${index + 1}`,
                      grammar: session.feedback?.grammarFeedback?.score || 0,
                      vocabulary: session.feedback?.vocabularyFeedback?.score || 0,
                      fluency: session.feedback?.fluencyScore?.score || session.feedback?.fluencyFeedback?.score || 0,
                      pronunciation: session.feedback?.pronunciationFeedback?.score || 0,
                      overall: session.feedback?.overallScore || 0
                    }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis domain={[0, 10]} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="overall" stroke="#8884d8" strokeWidth={3} name="Overall" />
                      <Line type="monotone" dataKey="grammar" stroke="#82ca9d" strokeWidth={2} name="Grammar" />
                      <Line type="monotone" dataKey="vocabulary" stroke="#ffc658" strokeWidth={2} name="Vocabulary" />
                      <Line type="monotone" dataKey="fluency" stroke="#ff7300" strokeWidth={2} name="Fluency" />
                      <Line type="monotone" dataKey="pronunciation" stroke="#8dd1e1" strokeWidth={2} name="Pronunciation" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>
              
              {/* Bar Chart - Current Skill Levels */}
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Current Skill Levels
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={[
                      { skill: 'Grammar', score: progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.grammarFeedback?.score || 0 },
                      { skill: 'Vocabulary', score: progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.vocabularyFeedback?.score || 0 },
                      { skill: 'Fluency', score: progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.fluencyScore?.score || progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.fluencyFeedback?.score || 0 },
                      { skill: 'Pronunciation', score: progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.pronunciationFeedback?.score || 0 },
                      { skill: 'Tone & Energy', score: progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.toneAndEnergy?.score || progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.toneFeedback?.score || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" />
                      <YAxis domain={[0, 10]} />
                      <RechartsTooltip />
                      <Bar dataKey="score" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* Filler Words Progress */}
      {progressData.sessionHistory.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'filler'} 
          onChange={handleSectionChange('filler')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <Speed />
              <Typography variant="h6">Filler Words Analysis</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
              {/* Filler Words Trend Chart */}
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Filler Words Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={progressData.sessionHistory.slice(-8).map((session, index) => ({
                      session: `S${index + 1}`,
                      fillerWords: session.feedback?.fillerWords?.totalCount || 0,
                      frequency: session.feedback?.fillerWords?.frequency || 0
                    }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="fillerWords" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} name="Total Count" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>
              
              {/* Current Stats */}
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Current Session Stats
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                      <Typography variant="h3" color="primary">
                        {progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.fillerWords?.totalCount || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Count
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                      <Typography variant="h3" color="warning.main">
                        {(progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.fillerWords?.frequency || 0).toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Per Minute
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Common Filler Words */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Most Common:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(progressData.sessionHistory[progressData.sessionHistory.length - 1]?.feedback?.fillerWords?.types || []).slice(0, 5).map((filler, index) => (
                        <Chip 
                          key={index}
                          label={`${filler.word} (${filler.count})`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      {progressData.sessionHistory.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'history'} 
          onChange={handleSectionChange('history')}
          sx={{ mb: 2 }}
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
      </Box>
    </Box>
  );
};