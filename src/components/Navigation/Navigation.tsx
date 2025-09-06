import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(10, 10, 10, 0.9)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&.scrolled': {
    background: 'rgba(10, 10, 10, 0.95)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  }
}));

const Logo = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
  fontSize: '2rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  fontWeight: 500,
  fontSize: '1rem',
  textTransform: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#b542ef',
    backgroundColor: 'rgba(181, 66, 239, 0.1)',
    transform: 'translateY(-2px)'
  },
  '&.disabled': {
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'not-allowed'
  }
}));

const StreamButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  padding: '10px 24px',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #d084f7 0%, #ff8dd4 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(181, 66, 239, 0.4)'
  }
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    background: 'rgba(10, 10, 10, 0.95)',
    backdropFilter: 'blur(20px)',
    border: 'none',
    width: 280,
    padding: theme.spacing(2)
  }
}));

const navItems = [
  { label: 'Home', href: '#home', disabled: false },
  { label: 'Music', href: '#music', disabled: false },
  { label: 'Tour Dates', href: '#tour', disabled: true },
  { label: 'Store', href: '#store', disabled: true },
  { label: 'Contact', href: '#contact', disabled: false }
];

const Navigation: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (href: string, disabled: boolean) => {
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
    
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Logo variant="h4">KY</Logo>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.label}
            onClick={() => handleNavClick(item.href, item.disabled)}
            sx={{
              cursor: 'pointer',
              borderRadius: '8px',
              mb: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(181, 66, 239, 0.1)',
                transform: 'translateX(8px)'
              },
              ...(item.disabled && {
                opacity: 0.5,
                cursor: 'not-allowed'
              })
            }}
          >
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  color: item.disabled ? 'rgba(255, 255, 255, 0.4)' : 'white',
                  fontWeight: 500
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 4 }}>
        <StreamButton
          fullWidth
          endIcon={<LaunchIcon />}
          href="https://linktr.ee/kytheonlyone"
          target="_blank"
        >
          Stream Music
        </StreamButton>
      </Box>
    </Box>
  );

  return (
    <>
      <StyledAppBar 
        position="fixed" 
        elevation={0}
        className={scrolled ? 'scrolled' : ''}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Logo 
            variant="h4"
            onClick={() => handleNavClick('#home', false)}
          >
            KY
          </Logo>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              {navItems.map((item) => (
                <NavButton
                  key={item.label}
                  onClick={() => handleNavClick(item.href, item.disabled)}
                  className={item.disabled ? 'disabled' : ''}
                >
                  {item.label}
                </NavButton>
              ))}
            </Stack>
          )}

          {/* Desktop Stream Button */}
          {!isMobile && (
            <StreamButton
              endIcon={<LaunchIcon />}
              href="https://linktr.ee/kytheonlyone"
              target="_blank"
            >
              Stream Music
            </StreamButton>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(181, 66, 239, 0.1)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <MobileDrawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
      >
        {drawer}
      </MobileDrawer>
    </>
  );
};

export default Navigation;