
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const guestBtn = document.getElementById('guest-btn');
    const errorContainer = document.getElementById('login-error');
    const loadingOverlay = document.getElementById('loading-overlay');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorContainer.classList.add('hidden');
            loadingOverlay.classList.remove('hidden');

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed.');
                }
                
                window.auth.saveSession(data);
                window.location.href = '/dashboard.html';

            } catch (error) {
                errorContainer.textContent = error.message;
                errorContainer.classList.remove('hidden');
            } finally {
                loadingOverlay.classList.add('hidden');
            }
        });
    }

    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            window.auth.saveSession('guest');
            window.location.href = '/dashboard.html';
        });
    }
});
