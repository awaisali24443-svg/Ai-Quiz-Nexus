
(function() {
    'use strict';

    const SESSION_KEY = 'aiQuizNexusSession';
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    const protectedPaths = ['/dashboard.html'];
    const publicPaths = ['/login.html', '/signup.html', '/index.html', '/'];

    function getSession() {
        const sessionJSON = localStorage.getItem(SESSION_KEY);
        if (!sessionJSON) return null;

        try {
            const session = JSON.parse(sessionJSON);
            // Check for guest session, which doesn't expire
            if (session.user === 'guest') {
                return session;
            }
            // Check for timeout
            if (Date.now() > session.expires) {
                clearSession();
                return null;
            }
            return session;
        } catch (e) {
            clearSession();
            return null;
        }
    }

    function saveSession(userData) {
        if (userData === 'guest') {
            const session = { user: 'guest' };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } else {
            const session = {
                user: {
                    username: userData.username,
                    email: userData.email,
                },
                expires: Date.now() + SESSION_TIMEOUT_MS,
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
    }
    
    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    function logout() {
        clearSession();
        window.location.href = '/';
    }

    function checkAuth() {
        const session = getSession();
        const currentPath = window.location.pathname;

        if (session) {
            // User is logged in
            if (publicPaths.includes(currentPath)) {
                window.location.replace('/dashboard.html');
            }
        } else {
            // User is not logged in
            if (protectedPaths.includes(currentPath)) {
                window.location.replace('/');
            }
        }
    }

    // Expose functions to the global scope to be used by other scripts
    window.auth = {
        getSession,
        saveSession,
        logout,
    };
    
    // Run the check as soon as the script loads
    checkAuth();
})();
