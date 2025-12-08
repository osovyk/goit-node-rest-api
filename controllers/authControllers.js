import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import fs from 'fs/promises';
import path from 'path';
import User from '../models/User.js';

const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                code: 409,
                message: 'Email in use',
                data: 'Conflict',
            });
        }

        const avatarURL = gravatar.url(email, { s: '250', r: 'pg', d: 'retro' }, true);

        const newUser = await User.create({
            email,
            password,
            avatarURL,
        });

        res.status(201).json({
            status: 'success',
            code: 201,
            data: {
                user: {
                    email: newUser.email,
                    subscription: newUser.subscription,
                    avatarURL: newUser.avatarURL,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !user.validPassword(password)) {
            return res.status(401).json({
                status: 'error',
                code: 401,
                message: 'Email or password is wrong',
                data: 'Unauthorized',
            });
        }

        const payload = {
            id: user.id,
            email: user.email,
        };

        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        await user.update({ token });

        res.json({
            status: 'success',
            code: 200,
            data: {
                token,
                user: {
                    email: user.email,
                    subscription: user.subscription,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                code: 401,
                message: 'Not authorized',
                data: 'Unauthorized',
            });
        }

        await user.update({ token: null });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getCurrent = async (req, res, next) => {
    try {
        const { email, subscription, avatarURL } = req.user;

        res.json({
            status: 'success',
            code: 200,
            data: {
                email,
                subscription,
                avatarURL,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateSubscription = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { subscription } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                code: 404,
                message: 'User not found',
                data: 'Not Found',
            });
        }

        await user.update({ subscription });

        res.json({
            status: 'success',
            code: 200,
            data: {
                email: user.email,
                subscription: user.subscription,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                code: 400,
                message: 'No file uploaded',
                data: 'Bad Request',
            });
        }

        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                code: 401,
                message: 'Not authorized',
                data: 'Unauthorized',
            });
        }

        const ext = path.extname(req.file.originalname);
        const filename = `${userId}${ext}`;
        const oldPath = req.file.path;
        const newPath = path.join('public', 'avatars', filename);

        await fs.rename(oldPath, newPath);

        const avatarURL = `/avatars/${filename}`;
        await user.update({ avatarURL });

        res.json({
            status: 'success',
            code: 200,
            data: {
                avatarURL,
            },
        });
    } catch (error) {
        next(error);
    }
};
