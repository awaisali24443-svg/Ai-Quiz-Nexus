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

async function getSession() {
    // Prioritize real user session over guest session
    const { data: { session: supabaseSession } } = await SupabaseClient.getSession();
    if (supabaseSession) {
        // Fetch profile to combine with auth user data
        const profile = await SupabaseClient.getProfile(supabaseSession.user);
        return {
            ...supabaseSession,
            user: { ...supabaseSession.user, ...profile.data }
        };
    }
    
    // Fallback to guest session
    return getGuestSession();
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
    const session = await getSession();
    const currentPath = window.location.pathname;
    
    // To prevent content flicker on load
    document.body.style.visibility = 'hidden';

    if (session) {
        // User is logged in (or is a guest)
        if (publicPaths.includes(currentPath)) {
            // If on a public page, redirect to dashboard
            window.location.replace('/dashboard.html');
        } else {
             document.body.style.visibility = 'visible';
        }
    } else {
        // User is not logged in
        if (protectedPaths.includes(currentPath)) {
            // If on a protected page, redirect to home/login
            window.location.replace('/');
        } else {
            document.body.style.visibility = 'visible';
        }
    }
}

window.auth = {
    getSession,
    logout,
    saveGuestSession
};

checkAuth();