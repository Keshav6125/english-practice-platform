import { useEffect, useState } from 'react';

export const AnimatedProgressRing = ({ 
  value, 
  maxValue = 10, 
  size = 120, 
  strokeWidth = 8, 
  showValue = true, 
  label = "",
  color = 'primary',
  animate = true,
  duration = 1200
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (animatedValue / maxValue) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color mapping
  const getColor = () => {
    if (color === 'primary') {
      if (value >= 8) return '#22c55e'; // green
      if (value >= 6) return '#f59e0b'; // yellow
      if (value >= 4) return '#f97316'; // orange
      return '#ef4444'; // red
    }
    
    switch (color) {
      case 'success': return '#22c55e';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const ringColor = getColor();

  // Spring animation with easing
  useEffect(() => {
    if (!animate) {
      setAnimatedValue(value);
      return;
    }

    setIsAnimating(true);
    const startValue = animatedValue;
    const endValue = value;
    const startTime = Date.now();

    // Cubic bezier easing function
    const easeOutCubic = (t) => {
      const p = t - 1;
      return 1 + p * p * p;
    };

    const animateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply spring easing
      const easedProgress = easeOutCubic(progress);
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      setAnimatedValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateValue);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animateValue);
  }, [value, animate, duration]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 transition-all duration-300 ${
          isAnimating ? 'drop-shadow-lg' : ''
        }`}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="progress-ring"
        />
        
        {/* Glow effect for high scores */}
        {value >= 8 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth / 2}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            opacity={0.3}
            className="blur-sm"
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <div
            className={`font-semibold text-center transition-transform duration-300 ${
              isAnimating ? 'scale-110' : 'scale-100'
            }`}
            style={{ 
              color: ringColor,
              fontSize: size > 100 ? '1.5rem' : '1.25rem',
              lineHeight: 1
            }}
          >
            {animatedValue.toFixed(1)}
          </div>
        )}
        
        {label && (
          <div 
            className="text-gray-500 text-center mt-1"
            style={{ fontSize: size > 100 ? '0.75rem' : '0.625rem' }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Pulse animation for perfect scores */}
      {value >= 9.5 && (
        <div
          className="absolute border-2 rounded-full opacity-0 animate-pulse-ring"
          style={{
            width: size,
            height: size,
            borderColor: ringColor,
          }}
        />
      )}
    </div>
  );
};

// Preset variations for common use cases
export const ScoreRing = ({ score, label = "Score", size = 120 }) => (
  <AnimatedProgressRing 
    value={score} 
    maxValue={10} 
    label={label} 
    size={size}
    color="primary"
    animate={true}
  />
);

export const MiniScoreRing = ({ score, size = 60 }) => (
  <AnimatedProgressRing 
    value={score} 
    maxValue={10} 
    size={size}
    strokeWidth={4}
    animate={true}
    showValue={true}
  />
);

export const SkillProgressRing = ({ 
  value, 
  maxValue = 10, 
  label,
  color = 'primary'
}) => (
  <AnimatedProgressRing 
    value={value} 
    maxValue={maxValue} 
    label={label} 
    size={90}
    strokeWidth={6}
    color={color}
    animate={true}
  />
);