// Vercel Serverless Function: /api/zoho.ts
// Environment variables expected:
// ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, optional ZOHO_REGION (com|eu|in|au)
// Optional anti-abuse: RECAPTCHA_SECRET (verify client token), RATE_LIMIT_WINDOW (seconds), RATE_LIMIT_MAX (requests)
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_REGION = (process.env.ZOHO_REGION || 'com').toLowerCase();
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || '';
const RATE_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW || '60'); // seconds
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || '10');

function getZohoDomains(region: string) {
  // Default to global (.com) endpoints. Add mappings for other regions as needed.
  switch (region) {
    case 'eu':
      return { accounts: 'https://accounts.zoho.eu', api: 'https://www.zohoapis.eu' };
    case 'in':
      return { accounts: 'https://accounts.zoho.in', api: 'https://www.zohoapis.in' };
    case 'au':
      return { accounts: 'https://accounts.zoho.com.au', api: 'https://www.zohoapis.com.au' };
    default:
      return { accounts: 'https://accounts.zoho.com', api: 'https://www.zohoapis.com' };
  }
}

// Basic validation of required environment variables to make errors obvious in logs
function ensureEnv() {
  const missing: string[] = [];
  if (!ZOHO_CLIENT_ID) missing.push('ZOHO_CLIENT_ID');
  if (!ZOHO_CLIENT_SECRET) missing.push('ZOHO_CLIENT_SECRET');
  if (!ZOHO_REFRESH_TOKEN) missing.push('ZOHO_REFRESH_TOKEN');
  if (missing.length) {
    throw new Error('Missing environment variables: ' + missing.join(', '));
  }
}

// Helper: Get Zoho access token (with better error messages)
async function getZohoAccessToken() {
  ensureEnv();
  const domains = getZohoDomains(ZOHO_REGION);
  const params = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN || '',
    client_id: ZOHO_CLIENT_ID || '',
    client_secret: ZOHO_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
  });
  const url = `${domains.accounts}/oauth/v2/token`;
  const res = await fetch(url, {
          const { action, leadData, recaptchaToken } = req.body || {};
          if (action !== 'createLead' || !leadData) {
            res.status(400).json({ error: 'Invalid request: expected { action: "createLead", leadData: {...} }' });
            return;
          }
          // Map inquiry type and message robustly
          const inquiryType = leadData.lead_type || leadData.Industry || leadData.inquiry_type || '';
          const message = leadData.Description || leadData.message || leadData.Message || '';
          // Transform incoming form payload to Zoho field names
          const transformed = transformLeadData({
            ...leadData,
            Industry: inquiryType,
            Description: message,
          });
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse token response (${res.status}): ${text}`);
  }
  if (!data.access_token) {
    throw new Error('Zoho access token error: ' + JSON.stringify(data));
  }
  return data.access_token;
}

// Map incoming form fields to Zoho CRM field names
function transformLeadData(incoming: any) {
  const lead: any = {};

  // If incoming already uses Zoho API field names, copy them directly
  const directFields = ['First_Name', 'Last_Name', 'Email', 'Phone', 'Description', 'Lead_Source', 'Company'];
  directFields.forEach(f => {
    if (incoming[f] !== undefined) lead[f] = incoming[f];
  });

  // Map common friendly keys to Zoho field names, but don't overwrite existing direct fields
  const mapping: Record<string, string> = {
    firstName: 'First_Name',
    lastName: 'Last_Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Description',
    'inquiry-type': 'Lead_Source',
    inquiryType: 'Lead_Source',
    company: 'Company',
  };
  Object.entries(mapping).forEach(([key, zohoKey]) => {
    if (incoming[key] !== undefined && lead[zohoKey] === undefined) {
      lead[zohoKey] = incoming[key];
    }
  });

  // Provide a sensible default for Company if still missing
  if (!lead.Company) {
    const first = lead.First_Name || incoming.firstName || '';
    const last = lead.Last_Name || incoming.lastName || '';
    const name = `${first} ${last}`.trim();
    lead.Company = name || 'Individual';
  }

  return lead;
}

// Helper: Create Zoho Lead with robust error handling
async function createZohoLead(accessToken: string, leadData: any) {
  const domains = getZohoDomains(ZOHO_REGION);
  const url = `${domains.api}/crm/v2/Leads`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      // Debug: log incoming request
      try {
        console.log('ZohoAPI: Incoming request', {
          method: req.method,
          url: req.url,
          headers: Object.assign({}, req.headers, { authorization: undefined }),
          body: req.body
        });
      } catch (e) { console.error('ZohoAPI: Error logging request', e); }

      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      try {
        const { action, leadData, recaptchaToken } = req.body || {};
        if (action !== 'createLead' || !leadData) {
          res.status(400).json({ error: 'Invalid request: expected { action: "createLead", leadData: {...} }' });
          return;
        }

        // Map inquiry type and message robustly
        const inquiryType = leadData.lead_type || leadData.Industry || leadData.inquiry_type || '';
        const message = leadData.Description || leadData.message || leadData.Message || '';

        // Construct Zoho payload
        const zohoPayload = {
          First_Name: leadData.First_Name || leadData.first_name || leadData.fname || '',
          Last_Name: leadData.Last_Name || leadData.last_name || leadData.lname || '',
          Email: leadData.Email || leadData.email || '',
          Phone: leadData.Phone || leadData.phone || '',
          Lead_Source: leadData.Lead_Source || leadData.lead_source || 'Website Form',
          Industry: inquiryType,
          Description: message,
        };
        // Debug: log full Zoho payload
        try {
          console.log('ZohoAPI: Payload sent to Zoho', JSON.stringify(zohoPayload, null, 2));
        } catch (e) { console.error('ZohoAPI: Error logging Zoho payload', e); }

        // Optional reCAPTCHA verification (if RECAPTCHA_SECRET is set)
        if (typeof RECAPTCHA_SECRET !== 'undefined' && RECAPTCHA_SECRET) {
          if (!recaptchaToken) {
            res.status(400).json({ error: 'Missing recaptchaToken' });
            return;
          }
          try {
            const r = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: recaptchaToken }).toString(),
            });
            const rv = await r.json();
            if (!rv.success || (rv.score !== undefined && rv.score < 0.3)) {
              res.status(403).json({ error: 'Recaptcha verification failed', recaptcha: rv });
              return;
            }
          } catch (reErr) {
            console.error('Recaptcha verification error', reErr);
            res.status(500).json({ error: 'Recaptcha verification error' });
            return;
          }
        }

        // Get an access token and create the lead
        const accessToken = await getZohoAccessToken();
        let zohoRes: any = {};
        try {
          zohoRes = await createZohoLead(accessToken, zohoPayload);
          // Debug: log Zoho API response
          console.log('ZohoAPI: Zoho response', JSON.stringify(zohoRes, null, 2));
        } catch (e) {
          console.error('ZohoAPI: Error sending to Zoho', e);
        }

        // Return the Zoho response directly for debugging/visibility
        res.status(200).json({ ok: true, zoho: zohoRes });
      } catch (err: any) {
        // Log full error server-side (Vercel logs)
        console.error('api/zoho error:', err);
        // Return useful error message to client but avoid leaking secrets
        res.status(500).json({ error: err.message || String(err) });
      }
  } catch (err: any) {
    // Log full error server-side (Vercel logs)
    console.error('api/zoho error:', err);
    // Return useful error message to client but avoid leaking secrets
    res.status(500).json({ error: err.message || String(err) });
  }
}
