/// <reference types="node" />
// Vercel Serverless Function: /api/zoho.ts
// Environment variables expected:
// ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, optional ZOHO_REGION (com|eu|in|au)
// Optional anti-abuse: RECAPTCHA_SECRET (verify client token), RATE_LIMIT_WINDOW (seconds), RATE_LIMIT_MAX (requests)

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || '';
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || '';
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || '';
const ZOHO_REGION = (process.env.ZOHO_REGION || 'com').toLowerCase();
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || '';

    function getZohoDomains(region: string): { accounts: string; api: string } {
      switch (region) {
        case 'eu': return { accounts: 'https://accounts.zoho.eu', api: 'https://www.zohoapis.eu' };
        case 'in': return { accounts: 'https://accounts.zoho.in', api: 'https://www.zohoapis.in' };
        case 'au': return { accounts: 'https://accounts.zoho.com.au', api: 'https://www.zohoapis.com.au' };
        default: return { accounts: 'https://accounts.zoho.com', api: 'https://www.zohoapis.com' };
      }
    }

    async function getZohoAccessToken(): Promise<string> {
      const domains = getZohoDomains(ZOHO_REGION);
      const params = new URLSearchParams({
        refresh_token: ZOHO_REFRESH_TOKEN || '',
        client_id: ZOHO_CLIENT_ID || '',
        client_secret: ZOHO_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
      });
      const url = `${domains.accounts}/oauth/v2/token`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const text = await res.text();
      let data: { access_token?: string; [key: string]: any };
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

    async function createZohoLead(accessToken: string, leadData: Record<string, any>): Promise<any> {
      const domains = getZohoDomains(ZOHO_REGION);
      const url = `${domains.api}/crm/v2/Leads`;
      const payload = { data: [leadData] };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Failed to parse Zoho response (${res.status}): ${text}`);
      }
      return data;
    }

    export default async function handler(req: any, res: any) {
      try {
        console.log('ZohoAPI: Incoming request', {
          method: req.method,
          url: req.url,
          headers: Object.assign({}, req.headers, { authorization: undefined }),
          body: req.body
        });
        // Log raw request body for debugging
        try {
          console.log('ZohoAPI: Raw req.body:', JSON.stringify(req.body));
        } catch (e) {
          console.log('ZohoAPI: Could not stringify req.body:', req.body);
        }

        if (req.method !== 'POST') {
          res.status(405).json({ error: 'Method not allowed' });
          return;
        }

        const { action, leadData, recaptchaToken } = req.body || {};
        if (action !== 'createLead' || !leadData) {
          res.status(400).json({ error: 'Invalid request: expected { action: "createLead", leadData: {...} }' });
          return;
        }

        // Map inquiry type and message robustly
        const inquiryType = leadData.lead_type || leadData.Industry || leadData.inquiry_type || '';
        const message = leadData.Description || leadData.message || leadData.Message || '';
      const firstName = leadData.First_Name || leadData.first_name || leadData.fname || '';
      let lastName = leadData.Last_Name || leadData.last_name || leadData.lname || '';
      if (!lastName || lastName.trim() === '') lastName = 'Unknown';
      const company = leadData.Company || leadData.company || `${firstName} ${lastName}`.trim() || 'Individual';

        // Construct Zoho payload
        const zohoPayload = {
          First_Name: firstName,
          Last_Name: lastName,
          Email: leadData.Email || leadData.email || '',
          Phone: leadData.Phone || leadData.phone || '',
          Lead_Source: leadData.Lead_Source || leadData.lead_source || 'Website Form',
          Industry: inquiryType,
          Description: message,
          Company: company,
        };
        console.log('ZohoAPI: Payload to Zoho:', JSON.stringify(zohoPayload, null, 2));

        // Optional reCAPTCHA verification
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
        try {
          let zohoRes = await createZohoLead(accessToken, zohoPayload);
          console.log('ZohoAPI: Zoho response:', JSON.stringify(zohoRes, null, 2));
          if (zohoRes && zohoRes.data && zohoRes.data[0] && zohoRes.data[0].code !== 'SUCCESS') {
            console.error('ZohoAPI: Zoho error response:', JSON.stringify(zohoRes, null, 2));
          }
          res.status(200).json({ ok: true, zoho: zohoRes });
        } catch (err) {
          console.error('ZohoAPI: Error sending to Zoho:', err);
          if (err && err.response && typeof err.response.text === 'function') {
            try {
              const errorText = await err.response.text();
              console.error('ZohoAPI: Raw Zoho error response:', errorText);
            } catch (e2) {
              console.error('ZohoAPI: Could not read raw Zoho error response:', e2);
            }
          }
          res.status(500).json({ error: 'Zoho API error', details: err.message || String(err) });
        }
        } catch (err) {
          console.error('ZohoAPI: Handler error', err);
          res.status(500).json({ error: 'Internal server error', details: err.message || String(err) });
        }
      }


