// checkout.js
protectPage();

const API_URL = 'http://localhost:8080/api';
let selectedAddressId = null;
let selectedPaymentMethod = null;
let currentCart = null;

// Load cart and addresses
async function loadCheckoutData() {
    await Promise.all([loadCart(), loadAddresses()]);
}

// Load cart
async function loadCart() {
    try {
        const response = await fetchWithAuth(`${API_URL}/cart`);
        if (!response || !response.ok) throw new Error('Failed to load cart');

        currentCart = await response.json();

        if (!currentCart.items || currentCart.items.length === 0) {
            alert('Your cart is empty');
            window.location.href = 'cart.html';
            return;
        }

        displayOrderSummary();
    } catch (error) {
        console.error('Error loading cart:', error);
        alert('Error loading cart');
    }
}

// Display order summary
function displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = currentCart.items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
            <span>${item.product.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    const subtotal = parseFloat(currentCart.totalPrice);
    const tax = subtotal * 0.10;
    const shipping = 5.00;
    const total = subtotal + tax + shipping;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Load addresses
async function loadAddresses() {
    try {
        const response = await fetchWithAuth(`${API_URL}/users/addresses`);
        if (!response || !response.ok) throw new Error('Failed to load addresses');

        const addresses = await response.json();
        displayAddresses(addresses);
    } catch (error) {
        console.error('Error loading addresses:', error);
        document.getElementById('addressList').innerHTML = '<p>Error loading addresses</p>';
    }
}

// Display addresses
function displayAddresses(addresses) {
    const addressList = document.getElementById('addressList');

    if (addresses.length === 0) {
        addressList.innerHTML = '<p>No saved addresses. Please add a delivery address.</p>';
        return;
    }

    addressList.innerHTML = addresses.map((addr, index) => `
        <div class="address-card ${index === 0 ? 'selected' : ''}" onclick="selectAddress(${addr.id})">
            <input type="radio" name="address" value="${addr.id}" ${index === 0 ? 'checked' : ''}>
            <strong>${addr.fullName}</strong><br>
            ${addr.addressLine1}, ${addr.addressLine2 ? addr.addressLine2 + ', ' : ''}
            ${addr.city}, ${addr.state} ${addr.zipCode}<br>
            Phone: ${addr.phone}
        </div>
    `).join('');

    // Select first address by default
    if (addresses.length > 0) {
        selectedAddressId = addresses[0].id;
    }
}

// Select address
function selectAddress(addressId) {
    selectedAddressId = addressId;
    document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
}

// Show/hide add address form
function showAddAddressForm() {
    document.getElementById('addAddressForm').style.display = 'block';
}

function hideAddAddressForm() {
    document.getElementById('addAddressForm').style.display = 'none';
}

// Add new address
async function addAddress(event) {
    event.preventDefault();

    const addressData = {
        fullName: document.getElementById('addressFullName').value,
        phone: document.getElementById('addressPhone').value,
        addressLine1: document.getElementById('addressLine1').value,
        addressLine2: document.getElementById('addressLine2').value,
        city: document.getElementById('addressCity').value,
        state: document.getElementById('addressState').value,
        zipCode: document.getElementById('addressZipCode').value,
        country: document.getElementById('addressCountry').value
    };

    try {
        const response = await fetchWithAuth(`${API_URL}/users/addresses`, {
            method: 'POST',
            body: JSON.stringify(addressData)
        });

        if (response && response.ok) {
            alert('Address added successfully!');
            hideAddAddressForm();
            loadAddresses();
            // Reset form
            event.target.reset();
        } else {
            alert('Failed to add address');
        }
    } catch (error) {
        console.error('Error adding address:', error);
        alert('Failed to add address');
    }
}

// Select payment method
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    document.querySelectorAll('.payment-method').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Show card details form for credit/debit card
    const cardDetailsForm = document.getElementById('cardDetailsForm');
    if (method === 'CREDIT_CARD' || method === 'DEBIT_CARD') {
        cardDetailsForm.style.display = 'block';
    } else {
        cardDetailsForm.style.display = 'none';
    }
}

// Place order
async function placeOrder() {
    if (!selectedAddressId) {
        alert('Please select a delivery address');
        return;
    }

    if (!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
    }

    // Validate card details if needed
    if ((selectedPaymentMethod === 'CREDIT_CARD' || selectedPaymentMethod === 'DEBIT_CARD')) {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        if (!cardNumber || !expiryDate || !cvv) {
            alert('Please fill in all card details');
            return;
        }
    }

    const orderData = {
        addressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod
    };

    try {
        const response = await fetchWithAuth(`${API_URL}/orders/checkout`, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        if (response && response.ok) {
            const order = await response.json();

            // Check payment status
            if (order.payment.status === 'SUCCESS') {
                alert(`Order placed successfully! Order ID: ${order.id}`);
                window.location.href = 'orders.html';
            } else {
                alert('Payment failed. Please try again with a different payment method.');
            }
        } else {
            const error = await response.text();
            alert(error || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order');
    }
}

// Auto-format card number
document.addEventListener('DOMContentLoaded', () => {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\//g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value;
        });
    }
});

// Initialize
loadCheckoutData();