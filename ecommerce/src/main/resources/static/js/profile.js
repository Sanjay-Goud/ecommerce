document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;
    auth.updateUserDisplay();
    updateCartBadge();
    updateWishlistBadge();
    loadProfile();
});

const loadProfile = async () => {
    try {
        const user = await api.getProfile();

        document.getElementById('profileName').textContent = user.fullName;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile', 'error');
    }
};

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value
    };

    try {
        await api.updateProfile(data);
        showToast('Profile updated successfully', 'success');

        // Update local user data
        const currentUser = auth.getCurrentUser();
        currentUser.fullName = data.fullName;
        storage.set(STORAGE_KEYS.USER, currentUser);
        auth.updateUserDisplay();
    } catch (error) {
        showToast(error.message || 'Failed to update profile', 'error');
    }
});