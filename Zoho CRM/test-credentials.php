<?php
/**
 * Test script to verify Zoho and HubSpot credentials
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Load credentials
$credentialsFile = __DIR__ . '/credentials.php';
if (file_exists($credentialsFile)) {
    include $credentialsFile;
    echo "✓ Loaded credentials from file\n";
} else {
    echo "✗ credentials.php file not found\n";
    exit(1);
}

echo "\nTesting Zoho CRM credentials...\n";
echo "Client ID: " . substr($clientId, 0, 20) . "...\n";
echo "Client Secret: " . substr($clientSecret, 0, 10) . "...\n";
echo "Refresh Token: " . substr($refreshToken, 0, 20) . "...\n";

// Test Zoho authentication
function testZohoAuth($refreshToken, $clientId, $clientSecret) {
    $url = 'https://accounts.zoho.com/oauth/v2/token';
    $data = [
        'refresh_token' => $refreshToken,
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'grant_type' => 'refresh_token'
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "HTTP Code: $httpCode\n";
    echo "Response: $result\n";

    $response = json_decode($result, true);
    return $response;
}

$zohoResult = testZohoAuth($refreshToken, $clientId, $clientSecret);

if (isset($zohoResult['access_token'])) {
    echo "✓ Zoho authentication successful!\n";
    $accessToken = $zohoResult['access_token'];
    
    // Test a simple API call
    echo "\nTesting Zoho API call...\n";
    $url = 'https://www.zohoapis.com/crm/v2/Leads?per_page=1';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Zoho-oauthtoken ' . $accessToken,
        'Content-Type: application/json'
    ]);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode == 200) {
        $data = json_decode($result, true);
        $recordCount = isset($data['data']) ? count($data['data']) : 0;
        echo "✓ Zoho API test successful! Found records in CRM.\n";
    } else {
        echo "✗ Zoho API test failed. HTTP: $httpCode, Response: $result\n";
    }
    
} else {
    echo "✗ Zoho authentication failed!\n";
    if (isset($zohoResult['error'])) {
        echo "Error: " . $zohoResult['error'] . "\n";
        if (isset($zohoResult['error_description'])) {
            echo "Description: " . $zohoResult['error_description'] . "\n";
        }
    }
}

// Test HubSpot credentials
echo "\n" . str_repeat("-", 50) . "\n";
echo "Testing HubSpot credentials...\n";
echo "API Key: " . substr($hubspotApiKey, 0, 20) . "...\n";

function testHubSpotAuth($apiKey) {
    $url = "https://api.hubapi.com/crm/v3/objects/contacts?limit=1&hapikey=" . $apiKey;
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "HTTP Code: $httpCode\n";
    echo "Response: " . substr($result, 0, 200) . "...\n";

    return $httpCode == 200;
}

if (testHubSpotAuth($hubspotApiKey)) {
    echo "✓ HubSpot authentication successful!\n";
} else {
    echo "✗ HubSpot authentication failed!\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Credential test completed.\n";
?>