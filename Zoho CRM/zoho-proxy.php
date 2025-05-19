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
    file_put_contents('zoho_debug_log.txt', $logMessage . PHP_EOL, FILE_APPEND);
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
    // Fallback to hardcoded credentials for development only
    // REMOVE BEFORE PRODUCTION
    putenv('ZOHO_REFRESH_TOKEN=YOUR_REFRESH_TOKEN_HERE');
    putenv('ZOHO_CLIENT_ID=YOUR_CLIENT_ID_HERE');
    putenv('ZOHO_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE');
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
file_put_contents('zoho_request_log.txt', date('Y-m-d H:i:s') . " - Request: " . $requestBody . PHP_EOL, FILE_APPEND);

// Add more detailed logging for the credentials
logDebug("Credentials check", [
    "refresh_token_length" => strlen(getenv('ZOHO_REFRESH_TOKEN')),
    "client_id_length" => strlen(getenv('ZOHO_CLIENT_ID')),
    "client_secret_length" => strlen(getenv('ZOHO_CLIENT_SECRET'))
]);

// Zoho CRM credentials - store these securely
$refreshToken = getenv('ZOHO_REFRESH_TOKEN') ?: ''; // Get from environment
$clientId = getenv('ZOHO_CLIENT_ID') ?: '';         // Get from environment
$clientSecret = getenv('ZOHO_CLIENT_SECRET') ?: ''; // Get from environment

// Function to get access token using cURL
function getAccessToken($refreshToken, $clientId, $clientSecret) {
    logDebug("Getting access token", ["refreshToken" => substr($refreshToken, 0, 10) . "...", "clientId" => substr($clientId, 0, 10) . "..."]);
    
    // Try the US datacenter endpoint
    $url = 'https://accounts.zoho.com/oauth/v2/token';
    
    $data = [
        'refresh_token' => $refreshToken,
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'grant_type' => 'refresh_token'
    ];
    
    logDebug("Access token request data", $data);
    logDebug("Access token request URL", $url);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    logDebug("Access token response", ["httpCode" => $httpCode, "result" => $result]);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        logDebug("cURL error", $error);
        throw new Exception('Failed to get access token: ' . $error);
    }
    
    curl_close($ch);
    $response = json_decode($result, true);
    
    if (!isset($response['access_token'])) {
        logDebug("Invalid response from Zoho", $response);
        throw new Exception('Invalid response from Zoho: ' . $result);
    }
    
    logDebug("Successfully got access token");
    return $response['access_token'];
}

// Function to create a lead in Zoho CRM
function createLead($accessToken, $leadData) {
    logDebug("Creating lead", $leadData);
    
    // Zoho CRM API endpoint for creating leads
    $url = 'https://www.zohoapis.com/crm/v2/Leads';
    
    // Prepare the data
    $data = [
        'data' => [
            $leadData
        ]
    ];
    
    logDebug("Lead creation request URL", $url);
    logDebug("Lead creation request data", $data);
    
    // Initialize cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Zoho-oauthtoken ' . $accessToken,
        'Content-Type: application/json'
    ]);
    
    // Execute the request
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    logDebug("Lead creation response", ["httpCode" => $httpCode, "result" => $result]);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        logDebug("cURL error", $error);
        throw new Exception('Failed to create lead: ' . $error);
    }
    
    curl_close($ch);
    
    // Parse and return the response
    $response = json_decode($result, true);
    
    if ($httpCode >= 400) {
        logDebug("Error creating lead", $response);
        throw new Exception('Error creating lead: ' . $result);
    }
    
    logDebug("Successfully created lead");
    return $response;
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
            
            // Get access token
            $accessToken = getAccessToken($refreshToken, $clientId, $clientSecret);
            
            // Create the lead in Zoho CRM
            $result = createLead($accessToken, $requestData['leadData']);
            
            // Log the response
            file_put_contents('zoho_response_log.txt', date('Y-m-d H:i:s') . " - Response: " . json_encode($result) . PHP_EOL, FILE_APPEND);
            
            // Return the response
            header('Content-Type: application/json');
            echo json_encode($result);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    // Log the error
    file_put_contents('zoho_error_log.txt', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
    
    // Return error response
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
