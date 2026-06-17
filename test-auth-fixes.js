// Test script to verify authentication fixes
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAuthentication() {
    console.log('🧪 Testing Authentication Fixes...\n');

    // Test 1: Checkout route without authentication
    console.log('1. Testing /api/billing/checkout without authentication...');
    try {
        const response = await fetch(`${BASE_URL}/api/billing/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: 'test' })
        });
        console.log(`   Status: ${response.status}`);
        if (response.status === 401) {
            console.log('   ✅ PASS: Route properly protected');
        } else {
            console.log('   ❌ FAIL: Route not protected');
        }
    } catch (error) {
        console.log('   ⚠️  ERROR:', error.message);
    }

    // Test 2: Players route without authentication
    console.log('\n2. Testing /api/players without authentication...');
    try {
        const response = await fetch(`${BASE_URL}/api/players`);
        console.log(`   Status: ${response.status}`);
        if (response.status === 401) {
            console.log('   ✅ PASS: Route properly protected');
        } else {
            console.log('   ❌ FAIL: Route not protected');
        }
    } catch (error) {
        console.log('   ⚠️  ERROR:', error.message);
    }

    // Test 3: Rate limiting with invalid requests
    console.log('\n3. Testing rate limiting with invalid requests...');
    for (let i = 1; i <= 3; i++) {
        try {
            const response = await fetch(`${BASE_URL}/api/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invalid: 'data' })
            });
            console.log(`   Request ${i}: Status ${response.status}`);
            if (response.status === 401) {
                console.log('   ✅ PASS: Authentication error (not rate limited)');
            } else if (response.status === 429) {
                console.log('   ❌ FAIL: Rate limited instead of showing auth error');
            }
        } catch (error) {
            console.log(`   ⚠️  Request ${i} ERROR:`, error.message);
        }
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n🏁 Authentication tests complete!');
}

testAuthentication().catch(console.error);