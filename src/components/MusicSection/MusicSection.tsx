import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia,
  Button,
  Stack,
  Container,
  Grid,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';

const SectionContainer = styled(Box)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(10, 10, 10, 0.95) 0%, 
      rgba(20, 20, 20, 0.9) 50%, 
      rgba(10, 10, 10, 0.95) 100%
    )
  `,
  position: 'relative',
  padding: '120px 0',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 30% 20%, rgba(181, 66, 239, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(246, 85, 192, 0.1) 0%, transparent 50%)
    `,
    zIndex: 1
  }
}));

const MusicCard = styled(Card)(({ theme }) => ({
  background: 'rgba(20, 20, 20, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 25px 50px rgba(181, 66, 239, 0.3)',
    '& .play-overlay': {
      opacity: 1
    },
    '& .music-image': {
      transform: 'scale(1.1)'
    }
  }
}));

const PlayOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2,
  cursor: 'pointer'
}));

const PlayButton = styled(Button)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
  color: 'white',
  minWidth: 'unset',
  '&:hover': {
    background: 'linear-gradient(135deg, #d084f7 0%, #ff8dd4 100%)',
    transform: 'scale(1.1)'
  }
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}));

const mockTracks = [
  {
    id: 1,
    title: "Rising Phoenix",
    description: "A powerful anthem about overcoming adversity and finding strength in struggle.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    duration: "3:42",
    genre: "Hip-Hop",
    status: "Latest"
  },
  {
    id: 2,
    title: "Midnight Reflections",
    description: "Introspective lyrics over atmospheric beats, exploring themes of growth and purpose.",
    image: "https://images.unsplash.com/photo-1571974599782-87624638275c?w=400&h=400&fit=crop",
    duration: "4:15",
    genre: "R&B",
    status: "Popular"
  },
  {
    id: 3,
    title: "Built Different",
    description: "Raw energy and authentic storytelling that showcases the journey from pain to purpose.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&sat=-100",
    duration: "3:28",
    genre: "Rap",
    status: "Coming Soon"
  }
];

const MusicSection: React.FC = () => {
  return (
    <SectionContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <Stack spacing={3} alignItems="center" sx={{ mb: 8, textAlign: 'center' }}>
          <Chip 
            label="Latest Music" 
            sx={{ 
              background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
              color: 'white',
              fontWeight: 600,
              px: 2
            }} 
          />
          
          <GradientText variant="h2" sx={{ fontWeight: 700 }}>
            Feel the Music
          </GradientText>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
              fontWeight: 300
            }}
          >
            Each track tells a story of resilience, authenticity, and the power of music to heal and inspire.
          </Typography>
        </Stack>

        {/* Music Grid */}
        <Grid container spacing={4}>
          {mockTracks.map((track, index) => (
            <Grid item xs={12} md={4} key={track.id}>
              <MusicCard
                sx={{
                  animationDelay: `${index * 0.2}s`,
                  animation: 'fadeInUp 0.8s ease-out forwards',
                  opacity: 0,
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(30px)'
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={track.image}
                    alt={track.title}
                    className="music-image"
                    sx={{
                      transition: 'transform 0.4s ease',
                      objectFit: 'cover'
                    }}
                  />
                  
                  <PlayOverlay className="play-overlay">
                    <PlayButton>
                      <PlayArrowIcon sx={{ fontSize: 40 }} />
                    </PlayButton>
                  </PlayOverlay>

                  {/* Status Badge */}
                  <Chip
                    label={track.status}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: track.status === 'Latest' 
                        ? 'linear-gradient(135deg, #00e676 0%, #00c853 100%)'
                        : track.status === 'Popular'
                        ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                        : 'linear-gradient(135deg, #6969fb 0%, #4040c8 100%)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {track.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {track.description}
                      </Typography>
                    </Box>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip 
                          label={track.genre} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            borderColor: 'primary.main',
                            color: 'primary.main'
                          }}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {track.duration}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>
                          <FavoriteIcon fontSize="small" />
                        </Button>
                        <Button size="small" sx={{ minWidth: 'auto', p: 1 }}>
                          <ShareIcon fontSize="small" />
                        </Button>
                      </Stack>
                    </Stack>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<PlayArrowIcon />}
                      href="https://linktr.ee/kytheonlyone"
                      target="_blank"
                      sx={{ mt: 2 }}
                    >
                      Stream Track
                    </Button>
                  </Stack>
                </CardContent>
              </MusicCard>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Stack alignItems="center" sx={{ mt: 8 }}>
          <Button
            variant="contained"
            size="large"
            href="https://linktr.ee/kytheonlyone"
            target="_blank"
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d084f7 0%, #ff8dd4 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 30px rgba(181, 66, 239, 0.4)'
              }
            }}
          >
            Explore All Music
          </Button>
        </Stack>
      </Container>
    </SectionContainer>
  );
};

export default MusicSection;