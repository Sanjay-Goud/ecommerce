document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;
    auth.updateUserDisplay();
    updateCartBadge();
    updateWishlistBadge();
    loadAddresses();
    setupAddressForm();
});

const loadAddresses = async () => {
    const container = document.getElementById('addressesContainer');
    setLoading(container, true);

    try {
        const addresses = await api.getAddresses();

        if (addresses.length === 0) {
            setEmptyState(container, 'No addresses saved', 'fa-map-marker-alt');
            return;
        }

        container.innerHTML = addresses.map(addr => `
            <div class="address-card">
                ${addr.isDefault ? '<span class="badge badge-success">Default</span>' : ''}
                <h4>${addr.fullName}</h4>
                <p>${addr.addressLine1}</p>
                ${addr.addressLine2 ? `<p>${addr.addressLine2}</p>` : ''}
                <p>${addr.city}, ${addr.state} - ${addr.zipCode}</p>
                <p>${addr.country}</p>
                <p><strong>Phone:</strong> ${addr.phone}</p>
                <div class="address-actions">
                    <button class="btn btn-sm btn-secondary" onclick='editAddress(${JSON.stringify(addr)})'>
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteAddress(${addr.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading addresses:', error);
        showToast('Failed to load addresses', 'error');
    }
};

const setupAddressForm = () => {
    document.getElementById('addressForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            fullName: document.getElementById('addrFullName').value,
            phone: document.getElementById('addrPhone').value,
            addressLine1: document.getElementById('addrLine1').value,
            addressLine2: document.getElementById('addrLine2').value,
            city: document.getElementById('addrCity').value,
            state: document.getElementById('addrState').value,
            zipCode: document.getElementById('addrZip').value,
            country: document.getElementById('addrCountry').value,
            isDefault: document.getElementById('addrDefault').checked
        };

        const addressId = document.getElementById('addressId').value;

        try {
            if (addressId) {
                await api.updateAddress(addressId, data);
                showToast('Address updated successfully', 'success');
            } else {
                await api.addAddress(data);
                showToast('Address added successfully', 'success');
            }

            closeModal('addressModal');
            loadAddresses();
        } catch (error) {
            showToast(error.message || 'Failed to save address', 'error');
        }
    });
};

window.openAddressModal = () => {
    document.getElementById('addressModalTitle').textContent = 'Add Address';
    document.getElementById('addressForm').reset();
    document.getElementById('addressId').value = '';
    openModal('addressModal');
};

window.editAddress = (address) => {
    document.getElementById('addressModalTitle').textContent = 'Edit Address';
    document.getElementById('addressId').value = address.id;
    document.getElementById('addrFullName').value = address.fullName;
    document.getElementById('addrPhone').value = address.phone;
    document.getElementById('addrLine1').value = address.addressLine1;
    document.getElementById('addrLine2').value = address.addressLine2 || '';
    document.getElementById('addrCity').value = address.city;
    document.getElementById('addrState').value = address.state;
    document.getElementById('addrZip').value = address.zipCode;
    document.getElementById('addrCountry').value = address.country;
    document.getElementById('addrDefault').checked = address.isDefault || false;
    openModal('addressModal');
};

window.deleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
        await api.deleteAddress(addressId);
        showToast('Address deleted successfully', 'success');
        loadAddresses();
    } catch (error) {
        showToast(error.message || 'Failed to delete address', 'error');
    }
};