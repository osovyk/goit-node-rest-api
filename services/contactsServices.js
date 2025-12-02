import Contact from '../models/Contact.js';

export async function listContacts(userId, query = {}) {
    const { page = 1, limit = 20, favorite } = query;
    const offset = (page - 1) * limit;

    const where = { owner: userId };

    if (favorite !== undefined) {
        where.favorite = favorite === 'true';
    }

    const contacts = await Contact.findAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
    });

    return contacts;
}

export async function getContactById(contactId, userId) {
    return await Contact.findOne({
        where: {
            id: contactId,
            owner: userId,
        },
    });
}

export async function removeContact(contactId, userId) {
    const contact = await Contact.findOne({
        where: {
            id: contactId,
            owner: userId,
        },
    });

    if (!contact) return null;

    await contact.destroy();
    return contact;
}

export async function addContact(name, email, phone, userId) {
    return await Contact.create({
        name,
        email,
        phone,
        owner: userId,
    });
}

export async function updateContact(contactId, body, userId) {
    const contact = await Contact.findOne({
        where: {
            id: contactId,
            owner: userId,
        },
    });

    if (!contact) return null;

    await contact.update(body);
    return contact;
}

export async function updateStatusContact(contactId, body, userId) {
    const contact = await Contact.findOne({
        where: {
            id: contactId,
            owner: userId,
        },
    });

    if (!contact) return null;

    await contact.update({ favorite: body.favorite });
    return contact;
}
