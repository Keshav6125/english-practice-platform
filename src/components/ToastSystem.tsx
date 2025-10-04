import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Alert,
  Snackbar,
  Slide,
  Fade,
  IconButton,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
  Upload,
  Save,
  Wifi,
  WifiOff
} from '@mui/icons-material';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastVariant = 'filled' | 'outlined' | 'standard';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  chip?: {
    label: string;
    color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showSessionSaved: () => void;
  showUploadFailed: (retry?: () => void) => void;
  showGrammarCorrected: () => void;
  showAutoSaved: () => void;
  showConnectionLost: () => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new globalThis.Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 3 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 4000,
      variant: 'filled',
      ...toast
    };

    setToasts(current => {
      const updated = [...current, newToast];
      // Keep only the latest toasts
      return updated.slice(-maxToasts);
    });

    // Auto-hide after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, [maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration = 3000) => {
    showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, duration = 5000) => {
    showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, duration = 4000) => {
    showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, duration = 4000) => {
    showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  // Preset toasts for common scenarios
  const showSessionSaved = useCallback(() => {
    showToast({
      type: 'success',
      title: 'Session Saved',
      message: 'Your practice session has been saved successfully',
      duration: 3000,
      chip: { label: 'Auto-saved', color: 'success' }
    });
  }, [showToast]);

  const showUploadFailed = useCallback((retry?: () => void) => {
    showToast({
      type: 'error',
      title: 'Upload Failed',
      message: 'Failed to save your session. Please try again.',
      duration: 6000,
      action: retry ? { label: 'Retry', onClick: retry } : undefined
    });
  }, [showToast]);

  const showGrammarCorrected = useCallback(() => {
    showToast({
      type: 'info',
      title: 'Grammar Corrected',
      duration: 2500,
      chip: { label: 'Auto-saved', color: 'primary' }
    });
  }, [showToast]);

  const showAutoSaved = useCallback(() => {
    showToast({
      type: 'success',
      title: 'Auto-saved',
      duration: 2000,
      variant: 'standard'
    });
  }, [showToast]);

  const showConnectionLost = useCallback(() => {
    showToast({
      type: 'warning',
      title: 'Connection Lost',
      message: 'Reconnecting...',
      duration: 0, // Don't auto-hide
    });
  }, [showToast]);

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSessionSaved,
    showUploadFailed,
    showGrammarCorrected,
    showAutoSaved,
    showConnectionLost,
    hideToast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </Box>
  );
};

interface ToastItemProps {
  toast: Toast;
  index: number;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, index, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
        return <Info />;
      default:
        return <Info />;
    }
  };

  const getSpecialIcon = () => {
    if (toast.title.includes('Upload')) return <Upload />;
    if (toast.title.includes('Saved') || toast.title.includes('Auto-saved')) return <Save />;
    if (toast.title.includes('Connection') && toast.type === 'warning') return <WifiOff />;
    if (toast.title.includes('Connection') && toast.type === 'success') return <Wifi />;
    return getIcon();
  };

  return (
    <Slide
      direction="left"
      in={true}
      timeout={{
        enter: 180,
        exit: 180
      }}
      easing={{
        enter: 'cubic-bezier(.22,.9,.34,1)',
        exit: 'cubic-bezier(.22,.9,.34,1)'
      }}
      style={{
        transitionDelay: `${index * 50}ms`
      }}
    >
      <Fade
        in={true}
        timeout={{
          enter: 180,
          exit: 180
        }}
      >
        <Alert
          severity={toast.type}
          variant={toast.variant}
          icon={getSpecialIcon()}
          sx={{
            pointerEvents: 'auto',
            minWidth: 320,
            maxWidth: 400,
            boxShadow: '0 12px 36px rgba(16,24,40,0.08)',
            backdropFilter: 'blur(6px)',
            backgroundColor: theme => 
              toast.variant === 'filled' 
                ? undefined 
                : `${theme.palette.background.paper}f0`, // 94% opacity
            border: theme => 
              toast.variant === 'outlined' 
                ? undefined 
                : `1px solid ${theme.palette.divider}20`, // 12% opacity
            transform: `translateY(${index * -4}px)`,
            transition: 'transform 260ms cubic-bezier(.22,.9,.34,1)',
            '&:hover': {
              transform: `translateY(${index * -4 - 2}px)`,
              boxShadow: '0 16px 48px rgba(16,24,40,0.12)'
            }
          }}
          action={
            <Box display="flex" alignItems="center" gap={1}>
              {toast.action && (
                <Chip
                  label={toast.action.label}
                  size="small"
                  onClick={toast.action.onClick}
                  variant="outlined"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                />
              )}
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {toast.title}
            </Typography>
            {toast.message && (
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                {toast.message}
              </Typography>
            )}
            {toast.chip && (
              <Box mt={1}>
                <Chip
                  label={toast.chip.label}
                  size="small"
                  color={toast.chip.color}
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'inherit'
                  }}
                />
              </Box>
            )}
          </Box>
        </Alert>
      </Fade>
    </Slide>
  );
};

// Utility hook for common toast patterns
export const useCommonToasts = () => {
  const toast = useToast();

  return {
    sessionSaved: toast.showSessionSaved,
    uploadFailed: toast.showUploadFailed,
    grammarCorrected: toast.showGrammarCorrected,
    autoSaved: toast.showAutoSaved,
    connectionLost: toast.showConnectionLost,
    custom: toast.showToast
  };
};