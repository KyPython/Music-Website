<?php
/**
 * Master Zoho CRM to HubSpot Migration Script
 * 
 * This script coordinates the migration of contacts, deals, and companies
 * from Zoho CRM to HubSpot CRM in the correct order
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'zoho-to-hubspot-contacts.php';
require_once 'zoho-to-hubspot-deals.php';
require_once 'zoho-to-hubspot-companies.php';

class MasterMigration {
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
        $this->logFile = 'master_migration_log_' . date('Y-m-d_H-i-s') . '.txt';
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

    public function runFullMigration() {
        $this->logMessage("Starting full Zoho CRM to HubSpot migration");
        
        $results = [
            'companies' => null,
            'contacts' => null,
            'deals' => null,
            'overall_success' => false
        ];

        try {
            // Step 1: Migrate Companies first (they are referenced by contacts and deals)
            $this->logMessage("Step 1: Starting company migration");
            $companyMigration = new ZohoToHubSpotCompanyMigration(
                $this->zohoRefreshToken, 
                $this->zohoClientId, 
                $this->zohoClientSecret, 
                $this->hubspotApiKey
            );
            $results['companies'] = $companyMigration->migrateCompanies();
            
            if ($results['companies']['success']) {
                $this->logMessage("Company migration completed successfully", $results['companies']);
            } else {
                $this->logMessage("Company migration failed", $results['companies']);
                // Continue with other migrations even if companies fail
            }

            // Wait between migrations to avoid rate limiting
            $this->logMessage("Waiting 30 seconds before next migration...");
            sleep(30);

            // Step 2: Migrate Contacts
            $this->logMessage("Step 2: Starting contact migration");
            $contactMigration = new ZohoToHubSpotContactMigration(
                $this->zohoRefreshToken, 
                $this->zohoClientId, 
                $this->zohoClientSecret, 
                $this->hubspotApiKey
            );
            $results['contacts'] = $contactMigration->migrateContacts();
            
            if ($results['contacts']['success']) {
                $this->logMessage("Contact migration completed successfully", $results['contacts']);
            } else {
                $this->logMessage("Contact migration failed", $results['contacts']);
            }

            // Wait between migrations to avoid rate limiting
            $this->logMessage("Waiting 30 seconds before next migration...");
            sleep(30);

            // Step 3: Migrate Deals last (they reference contacts and companies)
            $this->logMessage("Step 3: Starting deal migration");
            $dealMigration = new ZohoToHubSpotDealMigration(
                $this->zohoRefreshToken, 
                $this->zohoClientId, 
                $this->zohoClientSecret, 
                $this->hubspotApiKey
            );
            $results['deals'] = $dealMigration->migrateDeals();
            
            if ($results['deals']['success']) {
                $this->logMessage("Deal migration completed successfully", $results['deals']);
            } else {
                $this->logMessage("Deal migration failed", $results['deals']);
            }

            // Determine overall success
            $results['overall_success'] = 
                ($results['companies']['success'] ?? false) ||
                ($results['contacts']['success'] ?? false) ||
                ($results['deals']['success'] ?? false);

            // Generate summary report
            $this->generateSummaryReport($results);

            return $results;

        } catch (Exception $e) {
            $this->logMessage("Master migration failed with exception: " . $e->getMessage());
            $results['overall_success'] = false;
            $results['error'] = $e->getMessage();
            return $results;
        }
    }

    private function generateSummaryReport($results) {
        $this->logMessage("=== MIGRATION SUMMARY REPORT ===");
        
        // Companies
        if ($results['companies']) {
            $this->logMessage("COMPANIES:");
            $this->logMessage("  - Migrated: " . ($results['companies']['migrated'] ?? 0));
            $this->logMessage("  - Duplicates: " . ($results['companies']['duplicates'] ?? 0));
            $this->logMessage("  - Errors: " . ($results['companies']['errors'] ?? 0));
        }

        // Contacts
        if ($results['contacts']) {
            $this->logMessage("CONTACTS:");
            $this->logMessage("  - Migrated: " . ($results['contacts']['migrated'] ?? 0));
            $this->logMessage("  - Duplicates: " . ($results['contacts']['duplicates'] ?? 0));
            $this->logMessage("  - Errors: " . ($results['contacts']['errors'] ?? 0));
        }

        // Deals
        if ($results['deals']) {
            $this->logMessage("DEALS:");
            $this->logMessage("  - Migrated: " . ($results['deals']['migrated'] ?? 0));
            $this->logMessage("  - Associations: " . ($results['deals']['associations'] ?? 0));
            $this->logMessage("  - Errors: " . ($results['deals']['errors'] ?? 0));
        }

        $this->logMessage("Overall Success: " . ($results['overall_success'] ? 'YES' : 'NO'));
        $this->logMessage("=== END SUMMARY REPORT ===");
    }

    public function runPartialMigration($migrationTypes = ['companies', 'contacts', 'deals']) {
        $this->logMessage("Starting partial migration for: " . implode(', ', $migrationTypes));
        
        $results = [];

        if (in_array('companies', $migrationTypes)) {
            $this->logMessage("Starting company migration");
            $companyMigration = new ZohoToHubSpotCompanyMigration(
                $this->zohoRefreshToken, 
                $this->zohoClientId, 
                $this->zohoClientSecret, 
                $this->hubspotApiKey
            );
            $results['companies'] = $companyMigration->migrateCompanies();
            sleep(30); // Wait between migrations
        }

        if (in_array('contacts', $migrationTypes)) {
            $this->logMessage("Starting contact migration");
            $contactMigration = new ZohoToHubSpotContactMigration(
                $this->zohoRefreshToken, 
                $this->zohoClientId, 
                $this->zohoClientSecret, 
                $this->hubspotApiKey
            );
            $results['contacts'] = $contactMigration->migrateContacts();
            sleep(30); // Wait between migrations
        }

        if (in_array('deals', $migrationTypes)) {
            $this->logMessage("Starting deal migration");
            $dealMigration = new ZohoToHubSpotDealMigration(
                $this->zohoRefreshToken, 
                $this->zohoClientId, 
                $this->zohoClientSecret, 
                $this->hubspotApiKey
            );
            $results['deals'] = $dealMigration->migrateDeals();
        }

        $this->generateSummaryReport($results);
        return $results;
    }
}

// Usage example and CLI interface
if (php_sapi_name() === 'cli') {
    // Parse command line arguments
    $options = getopt("t:h", ["type:", "help"]);
    
    if (isset($options['h']) || isset($options['help'])) {
        echo "Zoho CRM to HubSpot Migration Script\n\n";
        echo "Usage: php master-migration.php [OPTIONS]\n\n";
        echo "Options:\n";
        echo "  -t, --type TYPE    Specify migration type: all, companies, contacts, deals\n";
        echo "                     You can specify multiple types separated by commas\n";
        echo "  -h, --help         Show this help message\n\n";
        echo "Examples:\n";
        echo "  php master-migration.php                    # Run all migrations\n";
        echo "  php master-migration.php -t all             # Run all migrations\n";
        echo "  php master-migration.php -t contacts        # Run only contact migration\n";
        echo "  php master-migration.php -t companies,deals # Run company and deal migrations\n\n";
        echo "Required:\n";
        echo "  - credentials.php file with Zoho API credentials\n";
        echo "  - HUBSPOT_API_KEY environment variable\n";
        exit(0);
    }

    // Load credentials from existing credentials.php file
    $credentialsFile = __DIR__ . '/credentials.php';
    if (file_exists($credentialsFile)) {
        include $credentialsFile;
        $zohoRefreshToken = $refreshToken ?? '';
        $zohoClientId = $clientId ?? '';
        $zohoClientSecret = $clientSecret ?? '';
        $hubspotApiKey = $hubspotApiKey ?? '';
        echo "Loaded credentials from credentials.php\n";
    } else {
        echo "Error: credentials.php file not found. Please create it with your API credentials.\n";
        echo "You can copy from credentials-template.php and update with your actual credentials.\n";
        exit(1);
    }

    // Validate all credentials are present
    if (empty($zohoRefreshToken) || empty($zohoClientId) || empty($zohoClientSecret)) {
        echo "Error: Zoho credentials are incomplete in credentials.php\n";
        echo "Please check your credentials.php file has refreshToken, clientId, and clientSecret\n";
        exit(1);
    }

    if (empty($hubspotApiKey)) {
        echo "Error: HubSpot API key is missing in credentials.php\n";
        echo "Please add \$hubspotApiKey = 'your_api_key_here'; to your credentials.php file\n";
        exit(1);
    }

    $migration = new MasterMigration($zohoRefreshToken, $zohoClientId, $zohoClientSecret, $hubspotApiKey);

    // Determine what to migrate
    $migrationType = $options['t'] ?? $options['type'] ?? 'all';
    
    if ($migrationType === 'all') {
        $result = $migration->runFullMigration();
    } else {
        $types = array_map('trim', explode(',', $migrationType));
        $validTypes = array_intersect($types, ['companies', 'contacts', 'deals']);
        
        if (empty($validTypes)) {
            echo "Error: Invalid migration type. Use: companies, contacts, deals, or all\n";
            exit(1);
        }
        
        $result = $migration->runPartialMigration($validTypes);
    }

    // Output final results
    echo "\n=== FINAL RESULTS ===\n";
    if (isset($result['overall_success']) && $result['overall_success']) {
        echo "Migration completed successfully!\n";
        exit(0);
    } else {
        echo "Migration completed with errors. Check log files for details.\n";
        exit(1);
    }
}
?>