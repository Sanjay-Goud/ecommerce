// Authentication Functions
const auth = {
    // Check if user is logged in
    isLoggedIn: () => !!storage.get(STORAGE_KEYS.TOKEN),

    // Get current user
    getCurrentUser: () => storage.get(STORAGE_KEYS.USER),

    // Login
    login: async (email, password) => {
        try {
            const response = await api.login(email, password);
            storage.set(STORAGE_KEYS.TOKEN, response.token);
            storage.set(STORAGE_KEYS.USER, response);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Signup
    signup: async (data) => {
        try {
            const response = await api.signup(data);
            showToast('Account created successfully! Please login.', 'success');
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Admin login
    adminLogin: async (email, password) => {
        try {
            const response = await api.adminLogin(email, password);
            storage.set(STORAGE_KEYS.TOKEN, response.token);
            storage.set(STORAGE_KEYS.USER, response);
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: () => {
        storage.clear();
        window.location.href = 'index.html';
    },

    // Update user display
    updateUserDisplay: () => {
        const user = auth.getCurrentUser();
        const userName = document.getElementById('userName');
        const userBtn = document.getElementById('userBtn');

        if (auth.isLoggedIn() && user) {
            if (userName) {
                userName.textContent = user.fullName.split(' ')[0];
            }
            if (userBtn) {
                userBtn.onclick = () => {
                    document.getElementById('userDropdown').classList.toggle('active');
                };
            }
        } else {
            if (userName) {
                userName.textContent = 'Login';
            }
            if (userBtn) {
                userBtn.onclick = () => openModal('loginModal');
            }
        }
    },

    // Require auth (redirect to login if not authenticated)
    requireAuth: () => {
        if (!auth.isLoggedIn()) {
            window.location.href = 'index.html';
            openModal('loginModal');
            return false;
        }
        return true;
    },

    // Check if user is admin
    isAdmin: () => {
        const user = auth.getCurrentUser();
        return user && user.role === 'ADMIN';
    }
};

// Login Form Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await auth.login(email, password);
            closeModal('loginModal');
            showToast('Login successful!', 'success');
            auth.updateUserDisplay();
            updateCartBadge();
            updateWishlistBadge();

            // Redirect based on role
            if (auth.isAdmin()) {
                window.location.href = 'admin/dashboard.html';
            } else {
                window.location.reload();
            }
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
        }
    });
}

// Signup Form Handler
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            fullName: document.getElementById('signupName').value,
            email: document.getElementById('signupEmail').value,
            phone: document.getElementById('signupPhone').value,
            password: document.getElementById('signupPassword').value
        };

        try {
            await auth.signup(data);
            closeModal('signupModal');
            openModal('loginModal');
        } catch (error) {
            showToast(error.message || 'Signup failed', 'error');
        }
    });
}

// Logout handlers
const logoutButtons = document.querySelectorAll('#logoutBtn, #mobileLogout');
logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            auth.logout();
        }
    });
});