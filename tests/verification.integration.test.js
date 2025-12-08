import { faker } from '@faker-js/faker';

const BASE_URL = 'http://localhost:3000/api';

async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.status === 204) {
            return { status: 204, data: null };
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return { status: response.status, data };
        }

        return { status: response.status, data: null };
    } catch (error) {
        return { status: 'ERROR', data: error.message };
    }
}

function generateRandomUser() {
    return {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 10 }),
    };
}

async function testVerificationAPI() {
    console.log('\nEMAIL VERIFICATION INTEGRATION TESTS\n');

    const testUser = generateRandomUser();

    console.log('TEST 1: Register user and check verification email sent');
    const registerResult = await request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${registerResult.status}`);
    console.log(registerResult.status === 201 ? 'PASS - User registered' : 'FAIL');
    console.log('INFO: Check email for verification link');

    console.log('\nTEST 2: Try login before verification');
    const loginResult = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${loginResult.status}`);
    console.log(`Message: ${loginResult.data?.message}`);
    console.log(loginResult.status === 401 && loginResult.data?.message === 'Email not verified' ? 'PASS' : 'FAIL');

    console.log('\nTEST 3: Resend verification email');
    const resendResult = await request(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email }),
    });

    console.log(`Status: ${resendResult.status}`);
    console.log(`Message: ${resendResult.data?.message}`);
    console.log(resendResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 4: Resend with missing email field');
    const missingFieldResult = await request(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });

    console.log(`Status: ${missingFieldResult.status}`);
    console.log(missingFieldResult.status === 400 ? 'PASS' : 'FAIL');

    console.log('\nTEST 5: Verify with invalid token');
    const invalidTokenResult = await request(`${BASE_URL}/auth/verify/invalid-token-xyz`, {
        method: 'GET',
    });

    console.log(`Status: ${invalidTokenResult.status}`);
    console.log(`Message: ${invalidTokenResult.data?.message}`);
    console.log(invalidTokenResult.status === 404 && invalidTokenResult.data?.message === 'User not found' ? 'PASS' : 'FAIL');

    console.log('\nMANUAL TESTS REQUIRED:');
    console.log('1. Check your email for verification link');
    console.log('2. Click the link or use:');
    console.log('   curl http://localhost:3000/api/auth/verify/YOUR_TOKEN');
    console.log('3. Try login again after verification');
    console.log('4. Try to resend verification after already verified (should return 400)');

    console.log('\nVERIFICATION TESTS COMPLETED\n');
}

testVerificationAPI().catch(console.error);
