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

async function testAuthAPI() {
    console.log('\nAUTH INTEGRATION TESTS\n');

    const testUser = generateRandomUser();
    let authToken = null;

    console.log('TEST 1: POST /api/auth/register');
    const registerResult = await request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${registerResult.status}`);
    console.log(registerResult.status === 201 ? 'PASS' : 'FAIL');

    if (registerResult.status !== 201) {
        console.error('Failed to register, aborting tests');
        return;
    }

    console.log('\nTEST 2: POST /api/auth/register (duplicate email)');
    const duplicateResult = await request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${duplicateResult.status}`);
    console.log(duplicateResult.status === 409 ? 'PASS' : 'FAIL');

    console.log('\nTEST 3: POST /api/auth/login');
    const loginResult = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${loginResult.status}`);

    if (loginResult.status === 200 && loginResult.data.data.token) {
        authToken = loginResult.data.data.token;
        console.log('PASS - Token received');
    } else {
        console.log('FAIL');
        return;
    }

    console.log('\nTEST 4: POST /api/auth/login (wrong password)');
    const wrongPasswordResult = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testUser.email,
            password: 'wrongpassword',
        }),
    });

    console.log(`Status: ${wrongPasswordResult.status}`);
    console.log(wrongPasswordResult.status === 401 ? 'PASS' : 'FAIL');

    console.log('\nTEST 5: GET /api/auth/current');
    const currentResult = await request(`${BASE_URL}/auth/current`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${currentResult.status}`);
    console.log(currentResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 6: GET /api/auth/current (without token)');
    const unauthorizedResult = await request(`${BASE_URL}/auth/current`, {
        method: 'GET',
    });

    console.log(`Status: ${unauthorizedResult.status}`);
    console.log(unauthorizedResult.status === 401 ? 'PASS' : 'FAIL');

    console.log('\nTEST 7: PATCH /api/auth/subscription');
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

    console.log('\nTEST 8: POST /api/auth/logout');
    const logoutResult = await request(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${logoutResult.status}`);
    console.log(logoutResult.status === 204 ? 'PASS' : 'FAIL');

    console.log('\nTEST 9: GET /api/auth/current (after logout)');
    const afterLogoutResult = await request(`${BASE_URL}/auth/current`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${afterLogoutResult.status}`);
    console.log(afterLogoutResult.status === 401 ? 'PASS' : 'FAIL');

    console.log('\nAUTH TESTS COMPLETED\n');
}

testAuthAPI().catch(console.error);
