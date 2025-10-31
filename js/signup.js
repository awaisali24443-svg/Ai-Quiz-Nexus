document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    function applyInitialTheme() {
        if (!themeToggleButton) return;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggleButton.innerHTML = moonIcon;
        } else {
            document.body.classList.remove('light-mode');
            themeToggleButton.innerHTML = sunIcon;
        }
    }

    function toggleTheme() {
        if (document.body.classList.contains('light-mode')) {
            document.body.classList.remove('light-mode');
            themeToggleButton.innerHTML = sunIcon;
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light-mode');
            themeToggleButton.innerHTML = moonIcon;
            localStorage.setItem('theme', 'light');
        }
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
    applyInitialTheme();

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