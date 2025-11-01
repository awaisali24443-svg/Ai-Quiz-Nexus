import { SupabaseClient } from './supabase-client.js';

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
                const { error } = await SupabaseClient.signIn(email, password);

                if (error) {
                    throw error;
                }
                
                window.location.href = '/dashboard.html';

            } catch (error) {
                errorContainer.textContent = error.message || 'Login failed. Please check your credentials.';
                errorContainer.classList.remove('hidden');
            } finally {
                loadingOverlay.classList.add('hidden');
            }
        });
    }

    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            window.auth.saveGuestSession();
            window.location.href = '/dashboard.html';
        });
    }
});