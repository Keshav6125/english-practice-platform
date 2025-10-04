import fetch from 'node-fetch';

async function testConnection() {
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);

    // Test initialize conversation endpoint
    const scenario = {
      category: 'free_topic',
      title: 'Casual Conversation',
      context: 'Practicing everyday English conversation'
    };

    const initResponse = await fetch('http://localhost:3001/api/initialize-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenario }),
    });

    const initData = await initResponse.json();
    console.log('Initialize conversation response:', initData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();