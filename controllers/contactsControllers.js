import * as contactsService from '../services/contactsServices.js';
import HttpError from '../helpers/HttpError.js';

export const getAllContacts = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const contacts = await contactsService.listContacts(userId, req.query);
        res.status(200).json({
            status: 'success',
            code: 200,
            data: contacts,
        });
    } catch (error) {
        next(error);
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (isNaN(id)) {
            throw HttpError(404, 'Not found');
        }

        const contact = await contactsService.getContactById(id, userId);

        if (!contact) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json({
            status: 'success',
            code: 200,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (isNaN(id)) {
            throw HttpError(404, 'Not found');
        }

        const contact = await contactsService.removeContact(id, userId);

        if (!contact) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json({
            status: 'success',
            code: 200,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

export const createContact = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const userId = req.user.id;
        const newContact = await contactsService.addContact(name, email, phone, userId);
        res.status(201).json({
            status: 'success',
            code: 201,
            data: newContact,
        });
    } catch (error) {
        next(error);
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const userId = req.user.id;

        if (isNaN(id)) {
            throw HttpError(404, 'Not found');
        }

        if (Object.keys(body).length === 0) {
            throw HttpError(400, 'Body must have at least one field');
        }

        const updatedContact = await contactsService.updateContact(id, body, userId);

        if (!updatedContact) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json({
            status: 'success',
            code: 200,
            data: updatedContact,
        });
    } catch (error) {
        next(error);
    }
};

export const updateContactFavorite = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const userId = req.user.id;

        if (isNaN(id)) {
            throw HttpError(404, 'Not found');
        }

        const updatedContact = await contactsService.updateStatusContact(id, body, userId);

        if (!updatedContact) {
            throw HttpError(404, 'Not found');
        }

        res.status(200).json({
            status: 'success',
            code: 200,
            data: updatedContact,
        });
    } catch (error) {
        next(error);
    }
};
