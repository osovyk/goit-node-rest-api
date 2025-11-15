const BASE_URL = 'http://localhost:3000/api/contacts';

async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 'ERROR', data: error.message };
    }
}

async function testAPI() {
    console.log('Starting API tests...\n');

    let testContactId = null;
    let createdContactId = null;

    console.log('TEST 1: GET /api/contacts');
    const getAllResult = await request(BASE_URL);
    console.log(`Status: ${getAllResult.status}`);
    console.log('Response:', JSON.stringify(getAllResult.data, null, 2));

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
    const getInvalidResult = await request(`${BASE_URL}/invalid-id-123`);
    console.log(`Status: ${getInvalidResult.status}`);
    console.log('Response:', JSON.stringify(getInvalidResult.data, null, 2));

    if (getInvalidResult.status === 404) {
        console.log('PASS: Correctly returned 404\n');
    } else {
        console.log('FAIL: Should be 404\n');
    }

    console.log('TEST 4: POST /api/contacts');
    const newContact = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '(123) 456-7890'
    };

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
        body: JSON.stringify({ email: 'test@test.com' })
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
            name: 'Updated Test User',
            email: 'updated@example.com'
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
    const invalidPut = await request(`${BASE_URL}/invalid-id-456`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' })
    });

    console.log(`Status: ${invalidPut.status}`);
    console.log('Response:', JSON.stringify(invalidPut.data, null, 2));

    if (invalidPut.status === 404) {
        console.log('PASS: Correctly returned 404\n');
    } else {
        console.log('FAIL: Should be 404\n');
    }

    if (createdContactId) {
        console.log('TEST 9: DELETE /api/contacts/:id');
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

    console.log('TEST 10: DELETE /api/contacts/:id (invalid ID)');
    const invalidDelete = await request(`${BASE_URL}/invalid-id-789`, {
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
