import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Container,
  Grid,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SectionContainer = styled(Box)(({ theme }) => ({
  background: `
    linear-gradient(135deg, 
      rgba(10, 10, 10, 0.98) 0%, 
      rgba(20, 20, 20, 0.95) 50%, 
      rgba(10, 10, 10, 0.98) 100%
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
      radial-gradient(circle at 20% 30%, rgba(246, 85, 192, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(105, 105, 251, 0.15) 0%, transparent 50%)
    `,
    zIndex: 1
  }
}));

const ContactCard = styled(Card)(({ theme }) => ({
  background: 'rgba(20, 20, 20, 0.9)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(181, 66, 239, 0.2)'
  }
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: '2px'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(181, 66, 239, 0.5)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#b542ef',
      boxShadow: '0 0 20px rgba(181, 66, 239, 0.3)'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#b542ef'
    }
  }
}));

const inquiryTypes = [
  { value: 'artist', label: 'Artist Inquiry' },
  { value: 'booking', label: 'Booking Request' },
  { value: 'fan', label: 'Fan Message' },
  { value: 'collab', label: 'Collaboration Idea' },
  { value: 'inquiry', label: 'Other Inquiry' },
  { value: 'other', label: 'Other' }
];

const contactInfo = [
  {
    icon: <EmailIcon />,
    title: 'Email',
    description: 'Get in touch via email',
    value: 'contact@kymusic.com'
  },
  {
    icon: <PhoneIcon />,
    title: 'Phone',
    description: 'Call for urgent matters',
    value: '+1 (555) 123-4567'
  },
  {
    icon: <LocationOnIcon />,
    title: 'Location',
    description: 'Based in',
    value: 'Los Angeles, CA'
  }
];

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
    acceptTerms: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Call HubSpot API
      const response = await fetch('/api/hubspot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'createLead',
          leadData: {
            Email: formData.email,
            First_Name: formData.firstName,
            Last_Name: formData.lastName,
            Phone: formData.phone,
            Lead_Source: 'Website Contact Form',
            Industry: formData.inquiryType,
            Description: formData.message
          }
        })
      });
      
      const result = await response.json();
      
      if (response.ok && (result.status === 'success' || result.status === 'duplicate')) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          inquiryType: '',
          message: '',
          acceptTerms: false
        });
      } else {
        console.error('HubSpot API error:', result);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SectionContainer>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <Stack spacing={3} alignItems="center" sx={{ mb: 8, textAlign: 'center' }}>
          <Chip 
            label="Get in Touch" 
            sx={{ 
              background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
              color: 'white',
              fontWeight: 600,
              px: 2
            }} 
          />
          
          <GradientText variant="h2" sx={{ fontWeight: 700 }}>
            Let's Connect
          </GradientText>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
              fontWeight: 300
            }}
          >
            Whether you're a fan, fellow artist, or industry professional, I'd love to hear from you.
          </Typography>
        </Stack>

        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} lg={8}>
            <ContactCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                  Send a Message
                </Typography>

                {submitStatus && (
                  <Alert 
                    severity={submitStatus === 'success' ? 'success' : 'error'}
                    sx={{ mb: 3 }}
                  >
                    {submitStatus === 'success' 
                      ? "Thank you for your message! I'll get back to you soon."
                      : "There was an error sending your message. Please try again."
                    }
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Name Fields */}
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange('firstName')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange('lastName')}
                        required
                      />
                    </Grid>

                    {/* Contact Fields */}
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <StyledTextField
                        fullWidth
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange('phone')}
                      />
                    </Grid>

                    {/* Inquiry Type */}
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <FormLabel 
                          component="legend" 
                          sx={{ 
                            color: 'text.primary',
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          Which best describes you?
                        </FormLabel>
                        <RadioGroup
                          value={formData.inquiryType}
                          onChange={handleInputChange('inquiryType')}
                          sx={{
                            '& .MuiFormControlLabel-root': {
                              margin: '8px 0',
                              '& .MuiRadio-root': {
                                color: 'rgba(255, 255, 255, 0.5)',
                                '&.Mui-checked': {
                                  color: '#b542ef'
                                }
                              }
                            }
                          }}
                        >
                          <Grid container spacing={2}>
                            {inquiryTypes.map((type) => (
                              <Grid item xs={12} sm={6} key={type.value}>
                                <FormControlLabel
                                  value={type.value}
                                  control={<Radio />}
                                  label={type.label}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* Message */}
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange('message')}
                        placeholder="Tell me about your project, idea, or just say hello..."
                        required
                      />
                    </Grid>

                    {/* Terms Checkbox */}
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.acceptTerms}
                            onChange={handleInputChange('acceptTerms')}
                            sx={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              '&.Mui-checked': {
                                color: '#b542ef'
                              }
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            I accept the Terms of Service and Privacy Policy
                          </Typography>
                        }
                        required
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting || !formData.acceptTerms}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                        sx={{
                          px: 6,
                          py: 2,
                          fontSize: '1.1rem',
                          background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #d084f7 0%, #ff8dd4 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 30px rgba(181, 66, 239, 0.4)'
                          },
                          '&:disabled': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.3)'
                          }
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </ContactCard>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {contactInfo.map((info, index) => (
                <ContactCard key={index}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #b542ef 0%, #f655c0 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {info.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                          {info.description}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.main' }}>
                          {info.value}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </ContactCard>
              ))}

              {/* Social Media Card */}
              <ContactCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Follow the Journey
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Stay connected for the latest updates, behind-the-scenes content, and new releases.
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    href="https://linktr.ee/kytheonlyone"
                    target="_blank"
                    sx={{ mb: 2 }}
                  >
                    All Social Links
                  </Button>
                </CardContent>
              </ContactCard>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </SectionContainer>
  );
};

export default ContactSection;