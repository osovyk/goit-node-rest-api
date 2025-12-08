import express from 'express';
import {
    register,
    login,
    logout,
    getCurrent,
    updateSubscription,
    updateAvatar,
    verifyEmail,
    resendVerificationEmail,
    verifyUserForTest,
} from '../controllers/authControllers.js';
import validateBody from '../helpers/validateBody.js';
import {
    registerSchema,
    loginSchema,
    updateSubscriptionSchema,
    verifyEmailSchema,
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
authRouter.get('/verify/:verificationToken', verifyEmail);
authRouter.post('/verify', validateBody(verifyEmailSchema), resendVerificationEmail);

if (process.env.NODE_ENV !== 'production') {
    authRouter.post('/verify-test', validateBody(verifyEmailSchema), verifyUserForTest);
}

export default authRouter;
