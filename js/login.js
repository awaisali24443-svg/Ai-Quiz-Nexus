import { redirectIfLoggedIn } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    redirectIfLoggedIn();

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '\u00A0'; // Clear previous error

        const username = loginForm.username.value;
        const password = loginForm.password.value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        submitButton.disabled = true;
        submitButton.textContent = 'Logging In...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                window.location.href = '/dashboard.html';
            } else {
                errorMessage.textContent = data.message || 'An unknown error occurred.';
            }
        } catch (error) {
            errorMessage.textContent = 'Could not connect to the server.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
});