import { faker } from '@faker-js/faker';

const BASE_URL = 'http://localhost:3000/api/contacts';

function generateRandomContact() {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number()
    };
}

async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 'ERROR', data: error.message };
    }
}

async function seedContacts(count = 5) {
    console.log(`Seeding ${count} contacts...\n`);

    for (let i = 0; i < count; i++) {
        const contact = generateRandomContact();
        const result = await request(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contact)
        });

        if (result.status === 201) {
            console.log(`Contact ${i + 1} created: ${contact.name}`);
        }
    }

    console.log('\nSeeding completed!\n');
}

async function testAPI() {
    console.log('Starting API tests...\n');

    await seedContacts(5);

    let testContactId = null;
    let createdContactId = null;

    console.log('TEST 1: GET /api/contacts');
    const getAllResult = await request(BASE_URL);
    console.log(`Status: ${getAllResult.status}`);
    console.log(`Response: Found ${getAllResult.data.length} contacts`);

    if (getAllResult.status === 200 && getAllResult.data.length > 0) {
        testContactId = getAllResult.data[0].id;
        console.log('PASS: Got contacts list\n');
    } else {
        console.log('FAIL: Failed to get contacts\n');
    }

    if (testContactId) {
        console.log('TEST 2: GET /api/contacts/:id');
        const getOneResult = await request(`${BASE_URL}/${testContactId}`);
        console.log(`Status: ${getOneResult.status}`);
        console.log('Response:', JSON.stringify(getOneResult.data, null, 2));

        if (getOneResult.status === 200) {
            console.log('PASS: Contact found\n');
        } else {
            console.log('FAIL: Contact not found\n');
        }
    }

    console.log('TEST 3: GET /api/contacts/:id (invalid ID)');
    const invalidId = faker.string.alphanumeric(10);
    const getInvalidResult = await request(`${BASE_URL}/${invalidId}`);
    console.log(`Status: ${getInvalidResult.status}`);
    console.log('Response:', JSON.stringify(getInvalidResult.data, null, 2));

    if (getInvalidResult.status === 404) {
        console.log('PASS: Correctly returned 404\n');
    } else {
        console.log('FAIL: Should be 404\n');
    }

    console.log('TEST 4: POST /api/contacts');
    const newContact = generateRandomContact();

    const postResult = await request(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
    });

    console.log(`Status: ${postResult.status}`);
    console.log('Response:', JSON.stringify(postResult.data, null, 2));

    if (postResult.status === 201 && postResult.data.id) {
        createdContactId = postResult.data.id;
        console.log('PASS: Contact created\n');
    } else {
        console.log('FAIL: Failed to create contact\n');
    }

    console.log('TEST 5: POST /api/contacts (missing name)');
    const invalidPost = await request(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: faker.internet.email() })
    });

    console.log(`Status: ${invalidPost.status}`);
    console.log('Response:', JSON.stringify(invalidPost.data, null, 2));

    if (invalidPost.status === 400) {
        console.log('PASS: Validation works correctly\n');
    } else {
        console.log('FAIL: Should be 400\n');
    }

    if (createdContactId) {
        console.log('TEST 6: PUT /api/contacts/:id');
        const updateData = {
            name: faker.person.fullName(),
            email: faker.internet.email()
        };

        const putResult = await request(`${BASE_URL}/${createdContactId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        console.log(`Status: ${putResult.status}`);
        console.log('Response:', JSON.stringify(putResult.data, null, 2));

        if (putResult.status === 200) {
            console.log('PASS: Contact updated\n');
        } else {
            console.log('FAIL: Failed to update contact\n');
        }
    }

    if (createdContactId) {
        console.log('TEST 7: PUT /api/contacts/:id (empty body)');
        const emptyPut = await request(`${BASE_URL}/${createdContactId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });

        console.log(`Status: ${emptyPut.status}`);
        console.log('Response:', JSON.stringify(emptyPut.data, null, 2));

        if (emptyPut.status === 400) {
            console.log('PASS: Empty body validation works\n');
        } else {
            console.log('FAIL: Should be 400\n');
        }
    }

    console.log('TEST 8: PUT /api/contacts/:id (invalid ID)');
    const invalidUpdateId = faker.string.alphanumeric(10);
    const invalidPut = await request(`${BASE_URL}/${invalidUpdateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: faker.person.fullName() })
    });

    console.log(`Status: ${invalidPut.status}`);
    console.log('Response:', JSON.stringify(invalidPut.data, null, 2));

    if (invalidPut.status === 404) {
        console.log('PASS: Correctly returned 404\n');
    } else {
        console.log('FAIL: Should be 404\n');
    }

    if (createdContactId) {
        console.log('TEST 9: PATCH /api/contacts/:id/favorite (set to true)');
        const patchFavoriteTrue = await request(`${BASE_URL}/${createdContactId}/favorite`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorite: true })
        });

        console.log(`Status: ${patchFavoriteTrue.status}`);
        console.log('Response:', JSON.stringify(patchFavoriteTrue.data, null, 2));

        if (patchFavoriteTrue.status === 200 && patchFavoriteTrue.data.favorite === true) {
            console.log('PASS: Favorite set to true\n');
        } else {
            console.log('FAIL: Failed to update favorite status\n');
        }
    }

    if (createdContactId) {
        console.log('TEST 10: PATCH /api/contacts/:id/favorite (set to false)');
        const patchFavoriteFalse = await request(`${BASE_URL}/${createdContactId}/favorite`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorite: false })
        });

        console.log(`Status: ${patchFavoriteFalse.status}`);
        console.log('Response:', JSON.stringify(patchFavoriteFalse.data, null, 2));

        if (patchFavoriteFalse.status === 200 && patchFavoriteFalse.data.favorite === false) {
            console.log('PASS: Favorite set to false\n');
        } else {
            console.log('FAIL: Failed to update favorite status\n');
        }
    }

    console.log('TEST 11: PATCH /api/contacts/:id/favorite (missing favorite field)');
    const patchNoFavorite = await request(`${BASE_URL}/${createdContactId || 1}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
    });

    console.log(`Status: ${patchNoFavorite.status}`);
    console.log('Response:', JSON.stringify(patchNoFavorite.data, null, 2));

    if (patchNoFavorite.status === 400) {
        console.log('PASS: Validation works for missing favorite field\n');
    } else {
        console.log('FAIL: Should be 400\n');
    }

    console.log('TEST 12: PATCH /api/contacts/:id/favorite (invalid ID)');
    const patchInvalidId = await request(`${BASE_URL}/999999/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: true })
    });

    console.log(`Status: ${patchInvalidId.status}`);
    console.log('Response:', JSON.stringify(patchInvalidId.data, null, 2));

    if (patchInvalidId.status === 404) {
        console.log('PASS: Correctly returned 404 for invalid ID\n');
    } else {
        console.log('FAIL: Should be 404\n');
    }

    if (createdContactId) {
        console.log('TEST 13: DELETE /api/contacts/:id');
        const deleteResult = await request(`${BASE_URL}/${createdContactId}`, {
            method: 'DELETE'
        });

        console.log(`Status: ${deleteResult.status}`);
        console.log('Response:', JSON.stringify(deleteResult.data, null, 2));

        if (deleteResult.status === 200) {
            console.log('PASS: Contact deleted\n');
        } else {
            console.log('FAIL: Failed to delete contact\n');
        }
    }

    console.log('TEST 14: DELETE /api/contacts/:id (invalid ID)');
    const deleteInvalidId = faker.string.alphanumeric(10);
    const invalidDelete = await request(`${BASE_URL}/${deleteInvalidId}`, {
        method: 'DELETE'
    });

    console.log(`Status: ${invalidDelete.status}`);
    console.log('Response:', JSON.stringify(invalidDelete.data, null, 2));

    if (invalidDelete.status === 404) {
        console.log('PASS: Correctly returned 404\n');
    } else {
        console.log('FAIL: Should be 404\n');
    }

    console.log('Testing completed!');
}

testAPI().catch(error => {
    console.error('Error during testing:', error);
});
