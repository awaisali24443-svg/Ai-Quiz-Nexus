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

// A singleton promise to get the session data, which other parts of the app can use.
let sessionPromise = null;
function getSession(forceRefresh = false) {
    if (sessionPromise && !forceRefresh) {
        return sessionPromise;
    }
    sessionPromise = (async () => {
        const { data: { session: authSession } } = await SupabaseClient.supabase.auth.getSession();

        if (authSession) {
            const { data: profile } = await SupabaseClient.getProfile(authSession.user);
            const fullSession = {
                ...authSession,
                user: {
                    ...authSession.user,
                    username: profile?.username || authSession.user.email,
                    profile_picture_url: profile?.profile_picture_url
                }
            };
            return fullSession;
        }
        return getGuestSession();
    })();
    return sessionPromise;
}

async function logout() {
    await SupabaseClient.signOut();
    localStorage.removeItem(GUEST_SESSION_KEY);
    // The onAuthStateChange listener will handle the redirect.
}

// Centralized auth state change handler. This listener is the single source of truth for auth-based redirects.
// It's called once on script load and again whenever the auth state changes.
SupabaseClient.supabase.auth.onAuthStateChange((_event, session) => {
    const currentPath = window.location.pathname;
    
    // Invalidate the session promise cache on any auth change
    sessionPromise = null;

    const isUserLoggedIn = !!session;
    const isGuest = !!getGuestSession();
    const isLoggedIn = isUserLoggedIn || isGuest;

    if (isLoggedIn) {
        // If the user is on a public page (like login), redirect them to the dashboard.
        if (publicPaths.includes(currentPath)) {
            window.location.replace('/dashboard.html');
        }
    } else { // Not logged in as a user or guest
        // If the user is on a protected page, redirect them to the home page.
        if (protectedPaths.includes(currentPath)) {
            window.location.replace('/');
        }
    }
});


window.auth = {
    getSession,
    logout,
    saveGuestSession
};

// No explicit checkAuth() call is needed anymore.
// The onAuthStateChange listener is called on initialization and handles all routing cases.
