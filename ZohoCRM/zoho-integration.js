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
    // Attach to canonical zoho-form plus known form IDs/classes to avoid requiring HTML edits
    const selectors = [
      'form.zoho-form',
      'form#newsletter-form',
      'form#contact-form',
      '.footer-newsletter form',
      'form.newsletter-form'
    ];
    const seen = new Set();
    selectors.join(',').split(',').forEach(sel => {
      document.querySelectorAll(sel.trim()).forEach(f => {
        if (seen.has(f)) return; seen.add(f);
        f.removeEventListener('submit', handleSubmit);
        f.addEventListener('submit', handleSubmit);
        try { f.dataset.jsAttached = '1'; } catch (e) {}
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
