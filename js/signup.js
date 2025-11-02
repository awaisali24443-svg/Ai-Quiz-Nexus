import { redirectIfLoggedIn } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    redirectIfLoggedIn();

    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '\u00A0'; // Clear previous error

        const username = signupForm.username.value;
        const password = signupForm.password.value;
        const submitButton = signupForm.querySelector('button[type="submit"]');

        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters long.';
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to login page with a success message (optional)
                window.location.href = '/login.html';
            } else {
                errorMessage.textContent = data.message || 'An unknown error occurred.';
            }
        } catch (error) {
            errorMessage.textContent = 'Could not connect to the server.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Sign Up';
        }
    });
});