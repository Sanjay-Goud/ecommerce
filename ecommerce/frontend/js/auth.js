// auth.js
const API_URL = 'http://localhost:8080/api';

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get user data
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Get authorization header
function getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Update navigation based on login status
function updateNavigation() {
    const loggedInNav = document.getElementById('navUserLogged');
    const loggedOutNav = document.getElementById('navUser');

    if (isLoggedIn()) {
        if (loggedInNav) loggedInNav.style.display = 'flex';
        if (loggedOutNav) loggedOutNav.style.display = 'none';

        // Add logout handler
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    } else {
        if (loggedInNav) loggedInNav.style.display = 'none';
        if (loggedOutNav) loggedOutNav.style.display = 'flex';
    }
}

// Protect page (redirect to login if not authenticated)
function protectPage() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Check if user is admin
function isAdmin() {
    const user = getUser();
    return user && user.role === 'ADMIN';
}

// Protect admin page
function protectAdminPage() {
    if (!isLoggedIn() || !isAdmin()) {
        alert('Access denied. Admin only.');
        window.location.href = 'index.html';
    }
}

// Fetch with auth
async function fetchWithAuth(url, options = {}) {
    const headers = getAuthHeader();
    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });

    if (response.status === 401) {
        logout();
        return null;
    }

    return response;
}

// Initialize navigation on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    updateCartCount();
});

// Update cart count
async function updateCartCount() {
    if (!isLoggedIn()) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/cart`);
        if (response && response.ok) {
            const cart = await response.json();
            const count = cart.items ? cart.items.length : 0;
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = count;
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}