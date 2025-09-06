# Zoho CRM to HubSpot Migration Scripts

This collection of PHP scripts migrates data from Zoho CRM to HubSpot CRM, including contacts, deals, and companies with proper field mapping and relationship preservation.

## Files Overview

### Migration Scripts
- **`zoho-to-hubspot-contacts.php`** - Migrates contacts/leads from Zoho to HubSpot
- **`zoho-to-hubspot-deals.php`** - Migrates deals/opportunities from Zoho to HubSpot  
- **`zoho-to-hubspot-companies.php`** - Migrates accounts/companies from Zoho to HubSpot
- **`master-migration.php`** - Coordinates all migrations in proper order

### Configuration Files
- **`migration-config-template.env`** - Template for API credentials
- **`MIGRATION-README.md`** - This documentation file

### Existing Files (Analysis Source)
- **`zoho-proxy.php`** - Original Zoho integration (analyzed for field mapping)
- **`test-zoho.php`** - Test interface (analyzed for data structure)

## Prerequisites

1. **PHP 7.4+** with cURL extension enabled
2. **Zoho CRM API Access**
   - Zoho CRM account with API access
   - OAuth 2.0 application created in Zoho API Console
   - Refresh token generated
3. **HubSpot CRM Access**
   - HubSpot account with API access
   - Private app created in HubSpot Developer Account
   - API key generated

## Setup Instructions

### 1. Get Zoho CRM API Credentials

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Create a new application:
   - Choose "Server-based Applications"
   - Set redirect URI (can be localhost for server apps)
   - Note down Client ID and Client Secret
3. Generate refresh token:
   - Use OAuth 2.0 flow to get authorization code
   - Exchange authorization code for refresh token
   - Store the refresh token securely

### 2. Get HubSpot API Credentials

1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Create a private app:
   - Navigate to "Private Apps" 
   - Create new private app
   - Grant necessary scopes (contacts, deals, companies read/write)
   - Copy the generated API key

### 3. Configure Environment

1. Copy the configuration template:
   ```bash
   cp migration-config-template.env .env
   ```

2. Edit `.env` with your actual credentials:
   ```bash
   ZOHO_REFRESH_TOKEN=1000.xxx.xxx
   ZOHO_CLIENT_ID=1000.XXX.XXX  
   ZOHO_CLIENT_SECRET=xxx
   HUBSPOT_API_KEY=pat-xxx-xxx
   ```

3. Load environment variables in your shell:
   ```bash
   export $(cat .env | xargs)
   ```

## Usage

### Run Complete Migration

```bash
# Migrate all data (companies → contacts → deals)
php master-migration.php

# Or explicitly specify all
php master-migration.php -t all
```

### Run Partial Migration

```bash
# Migrate only contacts
php master-migration.php -t contacts

# Migrate companies and deals
php master-migration.php -t companies,deals

# Migrate only deals
php master-migration.php -t deals
```

### Run Individual Scripts

```bash
# Individual migrations (if needed)
php zoho-to-hubspot-companies.php
php zoho-to-hubspot-contacts.php  
php zoho-to-hubspot-deals.php
```

## Field Mappings

### Contacts (Zoho Leads → HubSpot Contacts)

| Zoho Field | HubSpot Field | Notes |
|------------|---------------|-------|
| First_Name | firstname | |
| Last_Name | lastname | |
| Email | email | |
| Phone/Mobile | phone | Uses Phone, falls back to Mobile |
| Company | company | |
| Designation | jobtitle | |
| Website | website | |
| Street/City/State | address/city/state | Concatenated for address |
| Lead_Status | hs_lead_status | Mapped to HubSpot values |
| Lead_Source | leadSource | |
| Description | notes_last_contacted | |

### Companies (Zoho Accounts → HubSpot Companies)

| Zoho Field | HubSpot Field | Notes |
|------------|---------------|-------|
| Account_Name | name | |
| Website | website/domain | Domain extracted from website |
| Phone | phone | |
| Industry | industry | |
| Annual_Revenue | annualrevenue | Parsed to numeric |
| Employees | numberofemployees | Handles ranges |
| Account_Type | lifecyclestage | Mapped to HubSpot stages |
| Billing_*/Shipping_* | address/city/state/zip | Billing preferred |

### Deals (Zoho Deals → HubSpot Deals)

| Zoho Field | HubSpot Field | Notes |
|------------|---------------|-------|
| Deal_Name | dealname | |
| Amount | amount | |
| Stage | dealstage | Mapped to HubSpot pipeline stages |
| Closing_Date | closedate | |
| Type | dealtype | |
| Probability | probability | |
| Description | description | |

## Migration Order

The scripts follow this order to maintain data relationships:

1. **Companies** - Migrated first as they're referenced by contacts and deals
2. **Contacts** - Migrated second, can be associated with companies  
3. **Deals** - Migrated last, associated with contacts and companies

## Error Handling & Logging

- Each script generates detailed log files with timestamps
- Duplicate detection prevents re-importing existing records
- Rate limiting (100ms between requests) prevents API throttling
- Failed records are logged with specific error messages
- Migration continues even if individual records fail

## Log Files Generated

- `contact_migration_log_YYYY-MM-DD_HH-MM-SS.txt`
- `deal_migration_log_YYYY-MM-DD_HH-MM-SS.txt`
- `company_migration_log_YYYY-MM-DD_HH-MM-SS.txt`
- `master_migration_log_YYYY-MM-DD_HH-MM-SS.txt`

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API credentials are correct
   - Check if refresh token has expired (regenerate if needed)
   - Ensure HubSpot API key has required permissions

2. **Rate Limiting**
   - Scripts include built-in rate limiting
   - Increase delays if you hit API limits
   - Consider running migrations during off-peak hours

3. **Field Mapping Issues**
   - Check HubSpot property settings for custom fields
   - Verify required fields are properly mapped
   - Review log files for specific field errors

4. **Duplicate Records**
   - HubSpot prevents duplicate contacts by email
   - Companies are deduplicated by domain
   - Check logs for "duplicate" status messages

### Performance Optimization

- Batch size is set to 50 records per API call
- Consider smaller batches for large datasets
- Monitor API usage in both platforms
- Run migrations during low-traffic periods

## Data Validation

Before running the migration:

1. **Export sample data** from Zoho to verify field mapping
2. **Test with small dataset** first
3. **Backup HubSpot data** if possible
4. **Verify API permissions** in both systems

## Post-Migration Tasks

1. **Verify record counts** match between systems
2. **Check data relationships** (contact-company associations)
3. **Update team workflows** for new HubSpot structure  
4. **Train users** on HubSpot vs Zoho differences
5. **Set up ongoing sync** if needed (separate solution)

## Security Notes

- Store API credentials securely
- Use environment variables (never commit to version control)
- Rotate API keys regularly
- Monitor API access logs
- Consider IP restrictions on API access

## Support

For issues with the migration scripts:
1. Check log files for detailed error messages
2. Verify API credentials and permissions
3. Test with smaller data sets first
4. Review Zoho and HubSpot API documentation

## Customization

The scripts can be customized for:
- Additional field mappings
- Custom data transformations  
- Different migration sequences
- Integration with other systems
- Automated scheduling

Modify the field mapping functions in each script to match your specific data structure and requirements.