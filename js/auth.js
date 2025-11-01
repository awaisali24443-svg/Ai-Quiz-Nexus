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
        console.log('Creating new guest session.');
        const randomId = Math.random().toString(36).substring(2, 8);
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

let sessionPromise = null;
function getSession(forceRefresh = false) {
    if (sessionPromise && !forceRefresh) {
        return sessionPromise;
    }
    sessionPromise = (async () => {
        // If Supabase connection failed, immediately return a guest session.
        if (localStorage.getItem('db_error') === 'true') {
            console.log("DB connection error detected, forcing local guest mode.");
            return getGuestSession() || saveGuestSession();
        }

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
                    username: profile?.username || authSession.user.user_metadata?.username || authSession.user.email,
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
    // onAuthStateChange listener will handle the redirect by reloading.
}

const performAuthCheck = async () => {
    try {
        const isDbError = localStorage.getItem('db_error') === 'true';
        let session;

        if (isDbError) {
            session = null; // In case of DB error, we don't have a real session
        } else {
            const { data } = await SupabaseClient.supabase.auth.getSession();
            session = data.session;
        }

        const guestSession = getGuestSession();
        const currentPath = window.location.pathname;

        const isUserLoggedIn = !!session;
        const isGuest = !!guestSession || isDbError;
        const isLoggedIn = isUserLoggedIn || isGuest;

        console.log(`Auth Check on ${currentPath}: UserLoggedIn=${isUserLoggedIn}, isGuest=${isGuest}, DBError=${isDbError}`);

        if (isLoggedIn && publicPaths.includes(currentPath)) {
            console.log('Redirecting logged-in user to dashboard...');
            window.location.replace('/dashboard.html');
        } else if (!isLoggedIn && protectedPaths.includes(currentPath)) {
            console.log('Redirecting non-logged-in user to login...');
            window.location.replace('/');
        }
    } catch (error) {
        console.error("Auth check failed:", error);
        const currentPath = window.location.pathname;
        if (protectedPaths.includes(currentPath)) {
            window.location.replace('/');
        }
    }
};

SupabaseClient.supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Auth state changed: ${event}`);
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        // Force a session refresh and re-run the auth check for redirection.
        getSession(true).then(() => {
            performAuthCheck();
        });
    }
});

// Run the check once on initial page load.
performAuthCheck();

window.auth = {
    getSession,
    logout,
    saveGuestSession
};