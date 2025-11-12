// cart.js
protectPage();

const API_URL = 'http://localhost:8080/api';
let currentCart = null;

// Load cart
async function loadCart() {
    try {
        const response = await fetchWithAuth(`${API_URL}/cart`);
        if (!response || !response.ok) {
            throw new Error('Failed to load cart');
        }

        currentCart = await response.json();
        displayCart();
    } catch (error) {
        console.error('Error loading cart:', error);
        document.getElementById('cartItems').innerHTML = '<p>Error loading cart</p>';
    }
}

// Display cart
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');

    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h2>Your cart is empty</h2>
                <p style="margin: 1rem 0;">Start shopping to add items to your cart</p>
                <a href="products.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
        cartSummary.style.display = 'none';
        return;
    }

    cartItemsContainer.innerHTML = currentCart.items.map(item => `
        <div class="cart-item">
            <img src="${item.product.imageUrl || 'https://via.placeholder.com/100'}" alt="${item.product.name}">
            <div class="cart-item-details">
                <h3>${item.product.name}</h3>
                <p class="cart-item-price">$${item.price}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="btn btn-danger" onclick="removeItem(${item.id})" style="margin-left: 1rem;">Remove</button>
                </div>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 1.25rem; font-weight: bold; color: var(--primary-color);">
                    $${(item.price * item.quantity).toFixed(2)}
                </p>
            </div>
        </div>
    `).join('');

    // Calculate totals
    const subtotal = parseFloat(currentCart.totalPrice);
    const tax = subtotal * 0.10;
    const shipping = 5.00;
    const total = subtotal + tax + shipping;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;

    cartSummary.style.display = 'block';
    updateCartCount();
}

// Update quantity
async function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        if (confirm('Remove this item from cart?')) {
            await removeItem(itemId);
        }
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/cart/update/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response && response.ok) {
            currentCart = await response.json();
            displayCart();
        } else {
            const error = await response.text();
            alert(error || 'Failed to update quantity');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity');
    }
}

// Remove item
async function removeItem(itemId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/cart/remove/${itemId}`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            currentCart = await response.json();
            displayCart();
        } else {
            alert('Failed to remove item');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item');
    }
}

// Clear cart
async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/cart/clear`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            loadCart();
        } else {
            alert('Failed to clear cart');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
        alert('Your cart is empty');
        return;
    }
    window.location.href = 'checkout.html';
}

// Initialize
loadCart();