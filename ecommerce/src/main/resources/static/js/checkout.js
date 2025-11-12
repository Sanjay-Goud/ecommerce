let cartData = null;
let addresses = [];
let selectedAddressId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.requireAuth()) return;

    await loadCart();
    await loadAddresses();
    setupCheckout();
});

const loadCart = async () => {
    try {
        cartData = await api.getCart();
        displayOrderItems();
        updateOrderSummary();
    } catch (error) {
        console.error('Error loading cart:', error);
        showToast('Failed to load cart', 'error');
    }
};

const loadAddresses = async () => {
    const container = document.getElementById('addressesContainer');
    try {
        addresses = await api.getAddresses();

        if (addresses.length === 0) {
            container.innerHTML = '<p>No addresses found. Please add a delivery address.</p>';
            return;
        }

        container.innerHTML = addresses.map(addr => `
            <label class="address-card">
                <input type="radio" name="address" value="${addr.id}"
                       ${addr.isDefault ? 'checked' : ''}>
                <div class="address-content">
                    <h4>${addr.fullName}</h4>
                    <p>${addr.addressLine1}, ${addr.addressLine2 || ''}</p>
                    <p>${addr.city}, ${addr.state} - ${addr.zipCode}</p>
                    <p>Phone: ${addr.phone}</p>
                </div>
            </label>
        `).join('');

        const defaultAddress = addresses.find(a => a.isDefault);
        selectedAddressId = defaultAddress ? defaultAddress.id : addresses[0].id;
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
};

const displayOrderItems = () => {
    const container = document.getElementById('orderItems');
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        container.innerHTML = '<p>No items in cart</p>';
        return;
    }

    container.innerHTML = cartData.items.map(item => `
        <div class="order-item">
            <img src="${item.product.imageUrl || 'https://via.placeholder.com/60x60'}" alt="${item.product.name}">
            <div class="item-details">
                <div class="item-name">${item.product.name}</div>
                <div class="item-qty">Qty: ${item.quantity}</div>
            </div>
            <div class="item-price">${formatCurrency(item.price * item.quantity)}</div>
        </div>
    `).join('');
};

const updateOrderSummary = () => {
    const subtotal = cartData?.totalPrice || 0;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('total').textContent = formatCurrency(total);
};

const setupCheckout = () => {
    document.getElementById('placeOrderBtn').addEventListener('click', async () => {
        const selectedAddress = document.querySelector('input[name="address"]:checked');
        const selectedPayment = document.querySelector('input[name="payment"]:checked');

        if (!selectedAddress) {
            showToast('Please select a delivery address', 'warning');
            return;
        }

        if (!selectedPayment) {
            showToast('Please select a payment method', 'warning');
            return;
        }

        try {
            const order = await api.checkout(selectedAddress.value, selectedPayment.value);
            showToast('Order placed successfully!', 'success');
            setTimeout(() => {
                window.location.href = `order-success.html?orderId=${order.id}`;
            }, 1500);
        } catch (error) {
            showToast(error.message || 'Failed to place order', 'error');
        }
    });
};