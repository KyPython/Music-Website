<?php
/**
 * Zoho CRM to HubSpot Deals Migration Script
 * 
 * This script migrates deals/opportunities from Zoho CRM to HubSpot CRM
 * Handles field mapping and deal stage conversion between the two systems
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class ZohoToHubSpotDealMigration {
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
        $this->logFile = 'deal_migration_log_' . date('Y-m-d_H-i-s') . '.txt';
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

    private function getZohoDeals($accessToken, $page = 1, $perPage = 200) {
        $url = "https://www.zohoapis.com/crm/v2/Deals?page={$page}&per_page={$perPage}";
        
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
            throw new Exception("Failed to fetch Zoho deals: HTTP {$httpCode} - {$result}");
        }

        return json_decode($result, true);
    }

    private function findHubSpotContactByEmail($email) {
        if (empty($email)) return null;

        $url = "https://api.hubapi.com/crm/v3/objects/contacts/search?hapikey=" . $this->hubspotApiKey;
        
        $searchData = [
            'filterGroups' => [
                [
                    'filters' => [
                        [
                            'propertyName' => 'email',
                            'operator' => 'EQ',
                            'value' => $email
                        ]
                    ]
                ]
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($searchData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch) || $httpCode >= 400) {
            return null;
        }
        curl_close($ch);

        $response = json_decode($result, true);
        
        if (isset($response['results']) && !empty($response['results'])) {
            return $response['results'][0]['id'];
        }

        return null;
    }

    private function mapZohoToHubSpotDeal($zohoDeal) {
        // Map Zoho fields to HubSpot fields
        $hubspotDeal = [
            'properties' => [
                'dealname' => $zohoDeal['Deal_Name'] ?? 'Untitled Deal',
                'amount' => $zohoDeal['Amount'] ?? '0',
                'dealstage' => $this->mapDealStage($zohoDeal['Stage'] ?? ''),
                'pipeline' => 'default', // You may need to adjust this based on your HubSpot setup
                'closedate' => $this->convertZohoDate($zohoDeal['Closing_Date'] ?? ''),
                'dealtype' => $zohoDeal['Type'] ?? '',
                'description' => $zohoDeal['Description'] ?? '',
                'hs_priority' => $this->mapPriority($zohoDeal['Priority'] ?? ''),
                'lead_source' => $zohoDeal['Lead_Source'] ?? '',
                'probability' => $zohoDeal['Probability'] ?? '',
                'hs_created_date' => $this->convertZohoDateTime($zohoDeal['Created_Time'] ?? ''),
                'hs_lastmodifieddate' => $this->convertZohoDateTime($zohoDeal['Modified_Time'] ?? ''),
                'campaign' => $zohoDeal['Campaign_Source'] ?? '',
                'deal_currency_code' => $zohoDeal['Currency'] ?? 'USD',
                // Custom fields for tracking Zoho data
                'zoho_deal_id' => $zohoDeal['id'] ?? '',
                'zoho_owner' => $zohoDeal['Owner']['name'] ?? '',
                'zoho_account_name' => $zohoDeal['Account_Name']['name'] ?? '',
                'zoho_contact_name' => $zohoDeal['Contact_Name']['name'] ?? '',
                'zoho_next_step' => $zohoDeal['Next_Step'] ?? '',
                'zoho_reason_for_loss' => $zohoDeal['Reason_for_Loss'] ?? ''
            ]
        ];

        // Remove empty properties
        $hubspotDeal['properties'] = array_filter($hubspotDeal['properties'], function($value) {
            return $value !== '' && $value !== null && $value !== '0';
        });

        return $hubspotDeal;
    }

    private function mapDealStage($zohoStage) {
        // Default HubSpot deal stages mapping
        $stageMap = [
            'Qualification' => 'qualifiedtobuy',
            'Needs Analysis' => 'presentationscheduled',
            'Value Proposition' => 'decisionmakerboughtin',
            'Identify Decision Makers' => 'contractsent',
            'Proposal/Price Quote' => 'contractsent',
            'Negotiation/Review' => 'contractsent',
            'Closed Won' => 'closedwon',
            'Closed Lost' => 'closedlost',
            'Closed-Won' => 'closedwon',
            'Closed-Lost' => 'closedlost'
        ];

        return $stageMap[$zohoStage] ?? 'appointmentscheduled'; // Default to first stage
    }

    private function mapPriority($zohoPriority) {
        $priorityMap = [
            'High' => 'high',
            'Medium' => 'medium',
            'Low' => 'low'
        ];

        return $priorityMap[$zohoPriority] ?? 'medium';
    }

    private function convertZohoDate($zohoDate) {
        if (empty($zohoDate)) return null;
        
        try {
            $timestamp = strtotime($zohoDate);
            return $timestamp ? date('Y-m-d', $timestamp) : null;
        } catch (Exception $e) {
            return null;
        }
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

    private function createHubSpotDeal($hubspotDeal) {
        $url = "https://api.hubapi.com/crm/v3/objects/deals?hapikey=" . $this->hubspotApiKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($hubspotDeal));
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
            throw new Exception("Failed to create HubSpot deal: HTTP {$httpCode} - {$result}");
        }

        return ['status' => 'success', 'data' => $response];
    }

    private function associateDealWithContact($dealId, $contactId) {
        if (empty($contactId)) return false;

        $url = "https://api.hubapi.com/crm/v3/objects/deals/{$dealId}/associations/contacts/{$contactId}/3?hapikey=" . $this->hubspotApiKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch) || $httpCode >= 400) {
            $this->logMessage("Failed to associate deal {$dealId} with contact {$contactId}");
            return false;
        }
        curl_close($ch);

        return true;
    }

    public function migrateDeals($batchSize = 50) {
        try {
            $this->logMessage("Starting deal migration from Zoho to HubSpot");
            
            // Get Zoho access token
            $zohoAccessToken = $this->getZohoAccessToken();
            $this->logMessage("Successfully obtained Zoho access token");

            $page = 1;
            $totalMigrated = 0;
            $totalErrors = 0;
            $totalAssociations = 0;

            while (true) {
                // Get deals from Zoho
                $zohoResponse = $this->getZohoDeals($zohoAccessToken, $page, $batchSize);
                
                if (!isset($zohoResponse['data']) || empty($zohoResponse['data'])) {
                    $this->logMessage("No more deals to migrate. Finished at page {$page}");
                    break;
                }

                $deals = $zohoResponse['data'];
                $this->logMessage("Retrieved " . count($deals) . " deals from Zoho (page {$page})");

                foreach ($deals as $zohoDeal) {
                    try {
                        // Map to HubSpot format
                        $hubspotDeal = $this->mapZohoToHubSpotDeal($zohoDeal);
                        
                        // Create deal in HubSpot
                        $result = $this->createHubSpotDeal($hubspotDeal);
                        
                        if ($result['status'] === 'success') {
                            $totalMigrated++;
                            $dealId = $result['data']['id'];
                            $dealName = $zohoDeal['Deal_Name'] ?? 'Untitled Deal';
                            $this->logMessage("Successfully migrated deal: {$dealName} (ID: {$dealId})");

                            // Try to associate with contact if email is available
                            if (isset($zohoDeal['Contact_Name']['name'])) {
                                // Try to find contact by the deal's contact reference
                                // This is simplified - you might need to enhance this based on your data structure
                                $contactEmail = $this->extractEmailFromZohoDeal($zohoDeal);
                                if ($contactEmail) {
                                    $contactId = $this->findHubSpotContactByEmail($contactEmail);
                                    if ($contactId) {
                                        if ($this->associateDealWithContact($dealId, $contactId)) {
                                            $totalAssociations++;
                                            $this->logMessage("Associated deal {$dealId} with contact {$contactId}");
                                        }
                                    }
                                }
                            }
                        }

                        // Rate limiting - sleep for 100ms between requests
                        usleep(100000);

                    } catch (Exception $e) {
                        $totalErrors++;
                        $this->logMessage("Error migrating deal " . ($zohoDeal['Deal_Name'] ?? 'Unknown') . ": " . $e->getMessage());
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
            $this->logMessage("Total associations: {$totalAssociations}");
            $this->logMessage("Total errors: {$totalErrors}");

            return [
                'success' => true,
                'migrated' => $totalMigrated,
                'associations' => $totalAssociations,
                'errors' => $totalErrors
            ];

        } catch (Exception $e) {
            $this->logMessage("Migration failed: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    private function extractEmailFromZohoDeal($zohoDeal) {
        // This is a helper function to extract email from deal data
        // You might need to customize this based on your Zoho data structure
        // This could involve making additional API calls to get contact details
        return null; // Placeholder - implement based on your needs
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

    $migration = new ZohoToHubSpotDealMigration($zohoRefreshToken, $zohoClientId, $zohoClientSecret, $hubspotApiKey);
    $result = $migration->migrateDeals();

    if ($result['success']) {
        echo "Migration completed successfully!\n";
        echo "Migrated: {$result['migrated']} deals\n";
        echo "Associations: {$result['associations']} deal-contact associations\n";
        echo "Errors: {$result['errors']} deals\n";
    } else {
        echo "Migration failed: {$result['error']}\n";
        exit(1);
    }
}
?>