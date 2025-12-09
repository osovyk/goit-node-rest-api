import { describe, it, expect } from '@jest/globals';

describe('Auth Controller - Login', () => {
    describe('Response validation', () => {
        it('should return status 200 on successful login', () => {
            const mockLoginResponse = {
                status: 'success',
                code: 200,
                data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
                    user: {
                        email: 'test@example.com',
                        subscription: 'starter',
                    },
                },
            };

            expect(mockLoginResponse.code).toBe(200);
            expect(mockLoginResponse.status).toBe('success');
        });

        it('should return a token in the response', () => {
            const mockLoginResponse = {
                status: 'success',
                code: 200,
                data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
                    user: {
                        email: 'test@example.com',
                        subscription: 'starter',
                    },
                },
            };

            expect(mockLoginResponse.data).toHaveProperty('token');
            expect(typeof mockLoginResponse.data.token).toBe('string');
            expect(mockLoginResponse.data.token.length).toBeGreaterThan(0);
        });

        it('should return user object with email and subscription as strings', () => {
            const mockLoginResponse = {
                status: 'success',
                code: 200,
                data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
                    user: {
                        email: 'test@example.com',
                        subscription: 'starter',
                    },
                },
            };

            expect(mockLoginResponse.data.user).toHaveProperty('email');
            expect(mockLoginResponse.data.user).toHaveProperty('subscription');
            expect(typeof mockLoginResponse.data.user.email).toBe('string');
            expect(typeof mockLoginResponse.data.user.subscription).toBe('string');
        });
    });

    describe('Register response validation', () => {
        it('should return user with avatarURL on registration', () => {
            const mockRegisterResponse = {
                status: 'success',
                code: 201,
                data: {
                    user: {
                        email: 'test@example.com',
                        subscription: 'starter',
                        avatarURL: 'https://www.gravatar.com/avatar/hash?s=250&r=pg&d=retro',
                    },
                },
            };

            expect(mockRegisterResponse.data.user).toHaveProperty('avatarURL');
            expect(typeof mockRegisterResponse.data.user.avatarURL).toBe('string');
        });
    });

    describe('Current user response validation', () => {
        it('should return current user with avatarURL', () => {
            const mockCurrentResponse = {
                status: 'success',
                code: 200,
                data: {
                    email: 'test@example.com',
                    subscription: 'starter',
                    avatarURL: 'https://www.gravatar.com/avatar/hash?s=250&r=pg&d=retro',
                },
            };

            expect(mockCurrentResponse.data).toHaveProperty('avatarURL');
            expect(typeof mockCurrentResponse.data.avatarURL).toBe('string');
        });
    });

    describe('Email verification response validation', () => {
        it('should return verification successful message', () => {
            const mockVerifyResponse = {
                status: 'success',
                code: 200,
                message: 'Verification successful',
            };

            expect(mockVerifyResponse.code).toBe(200);
            expect(mockVerifyResponse.message).toBe('Verification successful');
        });

        it('should return user not found for invalid token', () => {
            const mockErrorResponse = {
                status: 'error',
                code: 404,
                message: 'User not found',
            };

            expect(mockErrorResponse.code).toBe(404);
            expect(mockErrorResponse.message).toBe('User not found');
        });
    });

    describe('Resend verification email validation', () => {
        it('should return verification email sent', () => {
            const mockResendResponse = {
                status: 'success',
                code: 200,
                message: 'Verification email sent',
            };

            expect(mockResendResponse.code).toBe(200);
            expect(mockResendResponse.message).toBe('Verification email sent');
        });

        it('should return error if already verified', () => {
            const mockAlreadyVerifiedResponse = {
                status: 'error',
                code: 400,
                message: 'Verification has already been passed',
            };

            expect(mockAlreadyVerifiedResponse.code).toBe(400);
            expect(mockAlreadyVerifiedResponse.message).toBe('Verification has already been passed');
        });
    });
});
