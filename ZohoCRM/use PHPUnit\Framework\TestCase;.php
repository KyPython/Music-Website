use PHPUnit\Framework\TestCase;

<?php
// Language: php
// filepath: Music Website/Zoho CRM/credentialsTest.php

final class CredentialsTest extends TestCase
{
  private string $filePath;
  private string $contents;
  private array $lines;

  protected function setUp(): void
  {
    // Adjust relative path if tests are run from different CWD
    $this->filePath = __DIR__ . DIRECTORY_SEPARATOR . 'credentials.php';
    $this->assertFileExists($this->filePath, "credentials.php must exist at {$this->filePath}");
    $this->contents = file_get_contents($this->filePath);
    $this->assertIsString($this->contents, "Unable to read credentials.php");
    $this->lines = preg_split('/\R/', $this->contents) ?: [];
  }

  public function test_placeholders_present(): void
  {
    $this->assertStringContainsString('REPLACE_WITH_CLIENT_ID', $this->contents, 'Expected placeholder REPLACE_WITH_CLIENT_ID');
    $this->assertStringContainsString('REPLACE_WITH_CLIENT_SECRET', $this->contents, 'Expected placeholder REPLACE_WITH_CLIENT_SECRET');
    $this->assertStringContainsString('REPLACE_WITH_REFRESH_TOKEN', $this->contents, 'Expected placeholder REPLACE_WITH_REFRESH_TOKEN');
  }

  public function test_no_hardcoded_client_secret_or_refresh_token_patterns(): void
  {
    // Patterns that look like long secrets or refresh tokens (avoid matching short harmless text)
    $secretPattern = '/client_secret\s*=?\s*[\'"]?[A-Za-z0-9\-_\.]{20,}[\'"]?/i';
    $refreshPattern = '/refresh_token\s*=?\s*[\'"]?[A-Za-z0-9\-_\.]{20,}[\'"]?/i';
    $clientIdPattern = '/client_id\s*=?\s*[\'"]?(1000\.[A-Za-z0-9\-_\.]{5,})[\'"]?/i';
    $accessTokenPattern = '/access_token\s*[:=]\s*[\'"]?[A-Za-z0-9\-_\.]{20,}[\'"]?/i';

    $this->assertDoesNotMatchRegularExpression($secretPattern, $this->contents, 'Detected a likely hard-coded client_secret. Move secrets to environment variables.');
    $this->assertDoesNotMatchRegularExpression($refreshPattern, $this->contents, 'Detected a likely hard-coded refresh_token. Move secrets to environment variables.');
    $this->assertDoesNotMatchRegularExpression($clientIdPattern, $this->contents, 'Detected a likely hard-coded client_id starting with "1000." — avoid committing client IDs with secrets.');
    $this->assertDoesNotMatchRegularExpression($accessTokenPattern, $this->contents, 'Detected a literal access_token value in the file. Remove any tokens from source.');
  }

  public function test_curl_invocations_are_commented_or_absent(): void
  {
    foreach ($this->lines as $index => $line) {
      if (stripos($line, 'curl') !== false) {
        $trim = ltrim($line);
        // consider commented if starts with //, #, or within block comment starts (/*) or has '//' before curl
        $isCommentLine = preg_match('/^\s*(\/\/|#|\/\*)/', $line) === 1;
        $hasInlineCommentBeforeCurl = preg_match('/\/\/.*curl/i', $line) === 1;
        if (! $isCommentLine && ! $hasInlineCommentBeforeCurl) {
          $lineNum = $index + 1;
          $this->fail("Uncommented curl invocation detected on line {$lineNum}. Curl commands that include secrets must be removed or commented out.");
        }
      }
    }
    $this->addToAssertionCount(1); // pass if no failures
  }

  public function test_no_embedded_json_access_token_snippet(): void
  {
    // Detect JSON-like access_token blocks that may have been pasted into file
    $jsonAccessPattern = '/"access_token"\s*:\s*"?[A-Za-z0-9\-_\.]{20,}"?/i';
    $this->assertDoesNotMatchRegularExpression($jsonAccessPattern, $this->contents, 'Detected embedded JSON access_token; remove any pasted token responses from source.');
  }
}