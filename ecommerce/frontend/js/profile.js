// profile.js
protectPage();
const API_URL = 'http://localhost:8080/api';

async function loadProfile() {
    try {
        const response = await fetchWithAuth(`${API_URL}/users/profile`);
        if (!response || !response.ok) throw new Error('Failed to load profile');

        const user = await response.json();
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone || '';
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function updateProfile(event) {
    event.preventDefault();
    const data = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value
    };

    try {
        const response = await fetchWithAuth(`${API_URL}/users/profile`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        if (response && response.ok) {
            alert('Profile updated successfully!');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

async function loadAddresses() {
    try {
        const response = await fetchWithAuth(`${API_URL}/users/addresses`);
        if (!response || !response.ok) throw new Error('Failed to load addresses');

        const addresses = await response.json();
        const container = document.getElementById('addressesList');

        container.innerHTML = addresses.map(addr => `
            <div style="border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <strong>${addr.fullName}</strong><br>
                ${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.zipCode}<br>
                Phone: ${addr.phone}
            </div>
        `).join('') || '<p>No addresses saved</p>';
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

loadProfile();
loadAddresses();