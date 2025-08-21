<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zoho CRM Integration Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input, textarea { width: 100%; padding: 8px; box-sizing: border-box; }
        button { padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        .response { margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Zoho CRM Integration Test</h1>
    
    <form id="test-form">
        <div class="form-group">
            <label for="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" value="Test">
        </div>
        
        <div class="form-group">
            <label for="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" value="User">
        </div>
        
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="test@example.com">
        </div>
        
        <div class="form-group">
            <label for="phone">Phone:</label>
            <input type="text" id="phone" name="phone" value="1234567890">
        </div>
        
        <div class="form-group">
            <label for="message">Message:</label>
            <textarea id="message" name="message">This is a test message</textarea>
        </div>
        
        <button type="submit">Submit Test Lead</button>
    </form>
    
    <div class="response" id="response"></div>
    
    <script>
        document.getElementById('test-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const responseDiv = document.getElementById('response');
            responseDiv.innerHTML = 'Sending request...';
            responseDiv.className = 'response';
            
            try {
                const response = await fetch('zoho-proxy.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'createLead',
                        leadData: {
                            First_Name: document.getElementById('firstName').value,
                            Last_Name: document.getElementById('lastName').value,
                            Email: document.getElementById('email').value,
                            Phone: document.getElementById('phone').value,
                            Description: document.getElementById('message').value,
                            Lead_Source: 'Test Form'
                        }
                    })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    responseDiv.innerHTML = '<div class="success">Success!</div><pre>' + JSON.stringify(result, null, 2) + '</pre>';
                } else {
                    responseDiv.innerHTML = '<div class="error">Error:</div><pre>' + JSON.stringify(result, null, 2) + '</pre>';
                }
            } catch (error) {
                responseDiv.innerHTML = '<div class="error">Connection error:</div><pre>' + error + '</pre>';
                responseDiv.className = 'response error';
            }
        });
    </script>
</body>
</html>
