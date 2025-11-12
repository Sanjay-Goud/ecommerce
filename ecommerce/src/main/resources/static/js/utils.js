// Utility Functions

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Format date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Generate star rating HTML
const generateStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let html = '';

    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
        html += '<i class="far fa-star"></i>';
    }

    return html;
};

// Show toast notification
const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .toast-success { background: #10b981; }
        .toast-error { background: #ef4444; }
        .toast-info { background: #2563eb; }
        .toast-warning { background: #f59e0b; }
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;

    if (!document.querySelector('style[data-toast]')) {
        style.setAttribute('data-toast', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Modal functions
const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// Click outside modal to close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });
}

if (closeMobileMenu && mobileMenu) {
    closeMobileMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
}

// Update cart badge
const updateCartBadge = async () => {
    if (!auth.isLoggedIn()) {
        document.querySelectorAll('#cartBadge, #mobileCartBadge').forEach(badge => {
            badge.textContent = '0';
        });
        return;
    }

    try {
        const cart = await api.getCart();
        const count = cart.items ? cart.items.length : 0;
        document.querySelectorAll('#cartBadge, #mobileCartBadge').forEach(badge => {
            badge.textContent = count;
        });
        storage.set(STORAGE_KEYS.CART_COUNT, count);
    } catch (error) {
        console.error('Error updating cart badge:', error);
    }
};

// Update wishlist badge
const updateWishlistBadge = async () => {
    if (!auth.isLoggedIn()) {
        document.querySelectorAll('#wishlistBadge, #mobileWishlistBadge').forEach(badge => {
            badge.textContent = '0';
        });
        return;
    }

    try {
        const wishlist = await api.getWishlist();
        const count = wishlist ? wishlist.length : 0;
        document.querySelectorAll('#wishlistBadge, #mobileWishlistBadge').forEach(badge => {
            badge.textContent = count;
        });
        storage.set(STORAGE_KEYS.WISHLIST_COUNT, count);
    } catch (error) {
        console.error('Error updating wishlist badge:', error);
    }
};

// Add to cart
const addToCart = async (productId, quantity = 1) => {
    if (!auth.requireAuth()) {
        openModal('loginModal');
        return;
    }

    try {
        await api.addToCart(productId, quantity);
        showToast('Added to cart!', 'success');
        updateCartBadge();
    } catch (error) {
        showToast(error.message || 'Failed to add to cart', 'error');
    }
};

// Add to wishlist
const addToWishlist = async (productId, button) => {
    if (!auth.requireAuth()) {
        openModal('loginModal');
        return;
    }

    try {
        await api.addToWishlist(productId);
        showToast('Added to wishlist!', 'success');
        if (button) button.classList.add('active');
        updateWishlistBadge();
    } catch (error) {
        showToast(error.message || 'Failed to add to wishlist', 'error');
    }
};

// Remove from wishlist
const removeFromWishlist = async (productId, button) => {
    try {
        await api.removeFromWishlist(productId);
        showToast('Removed from wishlist', 'info');
        if (button) button.classList.remove('active');
        updateWishlistBadge();
    } catch (error) {
        showToast(error.message || 'Failed to remove from wishlist', 'error');
    }
};

// Navigate to product detail
const goToProduct = (productId) => {
    window.location.href = `product-detail.html?id=${productId}`;
};

// Get URL parameter
const getUrlParameter = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Loading state
const setLoading = (container, isLoading) => {
    if (isLoading) {
        container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    }
};

// Empty state
const setEmptyState = (container, message, icon = 'fa-box-open') => {
    container.innerHTML = `
        <div class="empty-state">
            <i class="fas ${icon}"></i>
            <h3>${message}</h3>
        </div>
    `;
};