import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  Alert,
  Pagination,
  Avatar,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  PlayArrow,
  Schedule,
  Assessment,
  Star,
  TrendingUp,
  TrendingDown,
  Refresh,
  Visibility,
  VisibilityOff,
  School,
  EmojiEvents
} from '@mui/icons-material';
import { ProgressService } from '../services/progressService.js';
import { ScoreRing, MiniScoreRing } from './AnimatedProgressRing';
// import type { PracticeSession, ProficiencyLevel } from '../types.js';

interface SessionHistoryProps {
  onStartPractice: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ onStartPractice }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | '3months'>('all');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, scoreFilter, dateRange]);

  const loadSessions = () => {
    setIsLoading(true);
    try {
      const allSessions = ProgressService.getAllSessions();
      setSessions(allSessions.reverse()); // Show newest first
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.scenarioId.toLowerCase().includes(query) ||
        session.transcript.toLowerCase().includes(query) ||
        session.feedback.strengths.some(s => s.toLowerCase().includes(query)) ||
        session.feedback.areasForImprovement.some(a => a.toLowerCase().includes(query))
      );
    }

    // Score filter
    if (scoreFilter !== 'all') {
      filtered = filtered.filter(session => {
        const score = session.feedback.overallScore;
        switch (scoreFilter) {
          case 'high': return score >= 8;
          case 'medium': return score >= 6 && score < 8;
          case 'low': return score < 6;
          default: return true;
        }
      });
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
      }

      filtered = filtered.filter(session => session.startTime >= cutoffDate);
    }

    setFilteredSessions(filtered);
    setCurrentPage(1);
  };

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScenarioTitle = (scenarioId: string) => {
    // You might want to import scenarios and match by ID
    return scenarioId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const sessionStats = {
    total: sessions.length,
    averageScore: sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.feedback.overallScore, 0) / sessions.length 
      : 0,
    totalTime: Math.floor(sessions.reduce((sum, s) => sum + s.duration, 0) / 60),
    highScoreSessions: sessions.filter(s => s.feedback.overallScore >= 8).length
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
        <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Loading Session History...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
        <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 8, textAlign: 'center' }}>
          <Card sx={{ maxWidth: 600, mx: 'auto' }}>
            <CardContent sx={{ py: 6 }}>
              <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                No Practice Sessions Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Start practicing to build your session history and track your progress over time!
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={onStartPractice}
                startIcon={<PlayArrow />}
              >
                Start Your First Session
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box 
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          py: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Session History
          </Typography>
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh">
              <IconButton onClick={loadSessions}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              onClick={onStartPractice}
              startIcon={<PlayArrow />}
            >
              New Session
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {sessionStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Sessions
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MiniScoreRing score={sessionStats.averageScore} size={50} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Average Score
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {sessionStats.totalTime}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Minutes Practiced
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {sessionStats.highScoreSessions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Score Sessions
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 3 }}>
        {/* Filters */}
        <Paper elevation={0} sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Search sessions, scenarios, feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Score Range</InputLabel>
              <Select
                value={scoreFilter}
                label="Score Range"
                onChange={(e) => setScoreFilter(e.target.value as any)}
              >
                <MenuItem value="all">All Scores</MenuItem>
                <MenuItem value="high">High (8-10)</MenuItem>
                <MenuItem value="medium">Medium (6-8)</MenuItem>
                <MenuItem value="low">Low (0-6)</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value as any)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="week">Past Week</MenuItem>
                <MenuItem value="month">Past Month</MenuItem>
                <MenuItem value="3months">Past 3 Months</MenuItem>
              </Select>
            </FormControl>

            {(searchQuery || scoreFilter !== 'all' || dateRange !== 'all') && (
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchQuery('');
                  setScoreFilter('all');
                  setDateRange('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Paper>

        {/* Results Summary */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {paginatedSessions.length} of {filteredSessions.length} sessions
        </Typography>

        {/* Session List */}
        <Box sx={{ mb: 4 }}>
          {paginatedSessions.map((session) => (
            <Card key={session.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <MiniScoreRing score={session.feedback.overallScore} size={40} />
                    <Box>
                      <Typography variant="h6">
                        {getScenarioTitle(session.scenarioId)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.startTime.toLocaleDateString()} at {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      icon={<Schedule />}
                      label={formatDuration(session.duration)}
                      size="small"
                      variant="outlined"
                    />
                    <IconButton
                      onClick={() => toggleSessionExpansion(session.id)}
                      size="small"
                    >
                      {expandedSessions.has(session.id) ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Quick Stats */}
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    label={`Grammar: ${(session.feedback.grammarFeedback?.score || 0).toFixed(1)}`}
                    size="small"
                    color={getScoreColor(session.feedback.grammarFeedback?.score || 0)}
                    variant="outlined"
                  />
                  <Chip
                    label={`Vocabulary: ${(session.feedback.vocabularyFeedback?.score || 0).toFixed(1)}`}
                    size="small"
                    color={getScoreColor(session.feedback.vocabularyFeedback?.score || 0)}
                    variant="outlined"
                  />
                  <Chip
                    label={`Fluency: ${(session.feedback.fluencyFeedback?.score || 0).toFixed(1)}`}
                    size="small"
                    color={getScoreColor(session.feedback.fluencyFeedback?.score || 0)}
                    variant="outlined"
                  />
                </Box>

                {/* Strengths Preview */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Key Strengths:</strong> {session.feedback.strengths.slice(0, 2).join(', ')}
                  {session.feedback.strengths.length > 2 && ` (+${session.feedback.strengths.length - 2} more)`}
                </Typography>

                {/* Expanded Details */}
                <Collapse in={expandedSessions.has(session.id)}>
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Transcript Excerpt */}
                  <Typography variant="subtitle2" gutterBottom>
                    Transcript Excerpt:
                  </Typography>
                  <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {session.transcript.substring(0, 200)}
                      {session.transcript.length > 200 && '...'}
                    </Typography>
                  </Paper>

                  {/* Detailed Feedback */}
                  <Typography variant="subtitle2" gutterBottom>
                    All Strengths:
                  </Typography>
                  <List dense>
                    {session.feedback.strengths.map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Star color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>

                  {session.feedback.areasForImprovement.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Areas for Improvement:
                      </Typography>
                      <List dense>
                        {session.feedback.areasForImprovement.map((area, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <TrendingUp color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={area} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              size="large"
            />
          </Box>
        )}

        {filteredSessions.length === 0 && (
          <Alert severity="info" sx={{ mt: 3 }}>
            No sessions match your current filters. Try adjusting your search criteria.
          </Alert>
        )}
      </Box>
    </Box>
  );
};