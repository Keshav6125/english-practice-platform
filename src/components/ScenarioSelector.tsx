import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Pagination,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import { Search, PlayArrow, Timer, School, FilterList } from '@mui/icons-material';
import { scenarios, getScenariosByCategory, getScenariosByDifficulty, searchScenarios, ScenarioCategory, ProficiencyLevel } from '../data/scenarios.js';
// import type { Scenario } from '../types';
// import { ScenarioCategory, ProficiencyLevel } from '../types';

interface ScenarioSelectorProps {
  onScenarioSelect: (scenario: any) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ onScenarioSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  // Filter scenarios based on search criteria
  const getFilteredScenarios = () => {
    let filtered = scenarios;

    if (searchQuery.trim()) {
      filtered = searchScenarios(searchQuery);
    }

    if (selectedCategory) {
      filtered = filtered.filter(scenario => scenario.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(scenario => scenario.difficulty === selectedDifficulty);
    }

    return filtered;
  };

  const filteredScenarios = getFilteredScenarios();
  const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage);
  const paginatedScenarios = filteredScenarios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const formatCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const ScenarioCard: React.FC<{ scenario: any }> = ({ scenario }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Icon and Category */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <School color="primary" sx={{ fontSize: 32 }} />
          <Chip 
            label={scenario.difficulty}
            size="small"
            color={getDifficultyColor(scenario.difficulty)}
          />
        </Box>

        {/* Title */}
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, minHeight: 48 }}>
          {scenario.title}
        </Typography>
        
        {/* Description - One line */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2, 
            minHeight: 40,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {scenario.description}
        </Typography>

        {/* Tags */}
        <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
          <Chip 
            label={formatCategoryLabel(scenario.category)}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          {scenario.tags.slice(0, 2).map((tag, index) => (
            <Chip 
              key={index} 
              label={tag} 
              size="small" 
              variant="outlined" 
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      </CardContent>
      
      {/* Footer with duration and start button */}
      <Box sx={{ p: 3, pt: 0, mt: 'auto' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {scenario.duration} min session
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          fullWidth
          startIcon={<PlayArrow />}
          onClick={() => onScenarioSelect(scenario)}
          sx={{ 
            borderRadius: 2,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Start
        </Button>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box mb={6} textAlign="center" sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 4, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Choose Your Practice Scenario
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Select a real-life scenario to practice your English conversation skills with AI
        </Typography>
      </Box>

      {/* Content Container */}
      <Box sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: 3, width: '100%' }}>

      {/* Filters */}
      <Paper elevation={0} sx={{ mb: 4, p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search scenarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {Object.values(ScenarioCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {formatCategoryLabel(category)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={selectedDifficulty}
              label="Difficulty"
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <MenuItem value="">All Levels</MenuItem>
              {Object.values(ProficiencyLevel).map((level) => (
                <MenuItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(searchQuery || selectedCategory || selectedDifficulty) && (
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Results Summary */}
      {filteredScenarios.length > 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Showing {paginatedScenarios.length} of {filteredScenarios.length} scenarios
        </Typography>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          No scenarios match your search criteria. Try adjusting your filters.
        </Alert>
      )}

      {/* Scenario Cards - 2 columns on desktop, 1 on mobile with 24-32px gaps */}
      {paginatedScenarios.length > 0 && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr',
            md: 'repeat(2, 1fr)'
          }, 
          gap: { xs: 3, md: 4 }, // 24-32px gaps
          mb: 6
        }}>
          {paginatedScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Quick Start Suggestions */}
      {!searchQuery && !selectedCategory && !selectedDifficulty && (
        <Box mt={8}>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
            Popular Choices for Beginners
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            }, 
            gap: { xs: 3, md: 4 },
          }}>
            {scenarios.filter(s => s.difficulty === 'beginner').slice(0, 3).map((scenario) => (
              <Card key={scenario.id} sx={{ textAlign: 'center', p: 2 }}>
                <CardContent>
                  <School color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {scenario.title}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => onScenarioSelect(scenario)}
                    startIcon={<PlayArrow />}
                    sx={{ mt: 1 }}
                  >
                    Quick Start
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
      </Box>
    </Box>
  );
};