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
  Alert,
  Divider
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
  EmojiObjects,
  Warning,
  Edit,
  VolumeUp,
  Mood
} from '@mui/icons-material';

export const FeedbackReport = ({ session, onClose, onPracticeAgain }) => {
  const [expandedSection, setExpandedSection] = useState('overview');
  const feedback = session.feedback;

  const handleSectionChange = (panel) => (
    _event,
    isExpanded
  ) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Very Good';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Fair';
    if (score >= 4) return 'Needs Improvement';
    return 'Poor';
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const SkillCard = ({ title, score, icon, details, color = 'primary' }) => (
    <Card className="feedback-card" sx={{ 
      height: '100%', 
      border: `2px solid ${getScoreColor(score) === 'success' ? 'var(--color-success)' :
                            getScoreColor(score) === 'warning' ? 'var(--color-warning)' :
                            'var(--color-error)'}`,
      borderLeft: `4px solid ${getScoreColor(score) === 'success' ? 'var(--color-success)' :
                                getScoreColor(score) === 'warning' ? 'var(--color-warning)' :
                                'var(--color-error)'}`,
      borderRadius: 'var(--radius-card)',
      backgroundColor: 'var(--color-surface)',
      boxShadow: 'var(--shadow-card)',
      transition: 'all var(--duration-short) var(--easing)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 'var(--shadow-float)'
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-button)',
            background: `linear-gradient(135deg, ${getScoreColor(score) === 'success' ? 'var(--color-success)' :
                                                  getScoreColor(score) === 'warning' ? 'var(--color-warning)' :
                                                  'var(--color-error)'}, ${getScoreColor(score) === 'success' ? '#059669' :
                                                                           getScoreColor(score) === 'warning' ? '#D97706' :
                                                                           '#DC2626'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 'var(--shadow-card)'
          }}>
            {icon}
          </Box>
          <Typography variant="h6" sx={{ 
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            color: 'var(--color-text)',
            flex: 1
          }}>
            {title}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Typography variant="h3" sx={{
            color: getScoreColor(score) === 'success' ? 'var(--color-success)' :
                   getScoreColor(score) === 'warning' ? 'var(--color-warning)' :
                   'var(--color-error)',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)'
          }}>
            {score.toFixed(1)}
          </Typography>
          <Typography variant="h5" sx={{ color: 'var(--color-muted)' }}>/10</Typography>
          <Typography variant="body2" sx={{ 
            color: getScoreColor(score) === 'success' ? 'var(--color-success)' :
                   getScoreColor(score) === 'warning' ? 'var(--color-warning)' :
                   'var(--color-error)',
            fontWeight: 600,
            ml: 1
          }}>
            ({getScoreLabel(score)})
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={score * 10}
          sx={{
            mb: 3,
            height: 12,
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(156,163,175,0.2)',
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${getScoreColor(score) === 'success' ? 'var(--color-success)' :
                                                  getScoreColor(score) === 'warning' ? 'var(--color-warning)' :
                                                  'var(--color-error)'}, ${getScoreColor(score) === 'success' ? '#059669' :
                                                                           getScoreColor(score) === 'warning' ? '#D97706' :
                                                                           '#DC2626'})`,
              borderRadius: 'var(--radius-pill)',
              boxShadow: `0 2px 8px ${getScoreColor(score) === 'success' ? 'rgba(16,185,129,0.3)' :
                                     getScoreColor(score) === 'warning' ? 'rgba(245,158,11,0.3)' :
                                     'rgba(239,68,68,0.3)'}`
            }
          }}
        />
        {details}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: 3,
      backgroundColor: 'var(--color-bg)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(6,182,212,0.08))',
        border: '1px solid var(--color-divider)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <CardContent>
          <Typography variant="h3" gutterBottom sx={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center',
            mb: 3
          }}>
            🎯 Practice Session Feedback
          </Typography>
          <Box display="flex" gap={2} mb={2} flexWrap="wrap" justifyContent="center">
            <Chip 
              label={session.scenarioId} 
              sx={{
                backgroundColor: 'rgba(79,70,229,0.1)',
                color: 'var(--color-accent)',
                fontWeight: 600
              }}
            />
            <Chip 
              label={formatDuration(session.duration)} 
              sx={{
                backgroundColor: 'rgba(6,182,212,0.1)',
                color: 'var(--color-accent2)',
                fontWeight: 600
              }}
            />
            <Chip 
              label={`Overall Score: ${feedback.overallScore.toFixed(1)}/10`}
              sx={{
                backgroundColor: getScoreColor(feedback.overallScore) === 'success' ? 'rgba(16,185,129,0.1)' :
                                getScoreColor(feedback.overallScore) === 'warning' ? 'rgba(245,158,11,0.1)' :
                                'rgba(239,68,68,0.1)',
                color: getScoreColor(feedback.overallScore) === 'success' ? 'var(--color-success)' :
                       getScoreColor(feedback.overallScore) === 'warning' ? 'var(--color-warning)' :
                       'var(--color-error)',
                fontWeight: 700,
                fontSize: '1rem'
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Overall Performance Section */}
      <Accordion 
        expanded={expandedSection === 'overview'} 
        onChange={handleSectionChange('overview')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">📊 Overall Performance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            {/* Grammar & Sentence Structure */}
            <SkillCard
              title="Grammar & Sentence Structure"
              score={feedback.grammarFeedback?.score || 0}
              icon={<Psychology color="primary" />}
              details={
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {feedback.grammarFeedback?.correctionsCount || 0} errors found
                  </Typography>
                  {feedback.grammarFeedback?.sentenceStructure && (
                    <Typography variant="caption" color="text.secondary">
                      {feedback.grammarFeedback.sentenceStructure}
                    </Typography>
                  )}
                </Box>
              }
            />
            
            {/* Vocabulary Suggestions */}
            <SkillCard
              title="Vocabulary"
              score={feedback.vocabularyFeedback?.score || 0}
              icon={<EmojiObjects color="primary" />}
              details={
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {feedback.vocabularyFeedback?.suggestions?.length || 0} suggestions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Diversity: {feedback.vocabularyFeedback?.diversityScore || 0}/10
                  </Typography>
                </Box>
              }
            />
            
            {/* Overall Fluency Score */}
            <SkillCard
              title="Overall Fluency Score"
              score={feedback.fluencyScore?.score || feedback.fluencyFeedback?.score || 0}
              icon={<Speed color="primary" />}
              details={
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {feedback.fluencyScore?.speakingRate || feedback.fluencyFeedback?.speakingRate || 0} WPM
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Naturalness: {feedback.fluencyScore?.naturalness || 0}/10
                  </Typography>
                </Box>
              }
            />
            
            {/* Accent & Pronunciation */}
            <SkillCard
              title="Accent & Pronunciation"
              score={feedback.pronunciationFeedback?.score || 0}
              icon={<RecordVoiceOver color="primary" />}
              details={
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {feedback.pronunciationFeedback?.mispronunciations?.length || 0} flagged words
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Clarity: {feedback.pronunciationFeedback?.clarity || 0}/10
                  </Typography>
                </Box>
              }
            />
            
            {/* Tone & Energy */}
            <SkillCard
              title="Tone & Energy"
              score={feedback.toneAndEnergy?.score || feedback.toneFeedback?.score || 0}
              icon={<Mood color="primary" />}
              details={
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Energy: {feedback.toneAndEnergy?.energy || feedback.toneFeedback?.energy || 'moderate'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Confidence: {feedback.toneAndEnergy?.confidence || feedback.toneFeedback?.confidence || 'neutral'}
                  </Typography>
                </Box>
              }
            />
            
            {/* Filler Words Count */}
            <SkillCard
              title="Filler Words"
              score={Math.max(0, 10 - (feedback.fillerWords?.totalCount || 0))} // Inverse score - fewer fillers = higher score
              icon={<VolumeUp color="warning" />}
              details={
                <Box>
                  <Typography variant="body2" color="warning.main" gutterBottom>
                    {feedback.fillerWords?.totalCount || 0} total count
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(feedback.fillerWords?.frequency || 0).toFixed(1)} per minute
                  </Typography>
                </Box>
              }
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Grammar & Sentence Structure Details */}
      {feedback.grammarFeedback?.errors?.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'grammar'} 
          onChange={handleSectionChange('grammar')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <Edit color="error" />
              <Typography variant="h6">✅ Grammar & Sentence Structure - Errors + Corrections</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {feedback.grammarFeedback.errors.map((error, index) => (
                <ListItem key={index} sx={{ bgcolor: 'error.50', mb: 1, borderRadius: 1 }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'error.main' }}>
                      ❌ \"{error.text}\"
                    </Typography>
                    <Typography variant="body1" color="success.main" sx={{ mt: 1 }}>
                      ✅ \"{error.correction}\"
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      💡 {error.explanation}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Vocabulary Suggestions */}
      {feedback.vocabularyFeedback?.suggestions?.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'vocabulary'} 
          onChange={handleSectionChange('vocabulary')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <EmojiObjects color="info" />
              <Typography variant="h6">✅ Vocabulary Suggestions - Better Word Choices</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {feedback.vocabularyFeedback.suggestions.map((suggestion, index) => (
                <ListItem key={index} sx={{ bgcolor: 'info.50', mb: 1, borderRadius: 1 }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1">
                      Instead of <strong>\"{suggestion.original}\"</strong> try <strong style={{ color: '#1976d2' }}>\"{suggestion.suggested}\"</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      💡 {suggestion.reason}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
            {feedback.vocabularyFeedback.betterChoices?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Additional suggestions:</Typography>
                {feedback.vocabularyFeedback.betterChoices.map((choice, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">• {choice}</Typography>
                ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Filler Words Count */}
      <Accordion 
        expanded={expandedSection === 'filler'} 
        onChange={handleSectionChange('filler')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <Warning color="warning" />
            <Typography variant="h6">✅ Filler Words Count - uh, like, you know</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Typography variant="h3" color="warning.main" gutterBottom>
                {feedback.fillerWords?.totalCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total filler words ({(feedback.fillerWords?.frequency || 0).toFixed(1)} per minute)
              </Typography>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Most Common</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(feedback.fillerWords?.types || []).map((filler, index) => (
                  <Chip 
                    key={index}
                    label={`${filler.word} (${filler.count})`}
                    color="warning"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Pronunciation Details */}
      {feedback.pronunciationFeedback?.mispronunciations?.length > 0 && (
        <Accordion 
          expanded={expandedSection === 'pronunciation'} 
          onChange={handleSectionChange('pronunciation')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={2}>
              <RecordVoiceOver color="error" />
              <Typography variant="h6">✅ Accent & Pronunciation - Flagged Mispronunciations</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {feedback.pronunciationFeedback.mispronunciations.map((mispron, index) => (
                <ListItem key={index} sx={{ bgcolor: 'warning.50', mb: 1, borderRadius: 1 }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1">
                      <strong>\"{mispron.word}\"</strong>
                    </Typography>
                    {mispron.yourPronunciation && (
                      <Typography variant="body2" color="error.main">
                        ❌ Your pronunciation: {mispron.yourPronunciation}
                      </Typography>
                    )}
                    <Typography variant="body2" color="success.main">
                      ✅ Correct pronunciation: {mispron.correctPronunciation}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
            {feedback.pronunciationFeedback.accentNotes && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">{feedback.pronunciationFeedback.accentNotes}</Typography>
              </Alert>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Strengths */}
      <Accordion 
        expanded={expandedSection === 'strengths'} 
        onChange={handleSectionChange('strengths')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircle color="success" />
            <Typography variant="h6">💪 Strengths ({feedback.strengths?.length || 0})</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {(feedback.strengths || []).map((strength, index) => (
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

      {/* Areas for Improvement */}
      <Accordion 
        expanded={expandedSection === 'improvements'} 
        onChange={handleSectionChange('improvements')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={2}>
            <TrendingUp color="warning" />
            <Typography variant="h6">🎯 Areas for Improvement ({feedback.areasForImprovement?.length || 0})</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {(feedback.areasForImprovement || []).map((area, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <TrendingUp color="warning" />
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
            <Typography variant="h6">💡 Practical Suggestions ({feedback.suggestions?.length || 0})</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {(feedback.suggestions || []).map((suggestion, index) => (
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
          variant="outlined"
          onClick={onClose}
          size="large"
        >
          Back to Scenarios
        </Button>
        <Button
          variant="contained"
          onClick={onPracticeAgain}
          size="large"
        >
          Practice Again
        </Button>
      </Box>
    </Box>
  );
};