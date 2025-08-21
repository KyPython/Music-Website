<?php
// This file is intentionally a sanitized placeholder.
// DO NOT store real Zoho client secrets, client IDs, or refresh tokens in the repository.
// Use deployment environment variables instead (for example: Vercel project env).

// Placeholders for local testing only. NEVER commit real values.
$ZOHO_CLIENT_ID = 'REPLACE_WITH_CLIENT_ID';
$ZOHO_CLIENT_SECRET = 'REPLACE_WITH_CLIENT_SECRET';
$ZOHO_REFRESH_TOKEN = 'REPLACE_WITH_REFRESH_TOKEN';
$ZOHO_REGION = 'com'; // 'com' | 'eu' | 'in' | 'com.au'

// Quick notes:
// - Generate a grant code with Zoho Self Client or via OAuth, then exchange immediately
//   to get a refresh_token. See the project README for instructions.
// - Add the real values to your deployment's environment variables:
//     ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_REGION
// - After updating env vars in your hosting provider, redeploy so serverless functions pick them up.

// Example curl (replace placeholders and run locally only — do NOT commit filled values):
// curl -s -X POST https://accounts.zoho.com/oauth/v2/token \
//   -d grant_type=refresh_token \
//   -d client_id=REPLACE_WITH_CLIENT_ID \
//   -d client_secret=REPLACE_WITH_CLIENT_SECRET \
//   -d refresh_token=REPLACE_WITH_REFRESH_TOKEN | jq .

// If you previously committed real secrets here, rotate them immediately in Zoho Developer Console
// (revoke the exposed refresh token and regenerate client secret), then replace them with env vars.

?>