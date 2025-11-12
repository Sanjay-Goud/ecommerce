// Cart Page Logic

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;

    auth.updateUserDisplay();
    updateWishlistBadge();
    loadCart();
    setupEventListeners();
});

let cartData = null;

const loadCart = async () => {
    const container = document.getElementById('cartItemsContainer');
    setLoading(container, true);

    try {
        cartData = await api.getCart();
        displayCart();
        updateCartBadge();
    } catch (error) {
        console.error('Error loading cart:', error);
        showToast('Failed to load cart', 'error');
        container.innerHTML = '<p class="text-center">Failed to load cart</p>';
    }
};

const displayCart = () => {
    const container = document.getElementById('cartItemsContainer');
    const itemCount = document.getElementById('itemCount');

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
                <a href="products.html" class="btn btn-primary">Shop Now</a>
            </div>
        `;
        itemCount.textContent = '0';
        updateSummary();
        return;
    }

    itemCount.textContent = cartData.items.length;

    container.innerHTML = cartData.items.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.product.imageUrl || 'https://via.placeholder.com/120x120?text=No+Image'}"
                     alt="${item.product.name}"
                     onerror="this.src='https://via.placeholder.com/120x120?text=No+Image'">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.product.name}</h3>
                <div class="cart-item-price">${formatCurrency(item.price)}</div>
                <div class="cart-item-stock ${item.product.stock <= 0 ? 'out-of-stock' : ''}">
                    ${item.product.stock > 0 ? `In Stock (${item.product.stock} available)` : 'Out of Stock'}
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})"
                            ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}"
                           onchange="updateQuantity(${item.id}, this.value)"
                           min="1" max="${item.product.stock}">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})"
                            ${item.quantity >= item.product.stock ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-total">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
                <button class="remove-btn" onclick="removeItem(${item.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');

    updateSummary();
};

const updateQuantity = async (itemId, quantity) => {
    quantity = parseInt(quantity);

    if (quantity < 1) {
        showToast('Quantity must be at least 1', 'warning');
        return;
    }

    try {
        cartData = await api.updateCartItem(itemId, quantity);
        displayCart();
        showToast('Quantity updated', 'success');
        updateCartBadge();
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast(error.message || 'Failed to update quantity', 'error');
        loadCart(); // Reload to show correct state
    }
};

const removeItem = async (itemId) => {
    if (!confirm('Remove this item from cart?')) return;

    try {
        cartData = await api.removeFromCart(itemId);
        displayCart();
        showToast('Item removed from cart', 'success');
        updateCartBadge();
    } catch (error) {
        console.error('Error removing item:', error);
        showToast(error.message || 'Failed to remove item', 'error');
    }
};

const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
        await api.clearCart();
        cartData = { items: [], totalPrice: 0 };
        displayCart();
        showToast('Cart cleared', 'success');
        updateCartBadge();
    } catch (error) {
        console.error('Error clearing cart:', error);
        showToast(error.message || 'Failed to clear cart', 'error');
    }
};

const updateSummary = () => {
    const subtotal = cartData?.totalPrice || 0;
    const tax = subtotal * 0.18; // 18% tax
    const shipping = 0; // Free shipping
    const total = subtotal + tax + shipping;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
    document.getElementById('total').textContent = formatCurrency(total);
};

const setupEventListeners = () => {
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (!cartData || !cartData.items || cartData.items.length === 0) {
                showToast('Your cart is empty', 'warning');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
};

// Search functionality
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        }
    });
}