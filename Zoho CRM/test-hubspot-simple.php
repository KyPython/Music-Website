<?php
/**
 * Simple HubSpot API test script
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Load credentials
$credentialsFile = __DIR__ . '/credentials.php';
if (file_exists($credentialsFile)) {
    include $credentialsFile;
} else {
    echo "Error: credentials.php not found\n";
    exit(1);
}

echo "Testing HubSpot API key: " . substr($hubspotApiKey, 0, 20) . "...\n\n";

// Test creating a contact via the hubspot-proxy
echo "Testing contact creation via proxy...\n";

$testData = [
    'action' => 'createLead',
    'leadData' => [
        'Email' => 'test@example.com',
        'First_Name' => 'Test',
        'Last_Name' => 'User',
        'Lead_Source' => 'API Test',
        'Description' => 'Testing HubSpot integration'
    ]
];

$postData = json_encode($testData);

$ch = curl_init('http://localhost' . str_replace($_SERVER['DOCUMENT_ROOT'], '', __DIR__) . '/hubspot-proxy.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $result\n\n";

// Test direct API call with different endpoint
echo "Testing direct API call to account info...\n";

$url = "https://api.hubapi.com/account-info/v3/details?hapikey=" . $hubspotApiKey;
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Account Info HTTP Code: $httpCode\n";
echo "Account Info Response: " . substr($result, 0, 200) . "...\n\n";

// Test with a simpler endpoint that requires fewer permissions
echo "Testing contact search endpoint...\n";

$searchData = [
    'filterGroups' => [
        [
            'filters' => [
                [
                    'propertyName' => 'email',
                    'operator' => 'EQ',
                    'value' => 'nonexistent@test.com'
                ]
            ]
        ]
    ]
];

$ch = curl_init("https://api.hubapi.com/crm/v3/objects/contacts/search?hapikey=" . $hubspotApiKey);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($searchData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Contact Search HTTP Code: $httpCode\n";
echo "Contact Search Response: " . substr($result, 0, 300) . "...\n";

echo "\nTest completed.\n";
?>