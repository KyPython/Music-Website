<?php
/**
 * Test HubSpot Proxy directly
 */

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/test';

// Simulate request body
$testData = [
    'action' => 'createLead',
    'leadData' => [
        'Email' => 'test@example.com',
        'First_Name' => 'Test',
        'Last_Name' => 'User',
        'Lead_Source' => 'Direct Test',
        'Description' => 'Testing HubSpot proxy directly'
    ]
];

// Mock the input stream
function mockInput() {
    global $testData;
    return json_encode($testData);
}

// Override file_get_contents for php://input
function file_get_contents_override($filename) {
    if ($filename === 'php://input') {
        return mockInput();
    }
    return file_get_contents($filename);
}

echo "Testing HubSpot proxy...\n\n";
echo "Test data: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Capture output
ob_start();

// Include the proxy
include 'hubspot-proxy.php';

$output = ob_get_clean();

echo "Proxy output:\n";
echo $output . "\n";

// Check if any log files were created
$logFiles = glob('hubspot_*.txt');
foreach ($logFiles as $logFile) {
    echo "\n" . strtoupper($logFile) . ":\n";
    echo file_get_contents($logFile);
}
?>