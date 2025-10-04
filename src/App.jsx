import { useState, useEffect } from 'react';
import { scenarios } from './data/scenarios.js';
import { ProgressService } from './services/progressService.js';
import { PracticeSession } from './components/PracticeSession.tsx';
import { FeedbackReport } from './components/FeedbackReport.jsx';
import { ProgressDashboard } from './components/ProgressDashboard.jsx';
import { SessionHistory } from './components/SessionHistory.tsx';
import {
  Home,
  PlayArrow,
  Assessment,
  Search,
  Person,
  School,
  History,
  ChevronLeft,
  ChevronRight,
  Menu,
  BarChart,
  Timer
} from './components/Icons';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 72;

function App() {
  const [appState, setAppState] = useState('home');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [progressData, setProgressData] = useState(null);
  
  const isMobile = window.innerWidth < 768;

  // Load progress data on app start
  useEffect(() => {
    const loadProgressData = () => {
      try {
        // Temporarily disable test data cleanup for debugging
        // ProgressService.clearTestData();
        
        // Check what's in localStorage
        const sessionsData = localStorage.getItem('english-practice-sessions');
        const progressData = localStorage.getItem('english-practice-user-progress');
        console.log('Raw sessions in localStorage:', sessionsData ? JSON.parse(sessionsData).length : 0);
        console.log('Progress data available:', !!progressData);
        
        // Log first session details for debugging
        if (sessionsData) {
          const sessions = JSON.parse(sessionsData);
          if (sessions.length > 0) {
            console.log('First session sample:', {
              id: sessions[0].id,
              duration: sessions[0].duration,
              transcriptLength: sessions[0].transcript?.length || 0,
              startTime: sessions[0].startTime
            });
          }
        }
        
        const data = ProgressService.getProgressData();
        setProgressData(data);
        console.log('Loaded progress data:', data?.overallProgress?.totalSessions || 'No sessions');
      } catch (error) {
        console.error('Failed to load progress data:', error);
      }
    };
    
    loadProgressData();
    
    // Reload progress data when returning to home
    if (appState === 'home') {
      loadProgressData();
    }
  }, [appState]);

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario);
    setAppState('practice-session');
  };

  const handleSessionComplete = (session) => {
    console.log('=== SESSION COMPLETION DEBUG ===');
    console.log('App handleSessionComplete called with:', session);
    console.log('Session ID:', session?.id);
    console.log('Session duration:', session?.duration);
    console.log('Session transcript length:', session?.transcript?.length);
    console.log('Session feedback:', !!session?.feedback);
    
    try {
      // Check localStorage before saving
      const beforeSessions = localStorage.getItem('english-practice-sessions');
      console.log('Sessions before save:', beforeSessions ? JSON.parse(beforeSessions).length : 0);
      
      // Save the session to storage
      ProgressService.saveSession(session);
      console.log('✅ Session saved to ProgressService successfully');
      
      // Check localStorage after saving
      const afterSessions = localStorage.getItem('english-practice-sessions');
      console.log('Sessions after save:', afterSessions ? JSON.parse(afterSessions).length : 0);
      
      // Refresh progress data
      const updatedProgressData = ProgressService.getProgressData();
      setProgressData(updatedProgressData);
      console.log('✅ Progress data refreshed:', updatedProgressData?.overallProgress?.totalSessions || 'No sessions');
      
      setCompletedSession(session);
      setAppState('feedback-report');
      console.log('✅ Navigating to feedback-report');
      console.log('=== SESSION COMPLETION SUCCESS ===');
    } catch (error) {
      console.error('❌ Error in handleSessionComplete:', error);
      console.error('Error details:', error.message, error.stack);
    }
  };

  const handleBackToScenarios = () => {
    setSelectedScenario(null);
    setCompletedSession(null);
    setAppState('scenario-selection');
  };

  const handlePracticeAgain = () => {
    if (selectedScenario) {
      setCompletedSession(null);
      setAppState('practice-session');
    } else {
      handleBackToScenarios();
    }
  };

  const handleStartPractice = () => {
    setAppState('scenario-selection');
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, state: 'home' },
    { id: 'practice', label: 'Practice', icon: School, state: 'scenario-selection' },
    { id: 'progress', label: 'Progress', icon: Assessment, state: 'progress' },
    { id: 'history', label: 'History', icon: History, state: 'history' },
  ];

  const handleNavigation = (state) => {
    setAppState(state);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  // Sidebar content
  const sidebarContent = (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="p-6 border-b" style={{ borderColor: 'var(--color-divider)' }}>
        {!sidebarCollapsed ? (
          <h1 className="text-xl font-bold" style={{ 
            color: 'var(--color-accent)', 
            fontFamily: 'var(--font-heading)'
          }}>
            EnglishPractice.ai
          </h1>
        ) : (
          <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white font-bold" style={{
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))'
          }}>
            E
          </div>
        )}
      </div>
      
      <nav className="flex-grow p-3 space-y-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isSelected = appState === item.state || (appState === 'scenario-selection' && item.id === 'practice');
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.state)}
              className={`nav-item w-full ${
                isSelected ? 'active' : ''
              } ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <IconComponent size={20} />
              {!sidebarCollapsed && (
                <span className="font-medium transition-opacity duration-200">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
      
      {!isMobile && (
        <div className="p-3 border-t" style={{ borderColor: 'var(--color-divider)' }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn-ghost w-full justify-center"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div 
          className="flex-shrink-0 transition-all duration-[var(--duration-medium)] ease-[var(--easing)]" 
          style={{ 
            width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            backgroundColor: 'var(--color-surface)',
            borderRight: '1px solid var(--color-divider)'
          }}
        >
          {sidebarContent}
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-64">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="border-b px-6 py-4" style={{ 
          backgroundColor: 'var(--color-surface)', 
          borderColor: 'var(--color-divider)'
        }}>
          <div className="flex items-center gap-6">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="btn-ghost p-2"
              >
                <Menu size={20} />
              </button>
            )}

            {/* Logo - Modern gradient */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
              boxShadow: 'var(--shadow-card)'
            }}>
              E
            </div>

            {/* Search Bar - Modern glass effect */}
            {!isMobile && (
              <div className="flex-grow max-w-md mx-6">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search transcripts, scenarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-divider)',
                      color: 'var(--color-text)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)';
                      e.target.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-divider)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex-grow" />

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {appState !== 'scenario-selection' && appState !== 'practice-session' && (
                <button
                  onClick={handleStartPractice}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlayArrow size={16} />
                  Start Practice
                </button>
              )}
              
              <button className="btn-ghost p-2 rounded-full">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{
                  background: 'linear-gradient(135deg, #F59E0B, #F97316)'
                }}>
                  <Person size={16} />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
          {/* Home/Dashboard */}
          {appState === 'home' && (
            <div className="p-8 animate-slide-in">
              <div className="max-w-4xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
                    boxShadow: 'var(--shadow-glow)'
                  }}>
                    <Assessment size={40} className="text-white" />
                  </div>
                  <h1 className="text-5xl font-bold mb-6" style={{ 
                    fontFamily: 'var(--font-heading)',
                    background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Welcome to EnglishPractice.ai
                  </h1>
                  <p className="text-xl mb-8" style={{ color: '#4B5563' }}>
                    {progressData ? 
                      `Continue your English speaking practice journey. You've completed ${progressData.overallProgress.totalSessions} sessions!` :
                      'Start your English speaking practice journey with AI-powered feedback'
                    }
                  </p>
                </div>
                
                {progressData && progressData.overallProgress.totalSessions > 0 && (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="card text-center" style={{
                        background: 'linear-gradient(135deg, rgba(79,70,229,0.05), rgba(79,70,229,0.1))',
                        borderColor: 'rgba(79,70,229,0.2)'
                      }}>
                        <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
                          {progressData.overallProgress.totalSessions}
                        </div>
                        <div className="font-medium" style={{ color: '#4B5563' }}>Total Sessions</div>
                      </div>
                      <div className="card text-center" style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.12))',
                        borderColor: 'rgba(16,185,129,0.2)'
                      }}>
                        <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-success)' }}>
                          {progressData.overallProgress.averageScore.toFixed(1)}/10
                        </div>
                        <div className="font-medium" style={{ color: '#4B5563' }}>Average Score</div>
                      </div>
                      <div className="card text-center" style={{
                        background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.12))',
                        borderColor: 'rgba(6,182,212,0.2)'
                      }}>
                        <div className="text-4xl font-bold mb-2" style={{ color: 'var(--color-accent2)' }}>
                          {progressData.overallProgress.totalPracticeTime}m
                        </div>
                        <div className="font-medium" style={{ color: '#4B5563' }}>Practice Time</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar Section */}
                    <div className="card mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Current Level Progress</span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{
                          backgroundColor: 'rgba(79,70,229,0.1)',
                          color: 'var(--color-accent)'
                        }}>
                          {progressData.overallProgress.currentLevel}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="w-full h-3 rounded-full" style={{ backgroundColor: 'var(--color-divider)' }}>
                          <div 
                            className="h-3 rounded-full transition-all duration-1000 ease-out" 
                            style={{ 
                              width: `${Math.min(progressData.overallProgress.averageScore * 10, 100)}%`,
                              background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent2))',
                              boxShadow: '0 2px 8px rgba(79,70,229,0.3)'
                            }}
                          ></div>
                        </div>
                        <div className="text-sm mt-2" style={{ color: '#4B5563' }}>
                          {Math.round(progressData.overallProgress.averageScore * 10)}% to next level
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* CTA Button */}
                <div className="text-center">
                  <button
                    onClick={handleStartPractice}
                    className="btn-primary text-xl px-12 py-4" style={{
                      background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))',
                      boxShadow: 'var(--shadow-glow)',
                      fontSize: '1.125rem'
                    }}
                  >
                    {progressData && progressData.overallProgress.totalSessions > 0 ? '✨ Continue Practice' : '🚀 Start First Session'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Practice Section */}
          {appState === 'scenario-selection' && (
            <div className="p-8 animate-slide-in">
              <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold mb-4" style={{ 
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--color-text)'
                  }}>
                    Choose Your Practice Scenario
                  </h1>
                  <p className="text-xl" style={{ color: '#4B5563' }}>
                    Select a real-life scenario to practice your English conversation skills with AI
                  </p>
                </div>
                
                {/* Scenarios Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scenarios.map((scenario, index) => (
                    <div 
                      key={scenario.id} 
                      className="card group cursor-pointer relative overflow-hidden"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleScenarioSelect(scenario)}
                    >
                      {/* Card Content */}
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                            background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent2))'
                          }}>
                            <School size={24} className="text-white" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            scenario.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            scenario.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3" style={{ 
                          fontFamily: 'var(--font-heading)',
                          color: 'var(--color-text)'
                        }}>
                          {scenario.title}
                        </h3>
                        
                        <p className="mb-6 leading-relaxed" style={{ color: '#4B5563' }}>
                          {scenario.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                            <Timer size={16} />
                            <span>{scenario.duration} min session</span>
                          </div>
                          
                          <button className="btn-primary group-hover:scale-105 transition-transform">
                            Start →
                          </button>
                        </div>
                      </div>
                      
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                        background: 'linear-gradient(135deg, rgba(79,70,229,0.02), rgba(6,182,212,0.02))'
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Practice Session */}
          {appState === 'practice-session' && selectedScenario && (
            <PracticeSession
              scenario={selectedScenario}
              onSessionComplete={handleSessionComplete}
              onExit={handleBackToScenarios}
            />
          )}

          {/* Feedback Report */}
          {appState === 'feedback-report' && completedSession && (
            <FeedbackReport
              session={completedSession}
              onClose={handleBackToScenarios}
              onPracticeAgain={handlePracticeAgain}
            />
          )}

          {/* Progress Dashboard */}
          {appState === 'progress' && (
            <ProgressDashboard onStartPractice={handleStartPractice} />
          )}

          {/* Session History */}
          {appState === 'history' && (
            <SessionHistory onStartPractice={handleStartPractice} />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="border-t px-2 py-2" style={{ 
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-divider)'
          }}>
            <div className="flex justify-around">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isSelected = appState === item.state || (appState === 'scenario-selection' && item.id === 'practice');
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.state)}
                    className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                      isSelected 
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                  >
                    <IconComponent size={20} />
                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export default App;