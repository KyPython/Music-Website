// Universal Zoho form integration
(function () {
  'use strict';

  function getFormData(form) {
    const data = {};
    const fm = new FormData(form);
    for (const [k, v] of fm.entries()) {
      data[k] = v;
    }

    // Also map common id-based fields
    if (!data.First_Name && form.querySelector('#firstName')) data.First_Name = form.querySelector('#firstName').value;
    if (!data.Last_Name && form.querySelector('#lastName')) data.Last_Name = form.querySelector('#lastName').value;
    if (!data.Email && form.querySelector('#email')) data.Email = form.querySelector('#email').value;
    if (!data.Phone && form.querySelector('#phone')) data.Phone = form.querySelector('#phone').value;
    if (!data.Description && form.querySelector('#message')) data.Description = form.querySelector('#message').value;

    // Normalize radio group for inquiry-type
    if (!data.lead_type) {
      const checked = form.querySelector('input[name="inquiry-type"]:checked');
      if (checked) data.lead_type = checked.value;
    }

    return data;
  }

  async function postToZoho(payload) {
    const res = await fetch('/api/zoho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    try {
      return { ok: res.ok, status: res.status, json: JSON.parse(txt) };
    } catch (e) {
      return { ok: res.ok, status: res.status, text: txt };
    }
  }

  function showStatus(form, msg, ok) {
    let el = form.querySelector('.zoho-status');
    if (!el) {
      el = document.createElement('div');
      el.className = 'zoho-status';
      el.style.marginTop = '0.5rem';
      form.appendChild(el);
    }
    el.textContent = msg;
    el.style.color = ok ? 'green' : 'red';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    // Prevent duplicate submissions
    if (form.dataset.submitting === '1') {
      console.warn('Form already submitting, ignoring duplicate submit', form);
      return;
    }
    form.dataset.submitting = '1';
    // Disable submit buttons to avoid double clicks
    const submitButtons = Array.from(form.querySelectorAll('button[type="submit"], input[type="submit"]'));
    submitButtons.forEach(b => { try { b.disabled = true; } catch (e) {} });

    showStatus(form, 'Sending...', false);
    const data = getFormData(form);
    console.debug('Zoho integration: submitting form', form.id || form.className, data);

    // Client-side validation to avoid native browser 'not focusable' errors
    // Ensure at least one inquiry-type radio is selected when the group exists
    const inquiryGroup = form.querySelectorAll('input[name="inquiry-type"]');
    if (inquiryGroup && inquiryGroup.length > 0) {
      const checked = form.querySelector('input[name="inquiry-type"]:checked');
      if (!checked) {
        showStatus(form, 'Please select an option for "Which best describes you?"', false);
        // focus the first visible radio so the user can act
        const first = inquiryGroup[0];
        if (first && typeof first.focus === 'function') first.focus();
        return;
      }
    }

    // Ensure terms checkbox is checked if present
    const terms = form.querySelector('input[name="terms"]');
    if (terms) {
      if (!terms.checked) {
        showStatus(form, 'Please accept the Terms to continue.', false);
        try { terms.focus(); } catch (e) {}
        return;
      }
    }

    const lead = {
      First_Name: data.First_Name || data.first_name || data.fname || '',
      Last_Name: data.Last_Name || data.last_name || data.lname || '',
      Email: data.Email || data.email || '',
      Phone: data.Phone || data.phone || '',
      Description: data.Description || data.message || '',
      Lead_Source: data.lead_source || data.Lead_Source || 'Website Form'
    };

    // Map inquiry type
    if (data.lead_type) {
      lead.Industry = data.lead_type;
    }

    // Try sending, with one retry on network failure
    let attempt = 0;
    let lastError = null;
    while (attempt < 2) {
      attempt += 1;
      try {
        const resp = await postToZoho({ action: 'createLead', leadData: lead });
        if (resp.ok && resp.json && resp.json.zoho) {
          showStatus(form, 'Thanks — we got your submission.', true);
          form.reset();
          lastError = null;
          break;
        } else if (resp.ok && resp.json) {
          showStatus(form, 'Submission succeeded', true);
          form.reset();
          lastError = null;
          break;
        } else {
          const msg = resp.json ? JSON.stringify(resp.json) : resp.text || 'Unknown error';
          showStatus(form, 'Error: ' + msg, false);
          console.error('Zoho submit failed', resp);
          lastError = new Error('Zoho API error: ' + (resp.status || 'no-status'));
          break; // don't retry on application-level errors
        }
      } catch (err) {
        lastError = err;
        console.warn('Zoho integration network error, attempt', attempt, err);
        if (attempt < 2) {
          // short backoff before retry
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
      }
    }
    if (lastError) {
      showStatus(form, 'Network or server error', false);
      console.error('Zoho submit final error', lastError);
    }
  // re-enable submit buttons and clear submitting flag
  submitButtons.forEach(b => { try { b.disabled = false; } catch (e) {} });
  try { delete form.dataset.submitting; } catch (e) {}

  setTimeout(() => showStatus(form, ''), 5000);
  }

  function init() {
    // Startup/logging: helps debug when the script is loaded but handlers aren't firing
    try {
      console.info('ZohoCRM: script loaded — init starting', { readyState: document.readyState });
    } catch (e) {}

    // Global error handlers to surface runtime problems to the console so the user can paste them
    try {
      window.addEventListener('error', function (ev) {
        try { console.error('ZohoCRM: window error', ev.error || ev.message, ev); } catch (e) {}
      });
      window.addEventListener('unhandledrejection', function (ev) {
        try { console.error('ZohoCRM: unhandled rejection', ev.reason, ev); } catch (e) {}
      });
    } catch (e) {}

    // Early pointerdown capture: attach handler to the form before a native submit can race
    // This is non-UI and only binds event listeners on the document.
    try {
      document.addEventListener('pointerdown', function (e) {
        try {
          const btn = e.target && e.target.closest && e.target.closest('button[type="submit"], input[type="submit"], button');
          if (!btn) return;
          const form = btn.form || btn.closest && btn.closest('form');
          if (!form) return;
          if (form.dataset && form.dataset.zohoAttached !== '1') {
            attachForm(form);
            try { console.debug('ZohoCRM: attached handler on pointerdown for form', form.id || form.className); } catch (e) {}
          }
        } catch (e) {}
      }, true);
    } catch (e) {}

    // Click capture: useful for buttons that may not produce a form submit event (type=button)
    try {
      document.addEventListener('click', function (e) {
        try {
          const btn = e.target && e.target.closest && e.target.closest('button[type="submit"], input[type="submit"], button, a');
          if (!btn) return;
          const form = btn.form || btn.closest && btn.closest('form');
          try { console.debug('ZohoCRM: click detected', btn, 'form', form ? (form.id || form.className) : null); } catch (e) {}
          if (!form) return;
          if (form.dataset && form.dataset.zohoAttached !== '1') {
            attachForm(form);
            try { console.debug('ZohoCRM: attached handler on click for form', form.id || form.className); } catch (e) {}
          }
        } catch (e) {}
      }, true);
    } catch (e) {}
    // Attach helper that is idempotent
    function attachForm(f){
      if (!f || f.dataset.zohoAttached === '1') return;
      try { f.removeEventListener('submit', handleSubmit); } catch(e){}
      try { f.addEventListener('submit', handleSubmit); } catch(e){}
      try { f.dataset.zohoAttached = '1'; f.dataset.jsAttached = '1'; } catch(e){}
      try { console.log('ZohoCRM: attached handler to form', f.id || f.className || f); } catch(e){}
    }

    // Initial selectors to attach to (no HTML edits required)
    const selectors = [
      'form.zoho-form',
      'form#newsletter-form',
      'form#contact-form',
      '.footer-newsletter form',
      'form.newsletter-form'
    ];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(attachForm);
    });

  // As a robust fallback, capture native form submits at document level and route to our handler
    document.addEventListener('submit', function(e){
      try {
        const t = e.target;
        if (!t || !(t instanceof HTMLFormElement)) return;
        // If this form already has our handler, let it run; otherwise run our handler
        if (t.dataset.zohoAttached !== '1') {
          // prevent native navigation
          try { e.preventDefault(); } catch(e){}
          attachForm(t);
          // call our handler with a synthetic event-like object
          try { handleSubmit({ preventDefault: function(){}, currentTarget: t }); } catch(err){ console.error('ZohoCRM: error in fallback submit handler', err); }
        }
      } catch(err){ console.error('ZohoCRM submit-capture error', err); }
    }, true);

    // Observe DOM mutations to attach to forms added later without touching HTML
    try {
      const mo = new MutationObserver(function(mutations){
        for (const m of mutations) {
          if (!m.addedNodes) continue;
          m.addedNodes.forEach(node => {
            try {
              if (!(node instanceof Element)) return;
              // If the added node is a form itself
              if (node.matches && node.matches('form.zoho-form, form#newsletter-form, form#contact-form, form.newsletter-form, .footer-newsletter form')) {
                attachForm(node);
              }
              // Or contains such forms
              node.querySelectorAll && node.querySelectorAll('form.zoho-form, form#newsletter-form, form#contact-form, form.newsletter-form, .footer-newsletter form').forEach(attachForm);
            } catch(e){}
          });
        }
      });
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    } catch(e){ /* ignore in older browsers */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
