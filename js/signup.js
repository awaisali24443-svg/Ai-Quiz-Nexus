document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const errorContainer = document.getElementById('signup-error');
    const loadingOverlay = document.getElementById('loading-overlay');
    const usernameInput = document.getElementById('signup-username');
    const usernameFeedback = document.getElementById('username-feedback');
    
    let debounceTimeout;

    const checkUsername = async (username) => {
        if (username.length < 3) {
            usernameFeedback.textContent = '';
            usernameFeedback.className = 'feedback-text';
            return;
        }

        try {
            const response = await fetch('/api/check-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const data = await response.json();

            if (data.isAvailable) {
                usernameFeedback.textContent = 'Username available!';
                usernameFeedback.className = 'feedback-text valid';
            } else {
                usernameFeedback.textContent = 'Username is already taken.';
                usernameFeedback.className = 'feedback-text invalid';
            }
        } catch (error) {
            usernameFeedback.textContent = 'Error checking username.';
            usernameFeedback.className = 'feedback-text invalid';
        }
    };
    
    if (usernameInput) {
        usernameInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            const username = e.target.value;
            debounceTimeout = setTimeout(() => {
                checkUsername(username);
            }, 500); // 500ms delay
        });
    }


    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorContainer.classList.add('hidden');

            const username = document.getElementById('signup-username').value;
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
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed.');
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
});