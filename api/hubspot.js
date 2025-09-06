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
    
    if (!hubspotApiKey) {
        return res.status(500).json({ error: 'Configuration error - API key not found' });
    }
    
    const { action, leadData } = req.body;
    
    if (!action || !leadData) {
        return res.status(400).json({ error: 'Invalid request - missing action or leadData' });
    }
    
    if (action !== 'createLead') {
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    try {
        // Map fields from your form to HubSpot format
        const hubspotProperties = {};
        
        if (leadData.Email) hubspotProperties.email = leadData.Email;
        if (leadData.First_Name) hubspotProperties.firstname = leadData.First_Name;
        if (leadData.Last_Name) hubspotProperties.lastname = leadData.Last_Name;
        if (leadData.Phone) hubspotProperties.phone = leadData.Phone;
        // Skip description for now - will add to a custom field later if needed
        // if (leadData.Description) hubspotProperties.hs_content_membership_notes = leadData.Description;
        if (leadData.Lead_Source) {
            hubspotProperties.hs_lead_status = 'NEW';
            // Map lead sources to valid HubSpot options
            const sourceMapping = {
                'API Test': 'OTHER_CAMPAIGNS',
                'Website Newsletter': 'DIRECT_TRAFFIC',
                'Website Contact': 'DIRECT_TRAFFIC',
                'Contact Form': 'DIRECT_TRAFFIC'
            };
            hubspotProperties.hs_analytics_source = sourceMapping[leadData.Lead_Source] || 'DIRECT_TRAFFIC';
        }
        if (leadData.Industry) hubspotProperties.jobtitle = leadData.Industry;
        
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
        
        if (!response.ok) {
            // Handle duplicate contact (conflict)
            if (response.status === 409) {
                return res.status(200).json({
                    status: 'duplicate',
                    message: 'Contact already exists'
                });
            }
            
            console.error('HubSpot API Error:', responseData);
            return res.status(500).json({
                error: 'Failed to create contact',
                details: responseData
            });
        }
        
        return res.status(200).json({
            status: 'success',
            message: 'Contact created successfully',
            data: responseData
        });
        
    } catch (error) {
        console.error('Error creating contact:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}