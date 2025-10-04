import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Paper,
  Rating,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Error,
  Lightbulb,
  TrendingUp,
  Speed,
  Psychology,
  RecordVoiceOver,
  EmojiObjects
} from '@mui/icons-material';
// import type { PracticeSession as PracticeSessionType } from '../types.js';

interface FeedbackReportProps {
  session: any;
  onClose: () => void;
  onPracticeAgain: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  session,
  onClose,
  onPracticeAgain
}) => {
  const [expandedSection, setExpandedSection] = useState<string | false>('overview');
  const feedback = session.feedback;

  const handleSectionChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Fair';
    if (score >= 4) return 'Needs Improvement';
    return 'Poor';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const SkillCard: React.FC<{
    title: string;
    score: number;
    icon: React.ReactNode;
    details?: React.ReactNode;
  }> = ({ title, score, icon, details }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Rating
            value={score / 2}
            precision={0.1}
            readOnly
            sx={{ color: `${getScoreColor(score)}.main` }}
          />
          <Typography variant="body2" color={`${getScoreColor(score)}.main`}>
            {score.toFixed(1)}/10 ({getScoreLabel(score)})
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={score * 10}
          color={getScoreColor(score)}
          sx={{ mb: 2 }}
        />
        {details}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Practice Session Feedback
          </Typography>
          <Box display="flex" gap={2} mb={2}>
            <Chip label={session.scenarioId} />
            <Chip label={formatDuration(session.duration)} color="primary" />
            <Chip 
              label={`Overall Score: ${feedback.overallScore.toFixed(1)}/10`}
              color={getScoreColor(feedback.overallScore)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Overview Section */}
      <Accordion 
        expanded={expandedSection === 'overview'} 
        onChange={handleSectionChange('overview')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <TrendingUp />
            <Typography variant="h6">Overall Performance</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
            <SkillCard
              title="Grammar"
              score={feedback.grammarFeedback.score}
              icon={<Psychology color="primary" />}
              details={
                <Typography variant="body2" color="text.secondary">
                  {feedback.grammarFeedback.correctionsCount} corrections needed
                </Typography>
              }
            />
            <SkillCard
              title="Vocabulary"
              score={feedback.vocabularyFeedback.score}
              icon={<EmojiObjects color="primary" />}
              details={
                <Typography variant="body2" color="text.secondary">
                  Diversity: {feedback.vocabularyFeedback.diversityScore}/10
                </Typography>
              }
            />
            <SkillCard
              title="Fluency"
              score={feedback.fluencyFeedback.score}
              icon={<Speed color="primary" />}
              details={
                <Typography variant="body2" color="text.secondary">
                  {feedback.fluencyFeedback.speakingRate} WPM
                </Typography>
              }
            />
            <SkillCard
              title="Pronunciation"
              score={feedback.pronunciationFeedback.score}
              icon={<RecordVoiceOver color="primary" />}
              details={
                <Typography variant="body2" color="text.secondary">
                  Clarity: {feedback.pronunciationFeedback.clarity}/10
                </Typography>
              }
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Strengths */}
      <Accordion 
        expanded={expandedSection === 'strengths'} 
        onChange={handleSectionChange('strengths')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircle color="success" />
            <Typography variant="h6">Strengths ({feedback.strengths.length})</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {feedback.strengths.map((strength, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary={strength} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Grammar Analysis */}
      {feedback.grammarFeedback.errors.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'grammar'} 
          onChange={handleSectionChange('grammar')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <Error color="error" />
              <Typography variant="h6">
                Grammar Issues ({feedback.grammarFeedback.errors.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {feedback.grammarFeedback.errors.map((error, index) => (
                <ListItem key={index} sx={{ mb: 1 }}>
                  <Paper sx={{ p: 2, width: '100%' }}>
                    <Typography variant="body2" color="error" gutterBottom>
                      <strong>Error:</strong> "{error.text}"
                    </Typography>
                    <Typography variant="body2" color="success.main" gutterBottom>
                      <strong>Correction:</strong> "{error.correction}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Explanation:</strong> {error.explanation}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Improvement Suggestions */}
      <Accordion 
        expanded={expandedSection === 'improvements'} 
        onChange={handleSectionChange('improvements')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <TrendingUp color="primary" />
            <Typography variant="h6">
              Areas for Improvement ({feedback.areasForImprovement.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {feedback.areasForImprovement.map((area, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <TrendingUp color="primary" />
                </ListItemIcon>
                <ListItemText primary={area} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Suggestions */}
      <Accordion 
        expanded={expandedSection === 'suggestions'} 
        onChange={handleSectionChange('suggestions')}
        sx={{ mb: 3 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <Lightbulb color="info" />
            <Typography variant="h6">
              Suggestions ({feedback.suggestions.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {feedback.suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Lightbulb color="info" />
                </ListItemIcon>
                <ListItemText primary={suggestion} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons */}
      <Box display="flex" gap={2} justifyContent="center">
        <Button 
          variant="contained" 
          size="large"
          onClick={onPracticeAgain}
        >
          Practice Again
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          onClick={onClose}
        >
          View Dashboard
        </Button>
      </Box>
    </Box>
  );
};