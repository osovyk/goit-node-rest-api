import { faker } from '@faker-js/faker';

const BASE_URL = 'http://localhost:3000/api';
let authToken = null;

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

function generateRandomContact() {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
    };
}

async function testAPI() {
    console.log('Starting API tests with JWT Authentication...\n');
    console.log('='.repeat(60) + '\n');

    const testUser = generateRandomUser();
    let createdContactId = null;

    console.log('AUTH TEST 1: POST /api/auth/register');
    console.log('Creating test user...');
    const registerResult = await request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${registerResult.status}`);
    console.log('Response:', JSON.stringify(registerResult.data, null, 2));

    if (registerResult.status === 201) {
        console.log('PASS: User registered successfully\n');
    } else {
        console.log('FAIL: Failed to register user\n');
        return;
    }

    console.log('AUTH TEST 2: POST /api/auth/register (duplicate email)');
    const duplicateRegister = await request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${duplicateRegister.status}`);
    console.log('Response:', JSON.stringify(duplicateRegister.data, null, 2));

    if (duplicateRegister.status === 409) {
        console.log('PASS: Correctly returned 409 Conflict\n');
    } else {
        console.log('FAIL: Should be 409\n');
    }

    console.log('AUTH TEST 3: POST /api/auth/login');
    const loginResult = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    console.log(`Status: ${loginResult.status}`);
    console.log('Response:', JSON.stringify(loginResult.data, null, 2));

    if (loginResult.status === 200 && loginResult.data.data.token) {
        authToken = loginResult.data.data.token;
        console.log('PASS: Login successful, token received\n');
        console.log(`Token (first 50 chars): ${authToken.substring(0, 50)}...\n`);
    } else {
        console.log('FAIL: Failed to login\n');
        return;
    }

    console.log('AUTH TEST 4: POST /api/auth/login (wrong password)');
    const wrongPasswordLogin = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: testUser.email,
            password: 'wrongpassword123',
        }),
    });

    console.log(`Status: ${wrongPasswordLogin.status}`);
    console.log('Response:', JSON.stringify(wrongPasswordLogin.data, null, 2));

    if (wrongPasswordLogin.status === 401) {
        console.log('PASS: Correctly returned 401 Unauthorized\n');
    } else {
        console.log('FAIL: Should be 401\n');
    }

    console.log('AUTH TEST 5: GET /api/auth/current');
    const currentUser = await request(`${BASE_URL}/auth/current`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${currentUser.status}`);
    console.log('Response:', JSON.stringify(currentUser.data, null, 2));

    if (currentUser.status === 200) {
        console.log('PASS: Current user retrieved\n');
    } else {
        console.log('FAIL: Failed to get current user\n');
    }

    console.log('AUTH TEST 6: GET /api/auth/current (without token)');
    const unauthorizedCurrent = await request(`${BASE_URL}/auth/current`, {
        method: 'GET',
    });

    console.log(`Status: ${unauthorizedCurrent.status}`);
    console.log('Response:', JSON.stringify(unauthorizedCurrent.data, null, 2));

    if (unauthorizedCurrent.status === 401) {
        console.log('PASS: Correctly returned 401 Unauthorized\n');
    } else {
        console.log('FAIL: Should be 401\n');
    }

    console.log('='.repeat(60));
    console.log('CONTACTS TESTS (with authentication)');
    console.log('='.repeat(60) + '\n');

    console.log('CONTACT TEST 1: GET /api/contacts (empty list)');
    const getAllContacts = await request(`${BASE_URL}/contacts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${getAllContacts.status}`);
    console.log(`Found ${getAllContacts.data?.data?.length || 0} contacts`);

    if (getAllContacts.status === 200) {
        console.log('PASS: Got contacts list\n');
    } else {
        console.log('FAIL: Failed to get contacts\n');
    }

    console.log('CONTACT TEST 2: GET /api/contacts (without token)');
    const unauthorizedContacts = await request(`${BASE_URL}/contacts`, {
        method: 'GET',
    });

    console.log(`Status: ${unauthorizedContacts.status}`);
    console.log('Response:', JSON.stringify(unauthorizedContacts.data, null, 2));

    if (unauthorizedContacts.status === 401) {
        console.log('PASS: Correctly returned 401 Unauthorized\n');
    } else {
        console.log('FAIL: Should be 401\n');
    }

    console.log('CONTACT TEST 3: POST /api/contacts');
    const newContact = generateRandomContact();
    const createContact = await request(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(newContact),
    });

    console.log(`Status: ${createContact.status}`);
    console.log('Response:', JSON.stringify(createContact.data, null, 2));

    if (createContact.status === 201 && createContact.data.data.id) {
        createdContactId = createContact.data.data.id;
        console.log('PASS: Contact created\n');
    } else {
        console.log('FAIL: Failed to create contact\n');
    }

    if (createdContactId) {
        console.log('CONTACT TEST 4: GET /api/contacts/:id');
        const getContact = await request(`${BASE_URL}/contacts/${createdContactId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        console.log(`Status: ${getContact.status}`);
        console.log('Response:', JSON.stringify(getContact.data, null, 2));

        if (getContact.status === 200) {
            console.log('PASS: Contact found\n');
        } else {
            console.log('FAIL: Contact not found\n');
        }
    }

    if (createdContactId) {
        console.log('CONTACT TEST 5: PUT /api/contacts/:id');
        const updateData = {
            name: faker.person.fullName(),
            email: faker.internet.email(),
        };

        const updateContact = await request(`${BASE_URL}/contacts/${createdContactId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(updateData),
        });

        console.log(`Status: ${updateContact.status}`);
        console.log('Response:', JSON.stringify(updateContact.data, null, 2));

        if (updateContact.status === 200) {
            console.log('PASS: Contact updated\n');
        } else {
            console.log('FAIL: Failed to update contact\n');
        }
    }

    if (createdContactId) {
        console.log('CONTACT TEST 6: PATCH /api/contacts/:id/favorite (set to true)');
        const patchFavorite = await request(`${BASE_URL}/contacts/${createdContactId}/favorite`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ favorite: true }),
        });

        console.log(`Status: ${patchFavorite.status}`);
        console.log('Response:', JSON.stringify(patchFavorite.data, null, 2));

        if (patchFavorite.status === 200 && patchFavorite.data.data.favorite === true) {
            console.log('PASS: Favorite set to true\n');
        } else {
            console.log('FAIL: Failed to update favorite\n');
        }
    }

    console.log('CONTACT TEST 7: GET /api/contacts?favorite=true');
    const filterFavorites = await request(`${BASE_URL}/contacts?favorite=true`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${filterFavorites.status}`);
    console.log(`Found ${filterFavorites.data?.data?.length || 0} favorite contacts`);

    if (filterFavorites.status === 200) {
        console.log('PASS: Favorite contacts filtered\n');
    } else {
        console.log('FAIL: Failed to filter favorites\n');
    }

    console.log('CONTACT TEST 8: GET /api/contacts?page=1&limit=5');
    const paginatedContacts = await request(`${BASE_URL}/contacts?page=1&limit=5`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${paginatedContacts.status}`);
    console.log(`Retrieved ${paginatedContacts.data?.data?.length || 0} contacts (max 5)`);

    if (paginatedContacts.status === 200) {
        console.log('PASS: Pagination works\n');
    } else {
        console.log('FAIL: Failed to paginate\n');
    }

    if (createdContactId) {
        console.log('CONTACT TEST 9: DELETE /api/contacts/:id');
        const deleteContact = await request(`${BASE_URL}/contacts/${createdContactId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        });

        console.log(`Status: ${deleteContact.status}`);
        console.log('Response:', JSON.stringify(deleteContact.data, null, 2));

        if (deleteContact.status === 200) {
            console.log('PASS: Contact deleted\n');
        } else {
            console.log('FAIL: Failed to delete contact\n');
        }
    }

    console.log('AUTH TEST 7: PATCH /api/auth/subscription');
    const updateSubscription = await request(`${BASE_URL}/auth/subscription`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ subscription: 'pro' }),
    });

    console.log(`Status: ${updateSubscription.status}`);
    console.log('Response:', JSON.stringify(updateSubscription.data, null, 2));

    if (updateSubscription.status === 200 && updateSubscription.data.data.subscription === 'pro') {
        console.log('PASS: Subscription updated\n');
    } else {
        console.log('FAIL: Failed to update subscription\n');
    }

    console.log('AUTH TEST 8: POST /api/auth/logout');
    const logoutResult = await request(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${logoutResult.status}`);

    if (logoutResult.status === 204) {
        console.log('PASS: Logout successful\n');
    } else {
        console.log(`FAIL: Failed to logout (expected 204, got ${logoutResult.status})\n`);
    }

    console.log('AUTH TEST 9: GET /api/auth/current (after logout)');
    const afterLogout = await request(`${BASE_URL}/auth/current`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${afterLogout.status}`);
    console.log('Response:', JSON.stringify(afterLogout.data, null, 2));

    if (afterLogout.status === 401) {
        console.log('PASS: Token invalidated after logout\n');
    } else {
        console.log('FAIL: Should be 401\n');
    }

    console.log('='.repeat(60));
    console.log('Testing completed!');
    console.log('='.repeat(60));
}

testAPI().catch(error => {
    console.error('Error during testing:', error);
});
