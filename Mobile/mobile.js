document.addEventListener('DOMContentLoaded', function() {
    // Setup tooltips for policy links
    setupMobilePolicyTooltips();
    
    // Handle modals
    setupMobileModals();
    
    // Other initialization functions
    setupMobileNavigation();
    setupMobileForms();
});

function setupMobilePolicyTooltips() {
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
    
    // Handle "View Full Policy" buttons inside tooltips
    const viewFullButtons = document.querySelectorAll('.view-full-policy');
    viewFullButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent the tooltip's parent events from firing
            const modalId = this.getAttribute('data-modal');
            openMobileModal(modalId);
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
                    openMobileModal(modalId);
                }
            }
        });
    });
}

function setupMobileModals() {
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal, .close-modal-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeMobileModals();
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                closeMobileModals();
            }
        });
    });
    
    // Handle ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileModals();
        }
    });
}

function openMobileModal(modalId) {
    closeMobileModals(); // Close any open modals first
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

function closeMobileModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
}

// Helper function to detect touch devices
function isTouchDevice() {
    return ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0);
}

// Other mobile-specific functions
function setupMobileNavigation() {
    // Mobile navigation setup
}

function setupMobileForms() {
    // Mobile forms setup
}
document.addEventListener('DOMContentLoaded', function() {
    // Setup tooltips for policy links
    setupMobilePolicyTooltips();
    
    // Handle modals
    setupMobileModals();
    
    // Other initialization functions
    setupMobileNavigation();
    setupMobileForms();
    
    // Ensure tooltips are hidden on page load
    document.querySelectorAll('.tooltip-content').forEach(tooltip => {
      tooltip.style.display = 'none';
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
    });
  });
  
  // Additional function to ensure tooltips remain hidden after page interactions
  window.addEventListener('load', function() {
    // Double-check that tooltips are hidden after all resources load
    document.querySelectorAll('.tooltip-content').forEach(tooltip => {
      tooltip.style.display = 'none';
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
    });
  });