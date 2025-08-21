// Lightweight health/test endpoint for Zoho integration
// GET /api/zoho-test -> validates env vars and attempts a token exchange
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_REGION = (process.env.ZOHO_REGION || 'com').toLowerCase();

function getZohoDomains(region: string) {
  switch (region) {
    case 'eu':
      return { accounts: 'https://accounts.zoho.eu' };
    case 'in':
      return { accounts: 'https://accounts.zoho.in' };
    case 'au':
      return { accounts: 'https://accounts.zoho.com.au' };
    default:
      return { accounts: 'https://accounts.zoho.com' };
  }
}

function missingEnv() {
  const missing: string[] = [];
  if (!ZOHO_CLIENT_ID) missing.push('ZOHO_CLIENT_ID');
  if (!ZOHO_CLIENT_SECRET) missing.push('ZOHO_CLIENT_SECRET');
  if (!ZOHO_REFRESH_TOKEN) missing.push('ZOHO_REFRESH_TOKEN');
  return missing;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed; send GET' });
    return;
  }
  const miss = missingEnv();
  if (miss.length) {
    res.status(500).json({ ok: false, error: 'Missing env vars', missing: miss });
    return;
  }

  const domains = getZohoDomains(ZOHO_REGION);
  const url = `${domains.accounts}/oauth/v2/token`;
  const params = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN || '',
    client_id: ZOHO_CLIENT_ID || '',
    client_secret: ZOHO_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
  });

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const text = await r.text();
    let data: any;
    try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
    if (!r.ok) {
      res.status(502).json({ ok: false, status: r.status, zoho: data });
      return;
    }
    // Successful token exchange (don't return the token itself)
    res.status(200).json({ ok: true, message: 'Token exchange succeeded', expires_in: data.expires_in || null });
  } catch (err: any) {
    console.error('zoho-test error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
}
