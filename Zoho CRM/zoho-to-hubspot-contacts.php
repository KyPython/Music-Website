<?php
/**
 * Zoho CRM to HubSpot Contact Migration Script
 * 
 * This script migrates contacts/leads from Zoho CRM to HubSpot CRM
 * Handles field mapping between the two systems
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class ZohoToHubSpotContactMigration {
    private $zohoRefreshToken;
    private $zohoClientId;
    private $zohoClientSecret;
    private $hubspotApiKey;
    private $logFile;

    public function __construct($zohoRefreshToken, $zohoClientId, $zohoClientSecret, $hubspotApiKey) {
        $this->zohoRefreshToken = $zohoRefreshToken;
        $this->zohoClientId = $zohoClientId;
        $this->zohoClientSecret = $zohoClientSecret;
        $this->hubspotApiKey = $hubspotApiKey;
        $this->logFile = 'contact_migration_log_' . date('Y-m-d_H-i-s') . '.txt';
    }

    private function logMessage($message, $data = null) {
        $logEntry = date('Y-m-d H:i:s') . " - " . $message;
        if ($data !== null) {
            $logEntry .= " - " . json_encode($data, JSON_PRETTY_PRINT);
        }
        $logEntry .= PHP_EOL;
        file_put_contents($this->logFile, $logEntry, FILE_APPEND);
        echo $logEntry;
    }

    private function getZohoAccessToken() {
        $url = 'https://accounts.zoho.com/oauth/v2/token';
        $data = [
            'refresh_token' => $this->zohoRefreshToken,
            'client_id' => $this->zohoClientId,
            'client_secret' => $this->zohoClientSecret,
            'grant_type' => 'refresh_token'
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            throw new Exception('cURL error: ' . curl_error($ch));
        }
        curl_close($ch);

        $response = json_decode($result, true);
        if (!isset($response['access_token'])) {
            throw new Exception('Failed to get Zoho access token: ' . $result);
        }

        return $response['access_token'];
    }

    private function getZohoContacts($accessToken, $page = 1, $perPage = 200) {
        $url = "https://www.zohoapis.com/crm/v2/Leads?page={$page}&per_page={$perPage}";
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Zoho-oauthtoken ' . $accessToken,
            'Content-Type: application/json'
        ]);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            throw new Exception('cURL error: ' . curl_error($ch));
        }
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new Exception("Failed to fetch Zoho contacts: HTTP {$httpCode} - {$result}");
        }

        return json_decode($result, true);
    }

    private function mapZohoToHubSpotContact($zohoContact) {
        // Map Zoho fields to HubSpot fields
        $hubspotContact = [
            'properties' => [
                'email' => $zohoContact['Email'] ?? '',
                'firstname' => $zohoContact['First_Name'] ?? '',
                'lastname' => $zohoContact['Last_Name'] ?? '',
                'phone' => $zohoContact['Phone'] ?? $zohoContact['Mobile'] ?? '',
                'company' => $zohoContact['Company'] ?? '',
                'jobtitle' => $zohoContact['Designation'] ?? '',
                'website' => $zohoContact['Website'] ?? '',
                'address' => $this->buildAddress($zohoContact),
                'city' => $zohoContact['City'] ?? '',
                'state' => $zohoContact['State'] ?? '',
                'zip' => $zohoContact['Zip_Code'] ?? '',
                'country' => $zohoContact['Country'] ?? '',
                'hs_lead_status' => $this->mapLeadStatus($zohoContact['Lead_Status'] ?? ''),
                'leadSource' => $zohoContact['Lead_Source'] ?? '',
                'industry' => $zohoContact['Industry'] ?? '',
                'annualrevenue' => $zohoContact['Annual_Revenue'] ?? '',
                'numemployees' => $zohoContact['No_of_Employees'] ?? '',
                'notes_last_contacted' => $zohoContact['Description'] ?? '',
                'hs_created_date' => $this->convertZohoDateTime($zohoContact['Created_Time'] ?? ''),
                'lastmodifieddate' => $this->convertZohoDateTime($zohoContact['Modified_Time'] ?? ''),
                // Custom fields
                'zoho_lead_id' => $zohoContact['id'] ?? '',
                'zoho_owner' => $zohoContact['Owner']['name'] ?? '',
                'zoho_rating' => $zohoContact['Rating'] ?? '',
                'zoho_converted' => isset($zohoContact['Converted_Contact']) ? 'true' : 'false'
            ]
        ];

        // Remove empty properties
        $hubspotContact['properties'] = array_filter($hubspotContact['properties'], function($value) {
            return $value !== '' && $value !== null;
        });

        return $hubspotContact;
    }

    private function buildAddress($zohoContact) {
        $addressParts = array_filter([
            $zohoContact['Street'] ?? '',
            $zohoContact['City'] ?? '',
            $zohoContact['State'] ?? '',
            $zohoContact['Zip_Code'] ?? '',
            $zohoContact['Country'] ?? ''
        ]);
        return implode(', ', $addressParts);
    }

    private function mapLeadStatus($zohoStatus) {
        $statusMap = [
            'Not Contacted' => 'NEW',
            'Contacted' => 'OPEN',
            'Qualified' => 'IN_PROGRESS',
            'Lost Lead' => 'UNQUALIFIED',
            'Not Qualified' => 'UNQUALIFIED',
            'Junk Lead' => 'UNQUALIFIED',
            'Converted' => 'CONNECTED',
            'Pre-Qualified' => 'OPEN'
        ];

        return $statusMap[$zohoStatus] ?? 'NEW';
    }

    private function convertZohoDateTime($zohoDateTime) {
        if (empty($zohoDateTime)) return null;
        
        try {
            $timestamp = strtotime($zohoDateTime);
            return $timestamp ? $timestamp * 1000 : null; // HubSpot expects milliseconds
        } catch (Exception $e) {
            return null;
        }
    }

    private function createHubSpotContact($hubspotContact) {
        $url = "https://api.hubapi.com/crm/v3/objects/contacts?hapikey=" . $this->hubspotApiKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($hubspotContact));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            throw new Exception('cURL error: ' . curl_error($ch));
        }
        curl_close($ch);

        $response = json_decode($result, true);

        if ($httpCode >= 400) {
            // Check for duplicate email error
            if (isset($response['category']) && $response['category'] === 'CONFLICT') {
                return ['status' => 'duplicate', 'message' => 'Contact with this email already exists'];
            }
            throw new Exception("Failed to create HubSpot contact: HTTP {$httpCode} - {$result}");
        }

        return ['status' => 'success', 'data' => $response];
    }

    public function migrateContacts($batchSize = 50) {
        try {
            $this->logMessage("Starting contact migration from Zoho to HubSpot");
            
            // Get Zoho access token
            $zohoAccessToken = $this->getZohoAccessToken();
            $this->logMessage("Successfully obtained Zoho access token");

            $page = 1;
            $totalMigrated = 0;
            $totalDuplicates = 0;
            $totalErrors = 0;

            while (true) {
                // Get contacts from Zoho
                $zohoResponse = $this->getZohoContacts($zohoAccessToken, $page, $batchSize);
                
                if (!isset($zohoResponse['data']) || empty($zohoResponse['data'])) {
                    $this->logMessage("No more contacts to migrate. Finished at page {$page}");
                    break;
                }

                $contacts = $zohoResponse['data'];
                $this->logMessage("Retrieved " . count($contacts) . " contacts from Zoho (page {$page})");

                foreach ($contacts as $zohoContact) {
                    try {
                        // Map to HubSpot format
                        $hubspotContact = $this->mapZohoToHubSpotContact($zohoContact);
                        
                        // Create contact in HubSpot
                        $result = $this->createHubSpotContact($hubspotContact);
                        
                        if ($result['status'] === 'success') {
                            $totalMigrated++;
                            $this->logMessage("Successfully migrated contact: " . ($zohoContact['Email'] ?? 'No email'));
                        } elseif ($result['status'] === 'duplicate') {
                            $totalDuplicates++;
                            $this->logMessage("Duplicate contact skipped: " . ($zohoContact['Email'] ?? 'No email'));
                        }

                        // Rate limiting - sleep for 100ms between requests
                        usleep(100000);

                    } catch (Exception $e) {
                        $totalErrors++;
                        $this->logMessage("Error migrating contact " . ($zohoContact['Email'] ?? 'Unknown') . ": " . $e->getMessage());
                    }
                }

                $page++;
                
                // Check if there are more pages
                if (!isset($zohoResponse['info']['more_records']) || !$zohoResponse['info']['more_records']) {
                    break;
                }
            }

            $this->logMessage("Migration completed!");
            $this->logMessage("Total migrated: {$totalMigrated}");
            $this->logMessage("Total duplicates: {$totalDuplicates}");
            $this->logMessage("Total errors: {$totalErrors}");

            return [
                'success' => true,
                'migrated' => $totalMigrated,
                'duplicates' => $totalDuplicates,
                'errors' => $totalErrors
            ];

        } catch (Exception $e) {
            $this->logMessage("Migration failed: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}

// Usage example
if (php_sapi_name() === 'cli') {
    // Load credentials from environment or configuration file
    $zohoRefreshToken = getenv('ZOHO_REFRESH_TOKEN') ?: 'your_zoho_refresh_token';
    $zohoClientId = getenv('ZOHO_CLIENT_ID') ?: 'your_zoho_client_id';
    $zohoClientSecret = getenv('ZOHO_CLIENT_SECRET') ?: 'your_zoho_client_secret';
    $hubspotApiKey = getenv('HUBSPOT_API_KEY') ?: 'your_hubspot_api_key';

    if (empty($zohoRefreshToken) || empty($zohoClientId) || empty($zohoClientSecret) || empty($hubspotApiKey)) {
        echo "Error: Please set your API credentials in environment variables or update the script\n";
        echo "Required: ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, HUBSPOT_API_KEY\n";
        exit(1);
    }

    $migration = new ZohoToHubSpotContactMigration($zohoRefreshToken, $zohoClientId, $zohoClientSecret, $hubspotApiKey);
    $result = $migration->migrateContacts();

    if ($result['success']) {
        echo "Migration completed successfully!\n";
        echo "Migrated: {$result['migrated']} contacts\n";
        echo "Duplicates: {$result['duplicates']} contacts\n";
        echo "Errors: {$result['errors']} contacts\n";
    } else {
        echo "Migration failed: {$result['error']}\n";
        exit(1);
    }
}
?>