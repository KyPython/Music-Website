// This file would be deployed as an API endpoint on Vercel

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, leadData } = req.body;

    if (action !== 'createLead' || !leadData) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // For Zapier integration, you can either:
    // 1. Store the lead in a database that Zapier monitors
    // 2. Call a Zapier webhook directly

    // Option 2: Call Zapier webhook directly
    const zapierWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
    
    const response = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leadData: leadData
      })
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook error: ${response.statusText}`);
    }

    const result = await response.json();
    return res.status(200).json({ success: true, data: result });
    
  } catch (error) {
    console.error('Error processing lead:', error);
    return res.status(500).json({ error: 'Failed to process lead' });
  }
}