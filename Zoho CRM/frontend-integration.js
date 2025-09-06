// Form submission handlers for your website forms

// Newsletter subscription form handler
async function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = this.querySelector('input[type="email"]');
  const email = emailInput.value;
  
  try {
    const response = await fetch('/api/vercel-zoho-integration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createLead',
        leadData: {
          Email: email,
          Last_Name: 'Newsletter Subscriber',
          Lead_Source: 'Website Newsletter',
          Description: 'Subscribed to newsletter from main form'
        }
      })
    });
    
    if (!response.ok) throw new Error('Submission failed');
    
    alert('Thank you for subscribing!');
    this.reset();
  } catch (error) {
    console.error('Error:', error);
    alert('There was an error. Please try again later.');
  }
}

// Contact form handler
async function handleContactFormSubmit(e) {
  e.preventDefault();
  const firstName = this.querySelector('input[name="firstName"]').value;
  const lastName = this.querySelector('input[name="lastName"]').value;
  const email = this.querySelector('input[name="email"]').value;
  const phone = this.querySelector('input[name="phone"]').value;
  const inquiryType = this.querySelector('select[name="inquiryType"]').value;
  const message = this.querySelector('textarea[name="message"]').value;
  
  try {
    const response = await fetch('/api/vercel-zoho-integration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createLead',
        leadData: {
          First_Name: firstName,
          Last_Name: lastName,
          Email: email,
          Phone: phone,
          Description: message,
          Lead_Source: 'Website Contact Form',
          Industry: inquiryType
        }
      })
    });
    
    if (!response.ok) throw new Error('Submission failed');
    
    alert('Thank you for your message! I\'ll get back to you soon.');
    this.reset();
  } catch (error) {
    console.error('Error:', error);
    alert('There was an error. Please try again later.');
  }
}

// Initialize form handlers
function initFormHandlers() {
  // Main newsletter form
  const mainNewsletterForm = document.querySelector('.newsletter-form');
  if (mainNewsletterForm) {
    mainNewsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
  
  // Footer newsletter form
  const footerNewsletterForm = document.querySelector('.footer-newsletter form');
  if (footerNewsletterForm) {
    footerNewsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
  
  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initFormHandlers);