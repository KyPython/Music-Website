import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from './theme/theme';
import Navigation from './components/Navigation/Navigation';
import HeroSection from './components/HeroSection/HeroSection';
import MusicSection from './components/MusicSection/MusicSection';
import ContactSection from './components/ContactSection/ContactSection';
import Footer from './components/Footer/Footer';

const AppContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#0a0a0a',
  color: '#ffffff',
  overflow: 'hidden'
}));

const SectionWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  '& > *': {
    position: 'relative',
    zIndex: 1
  }
}));

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContainer>
        {/* Navigation */}
        <Navigation />

        {/* Hero Section */}
        <SectionWrapper id="home">
          <HeroSection />
        </SectionWrapper>

        {/* Music Section */}
        <SectionWrapper id="music">
          <MusicSection />
        </SectionWrapper>

        {/* Contact Section */}
        <SectionWrapper id="contact">
          <ContactSection />
        </SectionWrapper>

        {/* Footer */}
        <Footer />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;