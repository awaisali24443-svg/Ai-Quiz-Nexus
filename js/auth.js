import { SupabaseClient } from './supabase-client.js';

const GUEST_SESSION_KEY = 'aiQuizNexusGuestSession';
const protectedPaths = ['/dashboard.html'];
const publicPaths = ['/login.html', '/signup.html', '/index.html', '/'];

function saveGuestSession() {
    try {
        const guestSession = { user: 'guest', expires: Date.now() + 30 * 60 * 1000 };
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guestSession));
        return guestSession;
    } catch (e) {
        console.error("Failed to save guest session to localStorage", e);
        return null;
    }
}

function getGuestSession() {
    try {
        const sessionJSON = localStorage.getItem(GUEST_SESSION_KEY);
        if (!sessionJSON) return null;
        const session = JSON.parse(sessionJSON);
        if (Date.now() > session.expires) {
            localStorage.removeItem(GUEST_SESSION_KEY);
            return null;
        }
        return session;
    } catch (e) {
        localStorage.removeItem(GUEST_SESSION_KEY);
        return null;
    }
}

// A singleton promise to ensure the session is checked only once per page load.
let sessionPromise = null;
function getSession() {
    if (!sessionPromise) {
        sessionPromise = new Promise((resolve) => {
            // onAuthStateChange fires immediately with the current session,
            // which is perfect for resolving the auth status on page load.
            const { data: { subscription } } = SupabaseClient.supabase.auth.onAuthStateChange(async (_event, session) => {
                subscription.unsubscribe(); // We only need the initial state, not subsequent changes.
                if (session) {
                    // If there's a real Supabase session, fetch the user's profile
                    const profile = await SupabaseClient.getProfile(session.user);
                    const fullSession = {
                        ...session,
                        user: { ...session.user, ...(profile.data || {}) }
                    };
                    resolve(fullSession);
                } else {
                    // If no Supabase session, fall back to checking for a guest session
                    resolve(getGuestSession());
                }
            });
        });
    }
    return sessionPromise;
}

async function logout() {
    const { error } = await SupabaseClient.signOut();
    localStorage.removeItem(GUEST_SESSION_KEY);
    if (error) {
        console.error('Logout failed:', error.message);
    }
    window.location.replace('/');
}

async function checkAuth() {
    // getSession() will now wait until the auth state is confirmed.
    const session = await getSession();
    const currentPath = window.location.pathname;
    
    // To prevent content flicker on load
    document.body.style.visibility = 'hidden';

    if (session) {
        // User is logged in (or is a guest)
        if (publicPaths.includes(currentPath)) {
            // If on a public page (like login), redirect to dashboard
            window.location.replace('/dashboard.html');
        } else {
            // Otherwise, show the protected page content
             document.body.style.visibility = 'visible';
        }
    } else {
        // User is not logged in
        if (protectedPaths.includes(currentPath)) {
            // If on a protected page, redirect to home/login
            window.location.replace('/');
        } else {
            // Otherwise, show the public page content
            document.body.style.visibility = 'visible';
        }
    }
}

window.auth = {
    getSession,
    logout,
    saveGuestSession
};

// Run the authentication check when the script loads.
checkAuth();
