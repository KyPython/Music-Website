// Vercel Serverless Function: /api/zoho.ts
// Environment variables expected:
// ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, optional ZOHO_REGION (com|eu|in|au)
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_REGION = (process.env.ZOHO_REGION || 'com').toLowerCase();

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
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const text = await res.text();
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
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [leadData] }),
  });
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text || '{}');
  } catch (e) {
    throw new Error(`Failed to parse Zoho create lead response (${res.status}): ${text}`);
  }
  if (!res.ok) {
    // Attach the Zoho response body to the error for easier debugging in logs
    const message = `Zoho API returned ${res.status}: ${JSON.stringify(data)}`;
    throw new Error(message);
  }
  return data;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { action, leadData } = req.body || {};
    if (action !== 'createLead' || !leadData) {
      res.status(400).json({ error: 'Invalid request: expected { action: "createLead", leadData: {...} }' });
      return;
    }

    // Transform incoming form payload to Zoho field names
    const transformed = transformLeadData(leadData);

    // Get an access token and create the lead
    const accessToken = await getZohoAccessToken();
    const zohoRes = await createZohoLead(accessToken, transformed);

    // Return the Zoho response directly for debugging/visibility
    res.status(200).json({ ok: true, zoho: zohoRes });
  } catch (err: any) {
    // Log full error server-side (Vercel logs)
    console.error('api/zoho error:', err);
    // Return useful error message to client but avoid leaking secrets
    res.status(500).json({ error: err.message || String(err) });
  }
}
