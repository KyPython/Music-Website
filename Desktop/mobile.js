document.addEventListener('DOMContentLoaded', function() {
    // Handle all modals
    setupModals();
    
    // Handle navigation and links
    setupNavigation();
    
    // Handle forms
    setupForms();
    
    // Handle cookie consent
    setupCookieConsent();
    
    // Add touch support for mobile
    addMobileSupport();
  });
  
  function setupModals() {
    // Open modal functions
    document.getElementById('open-privacy').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('privacy-modal');
    });
    
    document.getElementById('open-privacy-footer').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('privacy-modal');
    });
    
    document.getElementById('open-terms').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('terms-modal');
    });
    
    document.getElementById('open-terms-footer').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('terms-modal');
    });
    
    document.getElementById('open-cookies').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('cookies-modal');
    });
    
    document.getElementById('learn-more-cookies').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('cookies-modal');
    });
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal, .close-modal-btn');
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        closeAllModals();
      });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    });
    
    // Handle ESC key to close modals
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }
  
  function openModal(modalId) {
    closeAllModals(); // Close any open modals first
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.classList.add('modal-open'); // Prevent background scrolling
      
      // Focus trap for accessibility
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }
  
  function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
  }
  
  function setupNavigation() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(`Navigating to: ${this.getAttribute('href')}`);
        // Uncomment when pages are ready:
        // window.location.href = this.getAttribute('href');
      });
    });
    
    // Stream button
    const streamButton = document.getElementById('stream');
    if (streamButton) {
      streamButton.addEventListener('click', function() {
        console.log('Opening streaming options');
        // Add your streaming logic here
      });
    }
    
    // Sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(`Opening sidebar link: ${this.textContent}`);
        // Uncomment when pages are ready:
        // window.location.href = this.getAttribute('href');
      });
    });
    
    // Read more links
    const readMoreLinks = document.querySelectorAll('.read-more');
    readMoreLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const postId = this.getAttribute('data-post-id');
        console.log(`Reading more about post: ${postId}`);
        // Uncomment when blog posts are ready:
        // window.location.href = `/blog/post/${postId}`;
      });
    });
    
    // Footer links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(`Opening footer link: ${this.textContent}`);
        // Uncomment when pages are ready:
        // window.location.href = this.getAttribute('href');
      });
    });
    
    // Social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.textContent.trim();
        console.log(`Opening ${platform} profile`);
        // Add your social media links here
      });
    });
  }
  
  function setupForms() {
    // Newsletter form in main content
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('newsletter-email').value;
        if (validateEmail(email)) {
          console.log(`Subscribing email: ${email}`);
          alert('Thank you for subscribing!');
          this.reset();
        } else {
          alert('Please enter a valid email address');
        }
      });
    }
    
    // Footer newsletter form
    const footerSubscribe = document.getElementById('footer-subscribe');
    if (footerSubscribe) {
      footerSubscribe.addEventListener('click', function() {
        const email = document.getElementById('footer-email').value;
        if (validateEmail(email)) {
          console.log(`Subscribing email from footer: ${email}`);
          alert('Thank you for subscribing!');
          document.getElementById('footer-email').value = '';
        } else {
          alert('Please enter a valid email address');
        }
      });
    }
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Form validation
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        const termsAccepted = document.getElementById('terms').checked;
        
        if (!firstName || !lastName || !email || !message) {
          alert('Please fill in all required fields');
          return;
        }
        
        if (!validateEmail(email)) {
          alert('Please enter a valid email address');
          return;
        }
        
        if (!termsAccepted) {
          alert('Please accept the terms to continue');
          return;
        }
        
        // Get selected inquiry type
        const inquiryTypes = document.querySelectorAll('input[name="inquiry-type"]');
        let selectedInquiry = '';
        for (const type of inquiryTypes) {
          if (type.checked) {
            selectedInquiry = type.value;
            break;
          }
        }
        
        console.log(`Submitting form: ${firstName} ${lastName}, ${email}, ${selectedInquiry}`);
        alert('Thank you for your message! I\'ll get back to you soon.');
        this.reset();
      });
    }
  }
  
  function setupCookieConsent() {
    // Show cookie banner if consent not given
    if (!localStorage.getItem('cookieConsent')) {
      document.getElementById('cookie-banner').style.display = 'block';
    }
    
    // Accept all cookies
    document.getElementById('accept-cookies').addEventListener('click', function() {
      acceptAllCookies();
      document.getElementById('cookie-banner').style.display = 'none';
    });
    
    // Customize cookies
    document.getElementById('customize-cookies').addEventListener('click', function() {
      document.getElementById('cookie-banner').style.display = 'none';
      openModal('cookies-modal');
    });
    
    // Cookie modal buttons
    document.getElementById('accept-all-cookies').addEventListener('click', function() {
      acceptAllCookies();
      closeAllModals();
    });
    
    document.getElementById('reject-all-cookies').addEventListener('click', function() {
      rejectAllCookies();
      closeAllModals();
    });
    
    document.getElementById('save-cookie-preferences').addEventListener('click', function() {
      saveCookiePreferences();
      closeAllModals();
    });
  }
  
  function acceptAllCookies() {
    document.getElementById('performance-cookies').checked = true;
    document.getElementById('functional-cookies').checked = true;
    document.getElementById('targeting-cookies').checked = true;
    
    saveCookiePreferences();
  }
  
  function rejectAllCookies() {
    document.getElementById('performance-cookies').checked = false;
    document.getElementById('functional-cookies').checked = false;
    document.getElementById('targeting-cookies').checked = false;
    
    saveCookiePreferences();
  }
  
  function saveCookiePreferences() {
    const preferences = {
      essential: true, // Always required
      performance: document.getElementById('performance-cookies').checked,
      functional: document.getElementById('functional-cookies').checked,
      targeting: document.getElementById('targeting-cookies').checked
    };
    
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    
    console.log('Cookie preferences saved:', preferences);
  }
  
  function addMobileSupport() {
    // Add touch event listeners for better mobile experience
    const clickableElements = document.querySelectorAll('a, button, .radio-option, .checkbox-option');
    
    clickableElements.forEach(element => {
      // Add active state for touch devices
      element.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      }, { passive: true });
      
      element.addEventListener('touchend', function() {
        this.classList.remove('touch-active');
      }, { passive: true });
      
      // Prevent double-tap zoom on mobile
      element.addEventListener('touchend', function(e) {
        e.preventDefault();
        // The actual click event will still fire
      }, { passive: false });
    });
    
    // Handle mobile menu if you add one later
    // This is a placeholder for future mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', function() {
        document.querySelector('.nav-menu').classList.toggle('mobile-open');
      });
    }
  }
  
  // Helper function to validate email
  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  document.addEventListener('DOMContentLoaded', function() {
    // Setup tooltips for policy links
    setupPolicyTooltips();
    
    // Handle modals (for "View Full Policy" buttons)
    setupModals();
    
    // Rest of your existing setup functions
    setupNavigation();
    setupForms();
    setupCookieConsent();
    addMobileSupport();
  });
  
  function setupPolicyTooltips() {
    // Handle "View Full Policy" buttons inside tooltips
    const viewFullButtons = document.querySelectorAll('.view-full-policy');
    viewFullButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent the tooltip's parent events from firing
        const modalId = this.getAttribute('data-modal');
        openModal(modalId);
      });
    });
    
    // For touch devices, toggle tooltip visibility on tap
    if (isTouchDevice()) {
      const policyTooltips = document.querySelectorAll('.policy-tooltip');
      policyTooltips.forEach(tooltip => {
        const link = tooltip.querySelector('a');
        if (link) {
          link.addEventListener('touchstart', function(e) {
            // Prevent immediate click
            e.preventDefault();
            
            // Remove active class from all other tooltips
            document.querySelectorAll('.policy-tooltip.touch-active').forEach(activeTooltip => {
              if (activeTooltip !== tooltip) {
                activeTooltip.classList.remove('touch-active');
              }
            });
            
            // Toggle active class on this tooltip
            tooltip.classList.toggle('touch-active');
            
            // Stop propagation to prevent document handler from firing
            e.stopPropagation();
          });
        }
      });
      
      // Close tooltips when tapping elsewhere
      document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.policy-tooltip')) {
          document.querySelectorAll('.policy-tooltip.touch-active').forEach(tooltip => {
            tooltip.classList.remove('touch-active');
          });
        }
      });
    }
    
    // Prevent default behavior for policy links to avoid navigation
    const policyLinks = document.querySelectorAll('.policy-tooltip > a');
    policyLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        // Open the full modal on click
        const tooltip = this.closest('.policy-tooltip');
        const viewFullBtn = tooltip.querySelector('.view-full-policy');
        if (viewFullBtn) {
          const modalId = viewFullBtn.getAttribute('data-modal');
          if (modalId) {
            openModal(modalId);
          }
        }
      });
    });
    
    // Mini cookie toggles in the tooltip
    const miniCookieToggles = document.querySelectorAll('#performance-cookies-mini, #functional-cookies-mini, #targeting-cookies-mini');
    miniCookieToggles.forEach(toggle => {
      toggle.addEventListener('change', function(e) {
        // Stop propagation to prevent closing the tooltip
        e.stopPropagation();
        
        // Sync with main cookie settings
        const mainToggleId = this.id.replace('-mini', '');
        const mainToggle = document.getElementById(mainToggleId);
        if (mainToggle) {
          mainToggle.checked = this.checked;
        }
        
        // Save preferences
        saveCookiePreferences();
      });
    });
  }
  
  // Helper function to detect touch devices
  function isTouchDevice() {
    return ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0);
  }
  
  function setupModals() {
    // Open modal functions - these will now be triggered by clicking the links directly
    document.getElementById('open-privacy').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('privacy-modal');
    });
    
    document.getElementById('open-privacy-footer').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('privacy-modal');
    });
    
    document.getElementById('open-terms').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('terms-modal');
    });
    
    document.getElementById('open-terms-footer').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('terms-modal');
    });
    
    document.getElementById('open-cookies').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('cookies-modal');
    });
    
    document.getElementById('learn-more-cookies').addEventListener('click', function(e) {
      e.preventDefault();
      openModal('cookies-modal');
    });
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal, .close-modal-btn');
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        closeAllModals();
      });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    });
    
    // Handle ESC key to close modals
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }
  
  function openModal(modalId) {
    closeAllModals(); // Close any open modals first
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.classList.add('modal-open'); // Prevent background scrolling
      
      // Focus trap for accessibility
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }
  
  function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
  }
  
  // Add this to your initialization
function addTooltipStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .tooltip-content {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      /* Only show tooltips when parent is hovered/focused and has active class */
      .policy-tooltip:hover .tooltip-content,
      .policy-tooltip:focus .tooltip-content,
      .policy-tooltip.active .tooltip-content {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Call this function on load
  document.addEventListener('DOMContentLoaded', function() {
    addTooltipStyles();
    // Other initialization...
  });

  // Add this to your CSS for mini toggles in tooltips
  function addMiniToggleStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .toggle-switch-mini {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 18px;
        margin-right: 8px;
        vertical-align: middle;
      }
      
      .toggle-switch-mini input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .toggle-slider-mini {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .3s;
        border-radius: 18px;
      }
      
      .toggle-slider-mini:before {
        position: absolute;
        content: "";
        height: 12px;
        width: 12px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
      }
      
      input:checked + .toggle-slider-mini {
        background-color: #2196F3;
      }
      
      input:checked + .toggle-slider-mini:before {
        transform: translateX(18px);
      }
      
      .cookie-option-mini {
        display: flex;
        align-items: center;
        margin: 8px 0;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Call this function on load
  document.addEventListener('DOMContentLoaded', function() {
    addMiniToggleStyles();
    // Other initialization...
  });
  // Setup policy tooltips and modals
// Setup policy tooltips and modals
function setupPolicyTooltips() {
    // Immediately hide all tooltips with inline styles
    forceHideAllTooltips();
    
    // Handle "View Full Policy" buttons inside tooltips
    const viewFullButtons = document.querySelectorAll('.view-full-policy');
    viewFullButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent the tooltip's parent events from firing
        const modalId = this.getAttribute('data-modal');
        openModal(modalId);
      });
    });
    
    // Prevent default behavior for policy links to avoid navigation
    const policyLinks = document.querySelectorAll('.policy-tooltip > a');
    policyLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        // Open the full modal on click
        const tooltip = this.closest('.policy-tooltip');
        const viewFullBtn = tooltip.querySelector('.view-full-policy');
        if (viewFullBtn) {
          const modalId = viewFullBtn.getAttribute('data-modal');
          if (modalId) {
            openModal(modalId);
          }
        }
      });
    });
  }
  
  // Force hide all tooltips with inline styles
  // Force hide all tooltips with inline styles
function forceHideAllTooltips() {
    document.querySelectorAll('.tooltip-content, .policy-tooltip .tooltip-content').forEach(tooltip => {
      tooltip.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
    });
  }
  
  // Initialize tooltips when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Hide tooltips immediately
    forceHideAllTooltips();
    
    // Setup other functionality
    setupPolicyTooltips();
    setupModals();
    
    // Ensure tooltips are hidden initially
    setTimeout(forceHideAllTooltips, 100);
  });
  
  // Additional function to ensure tooltips remain hidden after page interactions
  window.addEventListener('load', function() {
    // Double-check that tooltips are hidden after all resources load
    forceHideAllTooltips();
  });
  
  // Add a MutationObserver to ensure tooltips stay hidden if DOM changes
  document.addEventListener('DOMContentLoaded', function() {
    // Create an observer instance
    const observer = new MutationObserver(function() {
      // Force hide tooltips after any DOM changes
      forceHideAllTooltips();
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      childList: true,
      subtree: true 
    });
    
    // Disconnect after 5 seconds to avoid performance issues
    setTimeout(function() {
      observer.disconnect();
    }, 5000);
  });
  // Setup policy links to open modals directly
function setupPolicyLinks() {
    // Get all policy links
    const policyLinks = document.querySelectorAll('.policy-link > a');
    
    // Add click event to open the corresponding modal
    policyLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const modalId = this.getAttribute('data-modal');
        if (modalId) {
          openModal(modalId);
        }
      });
    });
  }
  
  // Function to open modals
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.classList.add('modal-open');
      
      // Add event listener to close button
      const closeButtons = modal.querySelectorAll('.close-modal, .close-modal-btn');
      closeButtons.forEach(button => {
        button.addEventListener('click', function() {
          closeModal(modal);
        });
      });
      
      // Close modal when clicking outside content
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  }
  
  // Function to close modals
  function closeModal(modal) {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    setupPolicyLinks();
    
    // Setup close functionality for all modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      // Close button
      const closeButtons = modal.querySelectorAll('.close-modal, .close-modal-btn');
      closeButtons.forEach(button => {
        button.addEventListener('click', function() {
          closeModal(modal);
        });
      });
      
      // Close when clicking outside
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });
  });
    // Add a MutationObserver to ensure tooltips stay hidden if DOM changes
  document.addEventListener('DOMContentLoaded', function() {
    // Create an observer instance
    const observer = new MutationObserver(function() {
      // Force hide tooltips after any DOM changes
      forceHideAllTooltips();
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, { 
      childList: true,
      subtree: true 
    });
    
    // Disconnect after 5 seconds to avoid performance issues
    setTimeout(function() {
      observer.disconnect();
    }, 5000);
  });
  // Fix for social links - add this to your JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    // Get all social links
    const socialLinks = document.querySelectorAll('.social-link');
    
    // For each social link
    socialLinks.forEach(link => {
      // Store the original href
      const href = link.getAttribute('href');
      
      // Add a click event listener
      link.addEventListener('click', function(e) {
        // Prevent the default action
        e.preventDefault();
        
        // Open the link in a new tab
        window.open(href, '_blank', 'noopener');
      });
      
      // Add a visual indicator when hovering
      link.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(255, 0, 255, 0.1)';
        this.style.color = 'var(--color-fuchsia-pink)';
      });
      
      link.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
        this.style.color = '';
      });
    });
  });