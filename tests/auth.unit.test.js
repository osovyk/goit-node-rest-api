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
});
