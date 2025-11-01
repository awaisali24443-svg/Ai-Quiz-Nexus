import { SupabaseClient } from './supabase-client.js';

const GUEST_SESSION_KEY = 'aiQuizNexusGuestSession';
const protectedPaths = ['/dashboard.html'];
const publicPaths = ['/login.html', '/signup.html', '/index.html', '/'];

/**
 * Saves a guest session to localStorage.
 * The session object is structured to mimic a Supabase session for compatibility.
 * @returns {object|null} The created guest session object or null on failure.
 */
function saveGuestSession() {
    try {
        const randomId = Math.random().toString(36).substring(2, 8);
        // Create a session object that mimics the structure of a Supabase session.
        // This ensures compatibility with the rest of the app (e.g., dashboard.js).
        const guestSession = {
            user: {
                id: `guest-${randomId}`,
                email: `guest@knowledgetester.com`,
                username: `Guest-${randomId}`,
                guest: true,
            },
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24-hour guest session
        };
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guestSession));
        return guestSession;
    } catch (e) {
        console.error("Failed to save guest session to localStorage. Guest mode may not work.", e);
        return null;
    }
}

/**
 * Retrieves the guest session from localStorage if it exists and is not expired.
 * @returns {object|null} The guest session object or null.
 */
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
        console.error("Failed to retrieve guest session.", e);
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
        const { data: { session: authSession }, error } = await SupabaseClient.supabase.auth.getSession();

        if (error) {
            console.error("Error getting session, falling back to guest mode check.", error);
            return getGuestSession();
        }

        if (authSession) {
            const { data: profile } = await SupabaseClient.getProfile(authSession.user);
            const fullSession = {
                ...authSession,
                user: {
                    ...authSession.user,
                    // Use profile username if available, otherwise fallback to metadata or email
                    username: profile?.username || authSession.user.user_metadata?.username || authSession.user.email,
                    profile_picture_url: profile?.profile_picture_url
                }
            };
            return fullSession;
        }
        // For guests, getGuestSession returns an object with a 'user' property
        return getGuestSession();
    })();
    return sessionPromise;
}

async function logout() {
    await SupabaseClient.signOut();
    localStorage.removeItem(GUEST_SESSION_KEY);
    // The onAuthStateChange listener will handle the redirect by reloading.
}

/**
 * Performs the main authentication check and handles page redirection.
 * This function is the single source of truth for routing decisions on page load.
 */
const performAuthCheck = async () => {
    try {
        const { data: { session } } = await SupabaseClient.supabase.auth.getSession();
        const guestSession = getGuestSession();

        const currentPath = window.location.pathname;
        const isUserLoggedIn = !!session;
        const isGuest = !!guestSession;
        const isLoggedIn = isUserLoggedIn || isGuest;

        // Core redirection logic
        if (isLoggedIn && publicPaths.includes(currentPath)) {
            window.location.replace('/dashboard.html');
        } else if (!isLoggedIn && protectedPaths.includes(currentPath)) {
            window.location.replace('/');
        }
    } catch (error) {
        console.error("Auth check failed, possibly due to network or Supabase issue.", error);
        // As requested, fallback to guest mode if Supabase is unreachable.
        const offlineBanner = document.getElementById('offline-banner');
        if (offlineBanner) {
            offlineBanner.innerHTML = '<p>Unable to reach database. Continuing in offline/guest mode.</p>';
            offlineBanner.classList.remove('hidden');
        }
        
        const guestSession = getGuestSession() || saveGuestSession(); // Ensure guest session exists
        const currentPath = window.location.pathname;

        if (guestSession && publicPaths.includes(currentPath)) {
            window.location.replace('/dashboard.html');
        }
    }
};

// Listen for explicit auth state changes (login, logout) from Supabase.
SupabaseClient.supabase.auth.onAuthStateChange((event, session) => {
    // On SIGNED_IN or SIGNED_OUT, we know the state has definitively changed.
    // Re-run the auth check to handle redirection.
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        // A full redirect is more reliable than trying to manage state in-place.
        performAuthCheck();
    }
});

// Run the check once on initial page load to handle all cases.
performAuthCheck();

// Expose public auth methods to the window object for other scripts.
window.auth = {
    getSession,
    logout,
    saveGuestSession
};
