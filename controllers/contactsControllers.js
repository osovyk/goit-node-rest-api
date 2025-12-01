import * as contactsService from '../services/contactsServices.js';
import HttpError from '../helpers/HttpError.js';

export const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await contactsService.listContacts();
        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            throw HttpError(404, 'Not found');
        }

        const contact = await contactsService.getContactById(id);

        if (!contact) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            throw HttpError(404, 'Not found');
        }

        const contact = await contactsService.removeContact(id);

        if (!contact) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const createContact = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const newContact = await contactsService.addContact(name, email, phone);
        res.status(201).json(newContact);
    } catch (error) {
        next(error);
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (isNaN(id)) {
            throw HttpError(404, 'Not found');
        }

        if (Object.keys(body).length === 0) {
            throw HttpError(400, 'Body must have at least one field');
        }

        const updatedContact = await contactsService.updateContact(id, body);

        if (!updatedContact) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};

export const updateContactFavorite = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (isNaN(id)) {
            throw HttpError(404, 'Not found');
        }

        const updatedContact = await contactsService.updateStatusContact(id, body);

        if (!updatedContact) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};
