const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function testFlow() {
  try {
    console.log("1. Registering user...");
    const email = `test_api_${Date.now()}@gmail.com`;
    const password = 'Password123';
    
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test API User',
        email,
        password,
        role: 'MEMBER'
      })
    });
    
    if (!registerRes.ok) {
      console.error("   Registration failed:", await registerRes.text());
      return;
    }
    console.log("   Registration successful.");

    console.log("2. Logging in...");
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!loginRes.ok) {
      console.error("   Login failed:", await loginRes.text());
      return;
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("   Login successful. Token acquired.");

    console.log("3. Uploading selfie...");
    const selfieFile = path.join(__dirname, 'uploads/1781027742103-859867313.jpg');
    if (!fs.existsSync(selfieFile)) {
      console.error(`   Selfie file not found at ${selfieFile}.`);
      return;
    }

    // Prepare multipart/form-data payload manually or using FormData
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(selfieFile);
    // In node fetch, we can append a Blob
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append('file', blob, '1781027742103-859867313.jpg');

    const uploadRes = await fetch(`${API_URL}/media/upload-selfie`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!uploadRes.ok) {
      console.error("   Upload failed:", await uploadRes.text());
      return;
    }
    const uploadData = await uploadRes.json();
    console.log("   Upload successful. Selfie URL:", uploadData.selfieUrl);

    console.log("4. Running facial recognition...");
    const recognizeRes = await fetch(`${API_URL}/media/recognize-face`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const recognizeData = await recognizeRes.json();
    console.log("   Facial recognition complete. Response:", recognizeData);

  } catch (e) {
    console.error("Unexpected error:", e);
  }
}

testFlow();
