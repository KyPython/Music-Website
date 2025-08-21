// Zoho CRM Integration
function initZohoCRMIntegration() {
  console.log('Setting up Zoho CRM integration');
  
  // Newsletter subscription form
  const newsletterForms = document.querySelectorAll('form.newsletter-form');
  newsletterForms.forEach(form => {
    console.log('Found newsletter form:', form);
    
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const email = form.querySelector('input[type="email"]').value;
      if (!email || !email.includes('@')) {
        // Show validation error
        const errorMsg = document.createElement('div');
        errorMsg.className = 'form-error-message form-message';
        errorMsg.style.color = 'red';
        errorMsg.style.marginTop = '10px';
        errorMsg.textContent = 'Please enter a valid email address.';
        form.appendChild(errorMsg);
        return;
      }
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;
      
      console.log('Submitting to Zoho CRM:', email);
      
      // Submit to Zoho CRM
      submitToZohoCRM({
        formType: 'newsletter',
        leadData: {
          Email: email,
          Lead_Source: 'Website Newsletter',
          Last_Name: 'Newsletter Subscriber',
          Description: 'Subscribed to newsletter from website'
        }
      });
    });
  });
}

// Function to submit data to Zoho CRM via server proxy
function submitToZohoCRM(submission) {
  // Show loading state
  const form = submission.formType === 'newsletter' ? 
    document.querySelector('form.newsletter-form') : 
    document.querySelector('form.contact-form');
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Path to the PHP file - adjusted for your file structure
  const proxyPath = '/Zoho%20CRM/zoho-proxy.php';
  
  console.log('Submitting to Zoho CRM:', submission.leadData);
  console.log('Using proxy path:', proxyPath);
  
  // Use the server proxy to create a lead
  fetch(proxyPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'createLead',
      leadData: submission.leadData
    })
  })
  .then(response => {
    console.log('Response status:', response.status);
    return response.text().then(text => {
      console.log('Response text:', text);
      if (!response.ok) {
        throw new Error('Server proxy request failed with status: ' + response.status + ' - ' + text);
      }
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response as JSON:', text);
        throw new Error('Invalid JSON response');
      }
    });
  })
  .then(result => {
    // Success handling
    console.log('Zoho CRM submission successful:', result);
    submitBtn.textContent = 'Success!';
    form.reset();
    
    // Remove any existing messages
    const existingMessages = form.querySelectorAll('.form-success-message, .form-error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'form-success-message';
    successMsg.style.color = 'green';
    successMsg.style.marginTop = '10px';
    successMsg.textContent = 'Thanks for subscribing!';
    form.appendChild(successMsg);
    
    // Reset button after delay
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  })
  .catch(error => {
    console.error('Error submitting to Zoho CRM:', error);
    submitBtn.textContent = 'Error';
    
    // Remove any existing messages
    const existingMessages = form.querySelectorAll('.form-success-message, .form-error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Show error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'form-error-message';
    errorMsg.style.color = 'red';
    errorMsg.style.marginTop = '10px';
    errorMsg.textContent = 'There was an error submitting your information. Please try again.';
    form.appendChild(errorMsg);
    
    // Reset button after delay
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  });
}

// Add this function to test the connection
function testZohoConnection() {
  console.log('Testing Zoho connection...');
  
  // Use the correct path to the Zoho proxy
  const proxyPath = '/Zoho%20CRM/zoho-proxy.php';
  
  fetch(proxyPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'createLead',
      leadData: {
        Email: 'test@example.com',
        Lead_Source: 'Website Test',
        Last_Name: 'Test User',
        Description: 'Test connection'
      }
    })
  })
  .then(response => {
    console.log('Test response status:', response.status);
    return response.text();
  })
  .then(text => {
    console.log('Test response text:', text);
    try {
      const json = JSON.parse(text);
      console.log('Test response JSON:', json);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
    }
  })
  .catch(error => {
    console.error('Test connection error:', error);
  });
}

// Call the test function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, testing Zoho connection...');
  testZohoConnection();
});

// Initialize when the script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initZohoCRMIntegration);
} else {
  initZohoCRMIntegration();
}
