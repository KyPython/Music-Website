<?php
// WARNING: this file previously contained Zoho client secrets and a refresh token.
// These are secrets. DO NOT store real client secrets or refresh tokens in the repo.
// Use deployment environment variables (for example: Vercel project env) instead.

// Template placeholders — fill these only in local testing and DO NOT commit real values.
$ZOHO_CLIENT_ID = 'REPLACE_WITH_CLIENT_ID';
$ZOHO_CLIENT_SECRET = 'REPLACE_WITH_CLIENT_SECRET';
$ZOHO_REFRESH_TOKEN = 'REPLACE_WITH_REFRESH_TOKEN';
$ZOHO_REGION = 'com'; // 'com' | 'eu' | 'in' | 'com.au'

// Quick notes:
// - Generate a grant code with Zoho Self Client or OAuth flow, then exchange immediately
//   to get a refresh_token. See the README or the project docs for commands.
// - Add the real values to your deployment's environment variables (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_REGION).
// - After updating env vars, redeploy your site so serverless functions pick up the new values.

// Example (do NOT run from repo or commit these):
// curl -s -X POST https://accounts.zoho.com/oauth/v2/token \
//   -d grant_type=authorization_code \
//   -d client_id=YOUR_CLIENT_ID \
//   -d client_secret=YOUR_CLIENT_SECRET \
//   -d code=GRANT_CODE

// If you previously committed secrets here: rotate them now in Zoho Developer Console
// (revoke old refresh tokens and regenerate client secret) and then add new values to env.

?>
