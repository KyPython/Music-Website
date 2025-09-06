<?php
/**
 * Zoho CRM to HubSpot Companies Migration Script
 * 
 * This script migrates accounts/companies from Zoho CRM to HubSpot CRM
 * Handles field mapping and company data conversion between the two systems
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class ZohoToHubSpotCompanyMigration {
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
        $this->logFile = 'company_migration_log_' . date('Y-m-d_H-i-s') . '.txt';
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

    private function getZohoAccounts($accessToken, $page = 1, $perPage = 200) {
        $url = "https://www.zohoapis.com/crm/v2/Accounts?page={$page}&per_page={$perPage}";
        
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
            throw new Exception("Failed to fetch Zoho accounts: HTTP {$httpCode} - {$result}");
        }

        return json_decode($result, true);
    }

    private function mapZohoToHubSpotCompany($zohoAccount) {
        // Map Zoho fields to HubSpot fields
        $hubspotCompany = [
            'properties' => [
                'name' => $zohoAccount['Account_Name'] ?? '',
                'domain' => $this->extractDomain($zohoAccount['Website'] ?? ''),
                'website' => $zohoAccount['Website'] ?? '',
                'phone' => $zohoAccount['Phone'] ?? '',
                'industry' => $zohoAccount['Industry'] ?? '',
                'annualrevenue' => $this->parseRevenue($zohoAccount['Annual_Revenue'] ?? ''),
                'numberofemployees' => $this->parseEmployeeCount($zohoAccount['Employees'] ?? ''),
                'type' => $zohoAccount['Account_Type'] ?? '',
                'description' => $zohoAccount['Description'] ?? '',
                'address' => $this->buildAddress($zohoAccount),
                'address2' => $zohoAccount['Billing_Street'] ?? '',
                'city' => $zohoAccount['Billing_City'] ?? $zohoAccount['Shipping_City'] ?? '',
                'state' => $zohoAccount['Billing_State'] ?? $zohoAccount['Shipping_State'] ?? '',
                'zip' => $zohoAccount['Billing_Code'] ?? $zohoAccount['Shipping_Code'] ?? '',
                'country' => $zohoAccount['Billing_Country'] ?? $zohoAccount['Shipping_Country'] ?? '',
                'timezone' => $zohoAccount['Time_Zone'] ?? '',
                'lifecyclestage' => $this->mapLifecycleStage($zohoAccount['Account_Type'] ?? ''),
                'lead_source' => $zohoAccount['Account_Source'] ?? '',
                'hs_created_date' => $this->convertZohoDateTime($zohoAccount['Created_Time'] ?? ''),
                'hs_lastmodifieddate' => $this->convertZohoDateTime($zohoAccount['Modified_Time'] ?? ''),
                // Custom fields for tracking Zoho data
                'zoho_account_id' => $zohoAccount['id'] ?? '',
                'zoho_owner' => $zohoAccount['Owner']['name'] ?? '',
                'zoho_parent_account' => $zohoAccount['Parent_Account']['name'] ?? '',
                'zoho_account_site' => $zohoAccount['Account_Site'] ?? '',
                'zoho_rating' => $zohoAccount['Rating'] ?? '',
                'zoho_ownership' => $zohoAccount['Ownership'] ?? '',
                'zoho_sic_code' => $zohoAccount['SIC_Code'] ?? '',
                'zoho_ticker_symbol' => $zohoAccount['Ticker_Symbol'] ?? ''
            ]
        ];

        // Remove empty properties
        $hubspotCompany['properties'] = array_filter($hubspotCompany['properties'], function($value) {
            return $value !== '' && $value !== null;
        });

        return $hubspotCompany;
    }

    private function extractDomain($website) {
        if (empty($website)) return '';
        
        // Remove protocol and www
        $domain = preg_replace('/^https?:\/\//', '', $website);
        $domain = preg_replace('/^www\./', '', $domain);
        
        // Remove path and parameters
        $domain = explode('/', $domain)[0];
        $domain = explode('?', $domain)[0];
        
        return strtolower($domain);
    }

    private function parseRevenue($revenue) {
        if (empty($revenue)) return null;
        
        // Remove currency symbols and convert to number
        $cleanRevenue = preg_replace('/[^0-9.]/', '', $revenue);
        return is_numeric($cleanRevenue) ? floatval($cleanRevenue) : null;
    }

    private function parseEmployeeCount($employees) {
        if (empty($employees)) return null;
        
        // Handle ranges like "50-100" - take the lower number
        if (strpos($employees, '-') !== false) {
            $parts = explode('-', $employees);
            return is_numeric(trim($parts[0])) ? intval(trim($parts[0])) : null;
        }
        
        // Remove non-numeric characters
        $cleanEmployees = preg_replace('/[^0-9]/', '', $employees);
        return is_numeric($cleanEmployees) ? intval($cleanEmployees) : null;
    }

    private function buildAddress($zohoAccount) {
        // Prefer billing address, fall back to shipping
        $addressParts = array_filter([
            $zohoAccount['Billing_Street'] ?? $zohoAccount['Shipping_Street'] ?? '',
            $zohoAccount['Billing_City'] ?? $zohoAccount['Shipping_City'] ?? '',
            $zohoAccount['Billing_State'] ?? $zohoAccount['Shipping_State'] ?? '',
            $zohoAccount['Billing_Code'] ?? $zohoAccount['Shipping_Code'] ?? '',
            $zohoAccount['Billing_Country'] ?? $zohoAccount['Shipping_Country'] ?? ''
        ]);
        return implode(', ', $addressParts);
    }

    private function mapLifecycleStage($accountType) {
        $stageMap = [
            'Prospect' => 'lead',
            'Customer' => 'customer',
            'Partner' => 'other',
            'Competitor' => 'other',
            'Reseller' => 'other',
            'Vendor' => 'other'
        ];

        return $stageMap[$accountType] ?? 'lead';
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

    private function createHubSpotCompany($hubspotCompany) {
        $url = "https://api.hubapi.com/crm/v3/objects/companies?hapikey=" . $this->hubspotApiKey;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($hubspotCompany));
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
            // Check for duplicate domain error
            if (isset($response['category']) && $response['category'] === 'CONFLICT') {
                return ['status' => 'duplicate', 'message' => 'Company with this domain already exists'];
            }
            throw new Exception("Failed to create HubSpot company: HTTP {$httpCode} - {$result}");
        }

        return ['status' => 'success', 'data' => $response];
    }

    private function findHubSpotContactsByCompany($companyId) {
        $url = "https://api.hubapi.com/crm/v3/objects/companies/{$companyId}/associations/contacts?hapikey=" . $this->hubspotApiKey;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch) || $httpCode >= 400) {
            return [];
        }
        curl_close($ch);

        $response = json_decode($result, true);
        return $response['results'] ?? [];
    }

    public function migrateCompanies($batchSize = 50) {
        try {
            $this->logMessage("Starting company migration from Zoho to HubSpot");
            
            // Get Zoho access token
            $zohoAccessToken = $this->getZohoAccessToken();
            $this->logMessage("Successfully obtained Zoho access token");

            $page = 1;
            $totalMigrated = 0;
            $totalDuplicates = 0;
            $totalErrors = 0;

            while (true) {
                // Get accounts from Zoho
                $zohoResponse = $this->getZohoAccounts($zohoAccessToken, $page, $batchSize);
                
                if (!isset($zohoResponse['data']) || empty($zohoResponse['data'])) {
                    $this->logMessage("No more accounts to migrate. Finished at page {$page}");
                    break;
                }

                $accounts = $zohoResponse['data'];
                $this->logMessage("Retrieved " . count($accounts) . " accounts from Zoho (page {$page})");

                foreach ($accounts as $zohoAccount) {
                    try {
                        // Map to HubSpot format
                        $hubspotCompany = $this->mapZohoToHubSpotCompany($zohoAccount);
                        
                        // Create company in HubSpot
                        $result = $this->createHubSpotCompany($hubspotCompany);
                        
                        if ($result['status'] === 'success') {
                            $totalMigrated++;
                            $companyName = $zohoAccount['Account_Name'] ?? 'Unnamed Company';
                            $companyId = $result['data']['id'];
                            $this->logMessage("Successfully migrated company: {$companyName} (ID: {$companyId})");
                        } elseif ($result['status'] === 'duplicate') {
                            $totalDuplicates++;
                            $companyName = $zohoAccount['Account_Name'] ?? 'Unnamed Company';
                            $this->logMessage("Duplicate company skipped: {$companyName}");
                        }

                        // Rate limiting - sleep for 100ms between requests
                        usleep(100000);

                    } catch (Exception $e) {
                        $totalErrors++;
                        $this->logMessage("Error migrating company " . ($zohoAccount['Account_Name'] ?? 'Unknown') . ": " . $e->getMessage());
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

    $migration = new ZohoToHubSpotCompanyMigration($zohoRefreshToken, $zohoClientId, $zohoClientSecret, $hubspotApiKey);
    $result = $migration->migrateCompanies();

    if ($result['success']) {
        echo "Migration completed successfully!\n";
        echo "Migrated: {$result['migrated']} companies\n";
        echo "Duplicates: {$result['duplicates']} companies\n";
        echo "Errors: {$result['errors']} companies\n";
    } else {
        echo "Migration failed: {$result['error']}\n";
        exit(1);
    }
}
?>