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
            
            // Password strength is now handled by Supabase, but client-side check is good UX.
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                errorContainer.textContent = "Password must be at least 8 characters long and contain at least one letter and one number.";
                errorContainer.classList.remove('hidden');
                return;
            }

            loadingOverlay.classList.remove('hidden');

            try {
                // 1. Sign up the user with Supabase Auth
                const { data, error: signUpError } = await SupabaseClient.signUp(email, password);

                if (signUpError) {
                    throw signUpError;
                }

                if (!data.user) {
                     throw new Error('Registration failed. Please try again.');
                }
                
                // 2. Create a profile for the new user in the 'profiles' table
                const { error: profileError } = await SupabaseClient.createProfile(data.user, username);
                
                if (profileError) {
                    // This is a tricky state. User is created but profile failed.
                    // For a real app, you might want to handle this more gracefully.
                    console.error("User created but profile creation failed:", profileError);
                    throw new Error("Registration completed, but profile setup failed. Please contact support.");
                }

                // Automatically log the user in and redirect
                window.location.href = '/dashboard.html';

            } catch (error) {
                errorContainer.textContent = error.message || 'Registration failed.';
                errorContainer.classList.remove('hidden');
            } finally {
                loadingOverlay.classList.add('hidden');
            }
        });
    }
});