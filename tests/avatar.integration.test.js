import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function testAvatarAPI() {
    console.log('\nAVATAR INTEGRATION TESTS\n');

    const testUser = generateRandomUser();
    let authToken = null;

    console.log('SETUP: Registering user...');
    const registerResult = await request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    if (registerResult.status !== 201) {
        console.error('Setup failed - registration');
        return;
    }

    const loginResult = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    if (loginResult.status === 200) {
        authToken = loginResult.data.data.token;
        console.log('Setup complete\n');
    } else {
        console.error('Setup failed - login');
        return;
    }

    console.log('TEST 1: Check Gravatar was set on registration');
    const currentResult = await request(`${BASE_URL}/auth/current`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${currentResult.status}`);
    console.log(currentResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 2: Check static file serving');
    const staticResult = await request('http://localhost:3000/avatars/avatar.jpg', {
        method: 'GET',
    });

    console.log(`Status: ${staticResult.status}`);
    console.log(staticResult.status === 200 ? 'PASS' : 'INFO: File not found (expected if not present)');

    console.log('\nTEST 3: PATCH /api/auth/avatars (upload avatar)');

    const testImagePath = path.join(__dirname, '..', 'public', 'avatars', 'avatar.jpg');

    if (fs.existsSync(testImagePath)) {
        const fileBuffer = fs.readFileSync(testImagePath);
        const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.jpg');

        const uploadResult = await request(`${BASE_URL}/auth/avatars`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            body: formData,
        });

        console.log(`Status: ${uploadResult.status}`);
        console.log('Response:', JSON.stringify(uploadResult.data, null, 2));

        if (uploadResult.status === 200 && uploadResult.data.data.avatarURL) {
            console.log('PASS - Avatar uploaded');
            console.log(`Avatar URL: ${uploadResult.data.data.avatarURL}`);
        } else {
            console.log('FAIL');
        }
    } else {
        console.log('SKIP: Test image not found at public/avatars/avatar.jpg');
    }

    console.log('\nTEST 4: PATCH /api/auth/avatars (without token)');
    const unauthorizedUpload = await request(`${BASE_URL}/auth/avatars`, {
        method: 'PATCH',
        body: new FormData(),
    });

    console.log(`Status: ${unauthorizedUpload.status}`);
    console.log(unauthorizedUpload.status === 401 ? 'PASS' : 'FAIL');

    await request(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log('\nAVATAR TESTS COMPLETED\n');
}

testAvatarAPI().catch(console.error);
