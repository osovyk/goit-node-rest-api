import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const contactsPath = path.resolve("db", "contacts.json");

async function readContacts() {
    const data = await fs.readFile(contactsPath, "utf8");
    return JSON.parse(data);
}

async function writeContacts(contacts) {
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
}

export async function listContacts() {
    return await readContacts();
}

export async function getContactById(contactId) {
    const contacts = await readContacts();
    return contacts.find((c) => c.id === contactId) || null;
}

export async function removeContact(contactId) {
    const contacts = await readContacts();
    const index = contacts.findIndex((c) => c.id === contactId);
    if (index === -1) return null;
    const [removed] = contacts.splice(index, 1);
    await writeContacts(contacts);
    return removed;
}

export async function addContact(name, email, phone) {
    const contacts = await readContacts();
    const newContact = {
        id: randomUUID(),
        name,
        email,
        phone,
    };
    contacts.push(newContact);
    await writeContacts(contacts);
    return newContact;
}

export async function updateContact(contactId, body) {
    const contacts = await readContacts();
    const index = contacts.findIndex((c) => c.id === contactId);
    if (index === -1) return null;

    contacts[index] = { ...contacts[index], ...body };
    await writeContacts(contacts);
    return contacts[index];
}
