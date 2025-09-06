import React from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LaunchIcon from '@mui/icons-material/Launch';

const HeroContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `
    radial-gradient(circle at 20% 80%, rgba(181, 66, 239, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(246, 85, 192, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(105, 105, 251, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #141414 100%)
  `,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    `,
    opacity: 0.5
  }
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(181, 66, 239, 0.1), rgba(246, 85, 192, 0.1))',
  backdropFilter: 'blur(10px)',
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-20px)' }
  }
}));

const GlowText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 50%, #6969fb 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  textShadow: '0 0 30px rgba(181, 66, 239, 0.5)',
  animation: 'glow 2s ease-in-out infinite alternate',
  '@keyframes glow': {
    from: { textShadow: '0 0 20px rgba(181, 66, 239, 0.5)' },
    to: { textShadow: '0 0 40px rgba(181, 66, 239, 0.8)' }
  }
}));

const PulseButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      {/* Floating Background Elements */}
      <FloatingElement 
        sx={{ 
          width: 200, 
          height: 200, 
          top: '10%', 
          left: '10%',
          animationDelay: '0s'
        }} 
      />
      <FloatingElement 
        sx={{ 
          width: 150, 
          height: 150, 
          top: '60%', 
          right: '15%',
          animationDelay: '2s'
        }} 
      />
      <FloatingElement 
        sx={{ 
          width: 100, 
          height: 100, 
          bottom: '20%', 
          left: '20%',
          animationDelay: '4s'
        }} 
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          alignItems="center" 
          spacing={6}
          sx={{ minHeight: '80vh' }}
        >
          {/* Left Content */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 600,
                mb: 2,
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Music Artist
            </Typography>
            
            <GlowText 
              variant="h1" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '3rem', md: '5rem' },
                fontWeight: 800
              }}
            >
              KY
            </GlowText>
            
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 4,
                color: 'text.secondary',
                fontWeight: 300,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Built from pain.
              <br />
              Protected by purpose.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 6,
                maxWidth: 500,
                color: 'text.secondary',
                fontSize: '1.25rem',
                lineHeight: 1.6
              }}
            >
              Experience the raw emotion and powerful storytelling that defines my music. 
              Every track is a journey through struggle, growth, and triumph.
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3}
              sx={{ alignItems: { xs: 'center', sm: 'flex-start' } }}
            >
              <PulseButton
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                href="https://linktr.ee/kytheonlyone"
                target="_blank"
                sx={{ 
                  px: 4, 
                  py: 2,
                  fontSize: '1.1rem',
                  minWidth: 200
                }}
              >
                Stream Now
              </PulseButton>
              
              <Button
                variant="outlined"
                size="large"
                endIcon={<LaunchIcon />}
                sx={{ 
                  px: 4, 
                  py: 2,
                  fontSize: '1.1rem',
                  minWidth: 200
                }}
              >
                Latest Release
              </Button>
            </Stack>
          </Box>

          {/* Right Content - Visual Element */}
          <Box 
            sx={{ 
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: { xs: 300, md: 400 },
                height: { xs: 300, md: 400 },
                borderRadius: '50%',
                background: `
                  radial-gradient(circle, 
                    rgba(181, 66, 239, 0.8) 0%, 
                    rgba(246, 85, 192, 0.6) 30%, 
                    rgba(105, 105, 251, 0.4) 60%, 
                    transparent 100%
                  )
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                animation: 'pulse 4s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 0 50px rgba(181, 66, 239, 0.3)'
                  },
                  '50%': { 
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 80px rgba(181, 66, 239, 0.5)'
                  }
                }
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  textAlign: 'center',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
                }}
              >
                🎵
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Container>
    </HeroContainer>
  );
};

export default HeroSection;