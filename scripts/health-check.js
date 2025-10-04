#!/usr/bin/env node

// Simple health check script to verify the backend is running

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function healthCheck() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      console.log('✅ Backend health check passed');
      console.log(`Message: ${data.message}`);
      process.exit(0);
    } else {
      console.error('❌ Backend health check failed');
      console.error(`Status: ${response.status}`);
      console.error(`Message: ${data.message || 'No message'}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Backend health check failed');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

healthCheck();