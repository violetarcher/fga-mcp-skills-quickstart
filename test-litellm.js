#!/usr/bin/env node

/**
 * Test script for LiteLLM connection
 * Tests the llm.atko.ai endpoint with claude-4-6-sonnet model
 */

const LITELLM_BASE_URL = 'https://llm.atko.ai';
const LITELLM_API_KEY = 'sk-DAGQQx0md0zYB1ibOfQpDw';
const MODEL = 'claude-4-6-sonnet';

async function testLiteLLM() {
  console.log('🧪 Testing LiteLLM connection...');
  console.log(`📡 Endpoint: ${LITELLM_BASE_URL}/v1/chat/completions`);
  console.log(`🤖 Model: ${MODEL}`);
  console.log('---');

  try {
    const response = await fetch(`${LITELLM_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LITELLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from LiteLLM!" if you can hear me.'
          }
        ],
        max_tokens: 100
      })
    });

    console.log(`✅ Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return;
    }

    const data = await response.json();

    console.log('---');
    console.log('📦 Full Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('---');

    if (data.choices && data.choices[0]) {
      console.log('💬 AI Response:', data.choices[0].message.content);
      console.log('---');
      console.log('✅ LiteLLM connection successful!');
      console.log(`📊 Model: ${data.model || MODEL}`);
      console.log(`🔢 Tokens used: ${data.usage?.total_tokens || 'N/A'}`);
    } else {
      console.error('❌ Unexpected response structure');
    }

  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testLiteLLM();
