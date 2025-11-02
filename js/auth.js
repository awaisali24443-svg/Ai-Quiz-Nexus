

export function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    try {
        return user ? JSON.parse(user) : null;
    } catch (e) {
        console.error("Error parsing user from localStorage", e);
        return null;
    }
}

export function checkAuth() {
    const user = getCurrentUser();
    if (user) {
        return { ...user, isGuest: false };
    }
    // If no user, create a guest user object
    return {
        id: 'guest',
        username: 'Guest',
        isGuest: true
    };
}


export function redirectIfLoggedIn() {
    if (getCurrentUser()) {
        window.location.href = '/dashboard.html';
    }
}

export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
}

export function login(user) {
    // Clear any guest progress before logging in a real user
    localStorage.removeItem('aiQuizProgress_guest');
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = '/dashboard.html';
}