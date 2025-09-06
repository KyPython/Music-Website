import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Container,
  Grid,
  IconButton,
  Divider,
  Link,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';

const FooterContainer = styled(Box)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(10, 10, 10, 0.98) 0%, 
      rgba(20, 20, 20, 0.95) 50%, 
      rgba(10, 10, 10, 0.98) 100%
    )
  `,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  position: 'relative',
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

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'rgba(255, 255, 255, 0.7)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(181, 66, 239, 0.3)'
  }
}));

const NewsletterTextField = styled(TextField)(({ theme }) => ({
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
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#b542ef'
    }
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  textDecoration: 'none',
  fontSize: '0.95rem',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    color: '#b542ef',
    textDecoration: 'none'
  }
}));

const socialLinks = [
  { icon: <YouTubeIcon />, href: 'https://www.youtube.com/@KyOfficial_03', label: 'YouTube' },
  { icon: <InstagramIcon />, href: 'https://www.instagram.com/kytheonlyone', label: 'Instagram' },
  { icon: <TwitterIcon />, href: '#', label: 'Twitter' },
  { icon: <FacebookIcon />, href: '#', label: 'Facebook' }
];

const footerLinks = {
  music: [
    { label: 'Latest Releases', href: '#music', disabled: false },
    { label: 'Albums', href: '#albums', disabled: true },
    { label: 'Singles', href: '#singles', disabled: true },
    { label: 'Collaborations', href: '#collabs', disabled: true }
  ],
  connect: [
    { label: 'Tour Dates', href: '#tour', disabled: true },
    { label: 'Meet & Greet', href: '#meet', disabled: true },
    { label: 'Fan Club', href: '#fanclub', disabled: true },
    { label: 'Contact', href: '#contact', disabled: false }
  ],
  shop: [
    { label: 'Merchandise', href: '#merch', disabled: true },
    { label: 'Vinyl Records', href: '#vinyl', disabled: true },
    { label: 'Apparel', href: '#apparel', disabled: true },
    { label: 'Accessories', href: '#accessories', disabled: true }
  ]
};

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      alert('There was an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkClick = (href: string, disabled: boolean) => {
    if (disabled) {
      alert('Coming soon! Stay tuned for updates.');
      return;
    }

    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <FooterContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Main Footer Content */}
        <Box sx={{ py: 8 }}>
          <Grid container spacing={6}>
            {/* Brand Section */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <GradientText variant="h3" sx={{ fontWeight: 800 }}>
                  KY
                </GradientText>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    maxWidth: 300,
                    lineHeight: 1.6
                  }}
                >
                  Built from pain. Protected by purpose. Experience music that tells real stories and connects souls.
                </Typography>

                {/* Social Media */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Follow the Journey
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {socialLinks.map((social) => (
                      <SocialButton
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                      >
                        {social.icon}
                      </SocialButton>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            {/* Links Sections */}
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Music
              </Typography>
              <Stack spacing={2}>
                {footerLinks.music.map((link) => (
                  <FooterLink
                    key={link.label}
                    onClick={() => handleLinkClick(link.href, link.disabled)}
                    sx={{ 
                      opacity: link.disabled ? 0.5 : 1,
                      cursor: link.disabled ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {link.label}
                  </FooterLink>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Connect
              </Typography>
              <Stack spacing={2}>
                {footerLinks.connect.map((link) => (
                  <FooterLink
                    key={link.label}
                    onClick={() => handleLinkClick(link.href, link.disabled)}
                    sx={{ 
                      opacity: link.disabled ? 0.5 : 1,
                      cursor: link.disabled ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {link.label}
                  </FooterLink>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Shop
              </Typography>
              <Stack spacing={2}>
                {footerLinks.shop.map((link) => (
                  <FooterLink
                    key={link.label}
                    onClick={() => handleLinkClick(link.href, link.disabled)}
                    sx={{ 
                      opacity: link.disabled ? 0.5 : 1,
                      cursor: link.disabled ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {link.label}
                  </FooterLink>
                ))}
              </Stack>
            </Grid>

            {/* Newsletter Section */}
            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Stay Updated
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.5
                }}
              >
                Get the latest music, tour dates, and exclusive content delivered to your inbox.
              </Typography>

              <Box component="form" onSubmit={handleNewsletterSubmit}>
                <Stack spacing={2}>
                  <NewsletterTextField
                    fullWidth
                    size="small"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? null : <SendIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #d084f7 0%, #ff8dd4 100%)'
                      }
                    }}
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer Bottom */}
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ py: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={3}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              © 2025 Ky. Built from pain. Protected by purpose. All rights reserved.
            </Typography>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3}
              alignItems="center"
            >
              <FooterLink href="#privacy">Privacy Policy</FooterLink>
              <FooterLink href="#terms">Terms of Service</FooterLink>
              <FooterLink href="#cookies">Cookie Settings</FooterLink>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;