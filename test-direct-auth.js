// Test authentication directly with raw HTTP request
const https = require('https');

const data = JSON.stringify({
  email: 'mparish@meridianswfl.com',
  password: 'Meridian',
  gotrue_meta_security: {}
});

const options = {
  hostname: 'rxkakjowitqnbbjezedu.supabase.co',
  port: 443,
  path: '/auth/v1/token?grant_type=password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTM1NTgsImV4cCI6MjA2OTgyOTU1OH0.h0tIYhWUsAsB5_rle4pB6OyiEuJx-V1MIYLSbisBIe8',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a2Fram93aXRxbmJiamV6ZWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTM1NTgsImV4cCI6MjA2OTgyOTU1OH0.h0tIYhWUsAsB5_rle4pB6OyiEuJx-V1MIYLSbisBIe8'
  }
};

console.log('Testing direct auth request...\n');

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Status Message: ${res.statusMessage}`);
  console.log('Headers:', res.headers);
  console.log('\n');

  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(responseData);
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! Login worked!');
        console.log('Access Token:', parsed.access_token?.substring(0, 50) + '...');
        console.log('User:', parsed.user?.email);
      } else {
        console.log('❌ ERROR Response:');
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.msg) {
          console.log('\n🔍 Specific Error:', parsed.msg);
        }
        if (parsed.error_description) {
          console.log('🔍 Error Description:', parsed.error_description);
        }
      }
    } catch (e) {
      console.log('Raw Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.write(data);
req.end();