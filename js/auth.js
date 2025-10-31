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
            if (session.user === 'guest') {
                return session;
            }
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

    function saveSession(userObject) {
        if (userObject === 'guest') {
            const session = { user: 'guest' };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } else {
            const session = {
                user: userObject, // Store the full user object
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
            if (publicPaths.includes(currentPath)) {
                window.location.replace('/dashboard.html');
            }
        } else {
            if (protectedPaths.includes(currentPath)) {
                window.location.replace('/');
            }
        }
    }

    window.auth = {
        getSession,
        saveSession,
        logout,
    };
    
    checkAuth();
})();
