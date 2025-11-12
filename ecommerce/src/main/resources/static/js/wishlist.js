// Wishlist Page Logic

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;

    auth.updateUserDisplay();
    updateCartBadge();
    loadWishlist();
});

const loadWishlist = async () => {
    const container = document.getElementById('wishlistContainer');
    const itemCount = document.getElementById('itemCount');

    setLoading(container, true);

    try {
        const wishlist = await api.getWishlist();

        if (!wishlist || wishlist.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart-broken"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Save your favorite products here</p>
                    <a href="products.html" class="btn btn-primary">Browse Products</a>
                </div>
            `;
            itemCount.textContent = '0';
            updateWishlistBadge();
            return;
        }

        itemCount.textContent = wishlist.length;

        container.innerHTML = wishlist.map(item => createWishlistCard(item)).join('');
        updateWishlistBadge();
    } catch (error) {
        console.error('Error loading wishlist:', error);
        showToast('Failed to load wishlist', 'error');
        container.innerHTML = '<p class="text-center">Failed to load wishlist</p>';
    }
};

const createWishlistCard = (item) => {
    const product = item.product;
    const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image';
    const inStock = product.stock > 0;

    return `
        <div class="product-card">
            <div class="product-image" onclick="goToProduct(${product.id})">
                <img src="${imageUrl}" alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                <div class="product-actions">
                    <button class="icon-btn active" onclick="event.stopPropagation(); removeFromWishlistPage(${product.id})"
                            title="Remove from Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category?.name || 'Uncategorized'}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <div class="stars">${generateStars(product.averageRating)}</div>
                    <span class="rating-count">(${product.reviewCount})</span>
                </div>
                <div class="product-price">${formatCurrency(product.price)}</div>
                <div class="product-footer">
                    <button class="btn btn-primary btn-sm"
                            onclick="moveToCart(${product.id})"
                            ${!inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="goToProduct(${product.id})">
                        View
                    </button>
                </div>
            </div>
        </div>
    `;
};

const removeFromWishlistPage = async (productId) => {
    if (!confirm('Remove this item from wishlist?')) return;

    try {
        await api.removeFromWishlist(productId);
        showToast('Removed from wishlist', 'success');
        loadWishlist();
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showToast(error.message || 'Failed to remove from wishlist', 'error');
    }
};

const moveToCart = async (productId) => {
    try {
        await api.moveToCart(productId);
        showToast('Moved to cart!', 'success');
        updateCartBadge();
        loadWishlist();
    } catch (error) {
        console.error('Error moving to cart:', error);
        showToast(error.message || 'Failed to move to cart', 'error');
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