// Main JavaScript for Home Page

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    auth.updateUserDisplay();

    if (auth.isLoggedIn()) {
        updateCartBadge();
        updateWishlistBadge();
    }

    await loadCategories();
    await loadFeaturedProducts();
    await loadTopRatedProducts();

    setupSearch();
    setupNavigation();
});

// Load categories
const loadCategories = async () => {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;

    setLoading(container, true);

    try {
        const categories = await api.getCategories();

        if (categories.length === 0) {
            setEmptyState(container, 'No categories available', 'fa-tags');
            return;
        }

        // Category icons mapping
        const categoryIcons = {
            'Electronics': 'fa-laptop',
            'Clothing': 'fa-tshirt',
            'Books': 'fa-book',
            'Home & Kitchen': 'fa-home',
            'Sports': 'fa-dumbbell',
            'Toys': 'fa-gamepad',
            'Beauty': 'fa-spa',
            'Automotive': 'fa-car'
        };

        container.innerHTML = categories.map(category => `
            <a href="products.html?category=${category.id}" class="category-card">
                <i class="fas ${categoryIcons[category.name] || 'fa-box'}"></i>
                <h3>${category.name}</h3>
                <p>${category.description || 'Explore products'}</p>
            </a>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
        container.innerHTML = '<p class="text-center">Failed to load categories</p>';
    }
};

// Load featured products
const loadFeaturedProducts = async () => {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    setLoading(container, true);

    try {
        const products = await api.getProducts({ sortBy: 'newest' });
        const featured = products.slice(0, 8);

        if (featured.length === 0) {
            setEmptyState(container, 'No products available', 'fa-box-open');
            return;
        }

        container.innerHTML = featured.map(product => createProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = '<p class="text-center">Failed to load products</p>';
    }
};

// Load top rated products
const loadTopRatedProducts = async () => {
    const container = document.getElementById('topRatedProducts');
    if (!container) return;

    setLoading(container, true);

    try {
        const products = await api.getProducts({ sortBy: 'rating' });
        const topRated = products.filter(p => p.averageRating > 0).slice(0, 8);

        if (topRated.length === 0) {
            setEmptyState(container, 'No rated products yet', 'fa-star');
            return;
        }

        container.innerHTML = topRated.map(product => createProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading top rated products:', error);
        container.innerHTML = '<p class="text-center">Failed to load products</p>';
    }
};

// Create product card HTML
const createProductCard = (product) => {
    const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image';
    const inStock = product.stock > 0;

    return `
        <div class="product-card">
            <div class="product-image" onclick="goToProduct(${product.id})">
                <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                <div class="product-actions">
                    <button class="icon-btn wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)" title="Add to Wishlist">
                        <i class="far fa-heart"></i>
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
                            onclick="addToCart(${product.id})"
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

// Toggle wishlist
const toggleWishlist = async (productId, button) => {
    if (!auth.requireAuth()) {
        openModal('loginModal');
        return;
    }

    if (button.classList.contains('active')) {
        await removeFromWishlist(productId, button);
    } else {
        await addToWishlist(productId, button);
    }
};

// Setup search functionality
const setupSearch = () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (!searchInput || !searchBtn) return;

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
};

// Setup navigation
const setupNavigation = () => {
    const navCart = document.getElementById('navCart');
    const navWishlist = document.getElementById('navWishlist');

    if (navCart) {
        navCart.addEventListener('click', (e) => {
            e.preventDefault();
            if (auth.requireAuth()) {
                window.location.href = 'cart.html';
            } else {
                openModal('loginModal');
            }
        });
    }

    if (navWishlist) {
        navWishlist.addEventListener('click', (e) => {
            e.preventDefault();
            if (auth.requireAuth()) {
                window.location.href = 'wishlist.html';
            } else {
                openModal('loginModal');
            }
        });
    }
};