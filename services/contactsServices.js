import Contact from '../models/Contact.js';

export async function listContacts() {
    return await Contact.findAll();
}

export async function getContactById(contactId) {
    return await Contact.findByPk(contactId);
}

export async function removeContact(contactId) {
    const contact = await Contact.findByPk(contactId);
    if (!contact) return null;

    await contact.destroy();
    return contact;
}

export async function addContact(name, email, phone) {
    return await Contact.create({ name, email, phone });
}

export async function updateContact(contactId, body) {
    const contact = await Contact.findByPk(contactId);
    if (!contact) return null;

    await contact.update(body);
    return contact;
}

export async function updateStatusContact(contactId, body) {
    const contact = await Contact.findByPk(contactId);
    if (!contact) return null;

    await contact.update({ favorite: body.favorite });
    return contact;
}
