import express from 'express';
import {
    register,
    login,
    logout,
    getCurrent,
    updateSubscription,
    updateAvatar,
} from '../controllers/authControllers.js';
import validateBody from '../helpers/validateBody.js';
import {
    registerSchema,
    loginSchema,
    updateSubscriptionSchema,
} from '../schemas/authSchemas.js';
import auth from '../middleware/auth.js';
import upload from '../config/multer.js';

const authRouter = express.Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/logout', auth, logout);
authRouter.get('/current', auth, getCurrent);
authRouter.patch('/subscription', auth, validateBody(updateSubscriptionSchema), updateSubscription);
authRouter.patch('/avatars', auth, upload.single('avatar'), updateAvatar);

export default authRouter;
