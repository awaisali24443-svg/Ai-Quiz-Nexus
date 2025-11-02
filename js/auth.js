
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
    if (!user) {
        // Redirect to login, but preserve the current path to redirect back after login
        // For simplicity, we just redirect to login page.
        window.location.href = '/login.html';
        return null;
    }
    // Update UI with username
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = user.username;
    }
    return user;
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