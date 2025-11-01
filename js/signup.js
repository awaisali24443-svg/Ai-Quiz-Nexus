import { SupabaseClient } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const errorContainer = document.getElementById('signup-error');
    const loadingOverlay = document.getElementById('loading-overlay');
    const usernameInput = document.getElementById('signup-username');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorContainer.classList.add('hidden');

            const username = usernameInput.value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;

            if (password !== confirmPassword) {
                errorContainer.textContent = "Passwords do not match.";
                errorContainer.classList.remove('hidden');
                return;
            }
            
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                errorContainer.textContent = "Password must be at least 8 characters long and contain at least one letter and one number.";
                errorContainer.classList.remove('hidden');
                return;
            }

            loadingOverlay.classList.remove('hidden');

            try {
                // 1. Sign up the user, passing username as metadata
                const { data, error: signUpError } = await SupabaseClient.signUp(email, password, username);

                if (signUpError) {
                    throw signUpError;
                }

                if (!data.user) {
                     throw new Error('Registration failed. Please try again.');
                }
                
                // 2. Profile creation is now handled on first login (in dashboard.js)

                // Instead of redirecting, show a success message to check email
                loadingOverlay.classList.add('hidden');
                document.getElementById('signup-form').classList.add('hidden');
                document.getElementById('signup-error').classList.add('hidden');
                document.getElementById('auth-switch-p').classList.add('hidden');
                document.getElementById('signup-success').classList.remove('hidden');

            } catch (error) {
                errorContainer.textContent = error.message || 'Registration failed.';
                errorContainer.classList.remove('hidden');
                loadingOverlay.classList.add('hidden');
            }
        });
    }
});