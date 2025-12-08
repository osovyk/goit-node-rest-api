const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

export const verifyUserDirectly = async (email) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/verify-test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            return await response.json();
        }

        if (response.status === 403 || response.status === 404) {
            console.warn('Test endpoint not available. Please verify manually or run in development mode.');
            throw new Error('Test verification endpoint not available in production mode');
        }

        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Verification failed: ${errorData.message || response.statusText}`);
    } catch (error) {
        throw new Error(`Failed to verify user: ${error.message}`);
    }
};
