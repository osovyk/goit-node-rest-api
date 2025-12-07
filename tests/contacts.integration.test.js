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

function generateRandomContact() {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
    };
}

async function testContactsAPI() {
    console.log('\nCONTACTS INTEGRATION TESTS\n');

    const testUser = generateRandomUser();
    let authToken = null;
    let contactId = null;

    console.log('SETUP: Registering and logging in...');
    await request(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    const loginResult = await request(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser),
    });

    if (loginResult.status === 200) {
        authToken = loginResult.data.data.token;
        console.log('Setup complete\n');
    } else {
        console.error('Setup failed');
        return;
    }

    console.log('TEST 1: GET /api/contacts (empty list)');
    const getAllResult = await request(`${BASE_URL}/contacts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${getAllResult.status}`);
    console.log(`Contacts: ${getAllResult.data?.data?.length || 0}`);
    console.log(getAllResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 2: GET /api/contacts (without token)');
    const unauthorizedResult = await request(`${BASE_URL}/contacts`, {
        method: 'GET',
    });

    console.log(`Status: ${unauthorizedResult.status}`);
    console.log(unauthorizedResult.status === 401 ? 'PASS' : 'FAIL');

    console.log('\nTEST 3: POST /api/contacts');
    const newContact = generateRandomContact();
    const createResult = await request(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(newContact),
    });

    console.log(`Status: ${createResult.status}`);

    if (createResult.status === 201 && createResult.data.data.id) {
        contactId = createResult.data.data.id;
        console.log(`PASS - Contact ID: ${contactId}`);
    } else {
        console.log('FAIL');
        return;
    }

    console.log('\nTEST 4: GET /api/contacts/:id');
    const getOneResult = await request(`${BASE_URL}/contacts/${contactId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${getOneResult.status}`);
    console.log(getOneResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 5: PUT /api/contacts/:id');
    const updateData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
    };
    const updateResult = await request(`${BASE_URL}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updateData),
    });

    console.log(`Status: ${updateResult.status}`);
    console.log(updateResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 6: PATCH /api/contacts/:id/favorite');
    const favoriteResult = await request(`${BASE_URL}/contacts/${contactId}/favorite`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ favorite: true }),
    });

    console.log(`Status: ${favoriteResult.status}`);
    console.log(favoriteResult.status === 200 && favoriteResult.data.data.favorite ? 'PASS' : 'FAIL');

    console.log('\nTEST 7: GET /api/contacts?favorite=true');
    const filterResult = await request(`${BASE_URL}/contacts?favorite=true`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${filterResult.status}`);
    console.log(`Favorites: ${filterResult.data?.data?.length || 0}`);
    console.log(filterResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 8: GET /api/contacts?page=1&limit=5');
    const paginationResult = await request(`${BASE_URL}/contacts?page=1&limit=5`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${paginationResult.status}`);
    console.log(`Contacts: ${paginationResult.data?.data?.length || 0}`);
    console.log(paginationResult.status === 200 ? 'PASS' : 'FAIL');

    console.log('\nTEST 9: DELETE /api/contacts/:id');
    const deleteResult = await request(`${BASE_URL}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log(`Status: ${deleteResult.status}`);
    console.log(deleteResult.status === 200 ? 'PASS' : 'FAIL');

    await request(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    });

    console.log('\nCONTACTS TESTS COMPLETED\n');
}

testContactsAPI().catch(console.error);
