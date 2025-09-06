<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define the logDebug function first
function logDebug($message, $data = null) {
    $logMessage = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $logMessage .= " - " . json_encode($data);
    }
    file_put_contents('hubspot_debug_log.txt', $logMessage . PHP_EOL, FILE_APPEND);
}

// Log the start of the script
logDebug("Script started");
logDebug("Request method: " . $_SERVER['REQUEST_METHOD']);
logDebug("Request URI: " . $_SERVER['REQUEST_URI']);

// Load credentials from file if it exists
$credentialsFile = __DIR__ . '/credentials.php';
if (file_exists($credentialsFile)) {
    require_once $credentialsFile;
    logDebug("Loaded credentials from file");
} else {
    logDebug("Credentials file not found");
    http_response_code(500);
    echo json_encode(['error' => 'Configuration error']);
    exit;
}

// Allow CORS for local testing - adjust this for your domain
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logDebug("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get the request body
$requestBody = file_get_contents('php://input');
logDebug("Raw request body", $requestBody);

$requestData = json_decode($requestBody, true);
logDebug("Parsed request data", $requestData);

// Check if the request is valid
if (!$requestData || !isset($requestData['action'])) {
    logDebug("Invalid request: missing action");
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

// Log the request for debugging
file_put_contents('hubspot_request_log.txt', date('Y-m-d H:i:s') . " - Request: " . $requestBody . PHP_EOL, FILE_APPEND);

// HubSpot API key from credentials
$hubspotApiKey = $hubspotApiKey ?? '';

if (empty($hubspotApiKey)) {
    logDebug("HubSpot API key not found");
    http_response_code(500);
    echo json_encode(['error' => 'Configuration error']);
    exit;
}

// Function to create a contact in HubSpot CRM
function createContact($apiKey, $contactData) {
    logDebug("Creating contact", $contactData);
    
    // HubSpot API endpoint for creating contacts
    $url = "https://api.hubapi.com/crm/v3/objects/contacts?hapikey=" . $apiKey;
    
    // Map fields from Zoho-style to HubSpot format
    $hubspotProperties = [];
    
    // Map basic contact fields
    if (isset($contactData['Email'])) {
        $hubspotProperties['email'] = $contactData['Email'];
    }
    if (isset($contactData['First_Name'])) {
        $hubspotProperties['firstname'] = $contactData['First_Name'];
    }
    if (isset($contactData['Last_Name'])) {
        $hubspotProperties['lastname'] = $contactData['Last_Name'];
    }
    if (isset($contactData['Phone'])) {
        $hubspotProperties['phone'] = $contactData['Phone'];
    }
    if (isset($contactData['Description'])) {
        $hubspotProperties['notes_last_contacted'] = $contactData['Description'];
    }
    if (isset($contactData['Lead_Source'])) {
        $hubspotProperties['hs_lead_status'] = 'NEW';
        $hubspotProperties['lead_source'] = $contactData['Lead_Source'];
    }
    if (isset($contactData['Industry'])) {
        $hubspotProperties['jobtitle'] = $contactData['Industry']; // Using jobtitle to store inquiry type
    }
    
    // Prepare the data for HubSpot
    $data = [
        'properties' => $hubspotProperties
    ];
    
    logDebug("Contact creation request URL", $url);
    logDebug("Contact creation request data", $data);
    
    // Initialize cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    
    // Execute the request
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    logDebug("Contact creation response", ["httpCode" => $httpCode, "result" => $result]);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        logDebug("cURL error", $error);
        throw new Exception('Failed to create contact: ' . $error);
    }
    
    curl_close($ch);
    
    // Parse and return the response
    $response = json_decode($result, true);
    
    if ($httpCode >= 400) {
        // Check for duplicate contact (conflict)
        if ($httpCode === 409 || (isset($response['category']) && $response['category'] === 'CONFLICT')) {
            logDebug("Contact already exists");
            return ['status' => 'duplicate', 'message' => 'Contact already exists'];
        }
        
        logDebug("Error creating contact", $response);
        throw new Exception('Error creating contact: ' . $result);
    }
    
    logDebug("Successfully created contact");
    return ['status' => 'success', 'data' => $response];
}

// Handle the request
try {
    switch ($requestData['action']) {
        case 'createLead':
            if (!isset($requestData['leadData'])) {
                throw new Exception('Lead data is missing');
            }
            
            // Log the lead data
            logDebug("Lead data received", $requestData['leadData']);
            
            // Create the contact in HubSpot CRM (leads become contacts in HubSpot)
            $result = createContact($hubspotApiKey, $requestData['leadData']);
            
            // Log the response
            file_put_contents('hubspot_response_log.txt', date('Y-m-d H:i:s') . " - Response: " . json_encode($result) . PHP_EOL, FILE_APPEND);
            
            // Return the response
            header('Content-Type: application/json');
            echo json_encode($result);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    // Log the error
    file_put_contents('hubspot_error_log.txt', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
    logDebug("Error occurred", $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>