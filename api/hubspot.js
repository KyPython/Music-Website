// Vercel serverless function for HubSpot integration
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Get HubSpot API key from environment variables
    const hubspotApiKey = process.env.HUBSPOT_API_KEY;
    
    console.log('HubSpot API Key present:', hubspotApiKey ? 'YES' : 'NO');
    console.log('HubSpot API Key length:', hubspotApiKey ? hubspotApiKey.length : 0);
    
    if (!hubspotApiKey) {
        console.error('Missing HUBSPOT_API_KEY environment variable');
        return res.status(500).json({ error: 'Configuration error - API key not found' });
    }
    
    const { action, leadData } = req.body;
    
    console.log('Request action:', action);
    console.log('Request leadData:', JSON.stringify(leadData, null, 2));
    
    if (!action || !leadData) {
        return res.status(400).json({ error: 'Invalid request - missing action or leadData' });
    }
    
    if (action !== 'createLead') {
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    try {
        // Map fields from your form to HubSpot format - MINIMAL VERSION
        const hubspotProperties = {};
        
        // Only use the most basic fields that definitely exist
        if (leadData.Email) hubspotProperties.email = leadData.Email;
        if (leadData.First_Name) hubspotProperties.firstname = leadData.First_Name;
        if (leadData.Last_Name) hubspotProperties.lastname = leadData.Last_Name;
        if (leadData.Phone) hubspotProperties.phone = leadData.Phone;
        
        // Only set lifecyclestage - most basic field
        hubspotProperties.lifecyclestage = 'lead';
        
        console.log('Sending minimal HubSpot properties:', JSON.stringify(hubspotProperties, null, 2));
        
        // Create contact in HubSpot
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hubspotApiKey}`
            },
            body: JSON.stringify({
                properties: hubspotProperties
            })
        });
        
        const responseData = await response.json();
        
        // Log everything for debugging
        console.log('HubSpot Response Status:', response.status);
        console.log('HubSpot Response Data:', JSON.stringify(responseData, null, 2));
        
        if (!response.ok) {
            // Handle duplicate contact (conflict)
            if (response.status === 409) {
                console.log('Contact already exists - returning duplicate status');
                return res.status(200).json({
                    status: 'duplicate',
                    message: 'Contact already exists'
                });
            }
            
            console.error('HubSpot API Error:', responseData);
            return res.status(500).json({
                error: 'Failed to create contact',
                details: responseData,
                hubspotStatus: response.status,
                debug: 'Check Vercel function logs for details'
            });
        }
        
        console.log('Contact created successfully in HubSpot');
        return res.status(200).json({
            status: 'success',
            message: 'Contact created successfully',
            data: responseData,
            debug: 'Check Vercel function logs for details'
        });
        
    } catch (error) {
        console.error('Error creating contact:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}