import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#b542ef', // Purple gradient start
      light: '#d084f7',
      dark: '#8a2be2',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f655c0', // Pink gradient
      light: '#ff8dd4',
      dark: '#c4428f',
      contrastText: '#ffffff'
    },
    background: {
      default: '#0a0a0a',
      paper: '#141414'
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    grey: {
      50: '#f2f2f2',
      100: '#e0e0e0',
      200: '#cccccc',
      300: '#b3b3b3',
      400: '#999999',
      500: '#808080',
      600: '#666666',
      700: '#4d4d4d',
      800: '#333333',
      900: '#1a1a1a'
    },
    info: {
      main: '#6969fb',
      light: '#9999fc',
      dark: '#4040c8',
      contrastText: '#ffffff'
    },
    success: {
      main: '#00e676',
      light: '#66ffa6',
      dark: '#00b248',
      contrastText: '#000000'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Clash Display", "Space Grotesk", sans-serif',
      fontSize: '4rem',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontFamily: '"Clash Display", "Space Grotesk", sans-serif',
      fontSize: '3rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1.125rem',
      lineHeight: 1.6,
      fontWeight: 400
    },
    body2: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 400
    },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.01em'
    }
  },
  shape: {
    borderRadius: 16
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 500,
          textTransform: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(181, 66, 239, 0.3)'
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
          boxShadow: '0 4px 15px rgba(181, 66, 239, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d084f7 0%, #ff8dd4 100%)',
            boxShadow: '0 8px 25px rgba(181, 66, 239, 0.5)'
          }
        },
        outlined: {
          borderColor: '#b542ef',
          color: '#b542ef',
          borderWidth: '2px',
          '&:hover': {
            borderColor: '#d084f7',
            backgroundColor: 'rgba(181, 66, 239, 0.1)',
            borderWidth: '2px'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(181, 66, 239, 0.2)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: '2px'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(181, 66, 239, 0.5)'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#b542ef'
            }
          }
        }
      }
    }
  }
});

export default theme;