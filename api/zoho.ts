// Vercel Serverless Function: /api/zoho.ts
// Place your Zoho credentials here (never commit secrets to public repos)
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;

// Helper: Get Zoho access token
async function getZohoAccessToken() {
  const params = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN || '',
    client_id: ZOHO_CLIENT_ID || '',
    client_secret: ZOHO_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
  });
  const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Zoho access token error: ' + JSON.stringify(data));
  return data.access_token;
}

// Helper: Create Zoho Lead
async function createZohoLead(accessToken: string, leadData: any) {
  const res = await fetch('https://www.zohoapis.com/crm/v2/Leads', {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [leadData] }),
  });
  const data = await res.json();
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { action, leadData } = req.body;
    if (action !== 'createLead' || !leadData) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const accessToken = await getZohoAccessToken();
    const zohoRes = await createZohoLead(accessToken, leadData);
    res.status(200).json(zohoRes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
