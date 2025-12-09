import { faker } from '@faker-js/faker';
import { verifyUserDirectly } from '../helpers/testHelpers.js';

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

async function testAuthAPI() {
    console.log('\nAUTH INTEGRATION TESTS WITH EMAIL VERIFICATION\n');

    const testUser = generateRandomUser();
    let authToken = null;

    console.log('TEST 1: POST /api/auth/register');
    const registerResult = await request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${registerResult.status}`);

    if (registerResult.status === 201 && registerResult.data.data.user.avatarURL) {
        console.log('PASS - User registered with avatarURL');
        console.log(`Email: ${registerResult.data.data.user.email}`);
    } else {
        console.log('FAIL');
    }

    if (registerResult.status !== 201) {
        console.error('Failed to register, aborting tests');
        return;
    }

    console.log('\nTEST 2: POST /api/auth/login (before verification)');
    const loginBeforeVerify = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${loginBeforeVerify.status}`);
    console.log(`Message: ${loginBeforeVerify.data?.message}`);
    console.log(loginBeforeVerify.status === 401 && loginBeforeVerify.data.message === 'Email not verified' ? 'PASS - Login blocked before verification' : 'FAIL');

    console.log('\nTEST 3: POST /api/auth/verify (resend verification)');
    const resendResult = await request(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email }),
    });

    console.log(`Status: ${resendResult.status}`);
    console.log(`Message: ${resendResult.data?.message}`);
    console.log(resendResult.status === 200 ? 'PASS - Verification email resent' : 'FAIL');

    console.log('\nTEST 4: POST /api/auth/verify (missing email)');
    const missingEmailResult = await request(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });

    console.log(`Status: ${missingEmailResult.status}`);
    console.log(missingEmailResult.status === 400 ? 'PASS - Missing email validation' : 'FAIL');

    console.log('\nTEST 5: GET /api/auth/verify/:verificationToken (invalid token)');
    const invalidTokenResult = await request(`${BASE_URL}/auth/verify/invalid-token-12345`, {
        method: 'GET',
    });

    console.log(`Status: ${invalidTokenResult.status}`);
    console.log(`Message: ${invalidTokenResult.data?.message}`);
    console.log(invalidTokenResult.status === 404 && invalidTokenResult.data?.message === 'User not found' ? 'PASS - Invalid token returns 404' : 'FAIL');

    console.log('\nSETUP: Auto-verifying user for remaining tests...');
    try {
        await verifyUserDirectly(testUser.email);
        console.log('User verified successfully');
    } catch (error) {
        console.error('Failed to verify user:', error.message);
        return;
    }

    console.log('\nTEST 6: POST /api/auth/login (after verification)');
    const loginResult = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${loginResult.status}`);

    if (loginResult.status === 200 && loginResult.data.data.token) {
        authToken = loginResult.data.data.token;
        console.log('PASS - Login successful after verification');
    } else {
        console.log('FAIL');
        return;
    }

    console.log('\nTEST 7: GET /api/auth/current');
    const currentResult = await request(`${BASE_URL}/auth/current`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${currentResult.status}`);

    if (currentResult.status === 200 && currentResult.data.data.avatarURL) {
        console.log('PASS - Current user with avatarURL');
    } else {
        console.log('FAIL');
    }

    console.log('\nTEST 8: POST /api/auth/verify (already verified)');
    const alreadyVerifiedResult = await request(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email }),
    });

    console.log(`Status: ${alreadyVerifiedResult.status}`);
    console.log(`Message: ${alreadyVerifiedResult.data?.message}`);
    console.log(alreadyVerifiedResult.status === 400 && alreadyVerifiedResult.data?.message === 'Verification has already been passed' ? 'PASS' : 'FAIL');

    console.log('\nTEST 9: PATCH /api/auth/subscription');
    const subscriptionResult = await request(`${BASE_URL}/auth/subscription`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subscription: 'pro' }),
    });

    console.log(`Status: ${subscriptionResult.status}`);
    console.log(subscriptionResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 10: POST /api/auth/logout');
    const logoutResult = await request(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${logoutResult.status}`);
    console.log(logoutResult.status === 204 ? 'PASS' : 'FAIL');

    console.log('\nAUTH TESTS COMPLETED\n');
}

testAuthAPI().catch(console.error);
