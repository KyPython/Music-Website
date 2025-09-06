import React from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Button, Container } from '@mui/material';
import theme from './theme/theme';
import ContactSection from './components/ContactSection/ContactSection';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
        {/* Simple Hero Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h1" 
              sx={{ 
                mb: { xs: 2, md: 3 }, 
                color: '#b542ef', 
                fontWeight: 800,
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }
              }}
            >
              KY
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                mb: { xs: 3, md: 4 }, 
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                px: { xs: 1, sm: 0 }
              }}
            >
              Built from pain. Protected by purpose.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="https://linktr.ee/kytheonlyone"
              target="_blank"
              sx={{ 
                px: { xs: 3, md: 4 }, 
                py: { xs: 1.5, md: 2 },
                fontSize: { xs: '1rem', md: '1.1rem' },
                background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d084f7 0%, #ff8dd4 100%)',
                }
              }}
            >
              Stream Now
            </Button>
          </Box>
        </Container>

        {/* Contact Section */}
        <ContactSection />
      </Box>
    </ThemeProvider>
  );
};

export default App;