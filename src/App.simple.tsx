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
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h1" sx={{ mb: 2, color: '#b542ef', fontWeight: 800 }}>
              KY
            </Typography>
            <Typography variant="h3" sx={{ mb: 4, color: 'rgba(255,255,255,0.7)' }}>
              Built from pain. Protected by purpose.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="https://linktr.ee/kytheonlyone"
              target="_blank"
              sx={{ 
                px: 4, 
                py: 2,
                fontSize: '1.1rem',
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