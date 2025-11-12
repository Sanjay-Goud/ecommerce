// Products Page Logic
let currentFilters = {
    categoryId: null,
    sortBy: null,
    minPrice: null,
    maxPrice: null,
    search: null
};

document.addEventListener('DOMContentLoaded', async () => {
    auth.updateUserDisplay();

    if (auth.isLoggedIn()) {
        updateCartBadge();
        updateWishlistBadge();
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentFilters.categoryId = urlParams.get('category');
    currentFilters.search = urlParams.get('search');

    await loadCategories();
    await loadProducts();
    setupFilters();
    setupSearch();
});

const loadCategories = async () => {
    try {
        const categories = await api.getCategories();
        const container = document.getElementById('categoriesFilter');
        const mobileContainer = document.getElementById('mobileCategoriesFilter');

        const html = categories.map(cat => `
            <div class="filter-option">
                <input type="radio" name="category" value="${cat.id}"
                       id="cat-${cat.id}" ${currentFilters.categoryId == cat.id ? 'checked' : ''}>
                <label for="cat-${cat.id}">${cat.name}</label>
            </div>
        `).join('');

        if (container) container.innerHTML = html;
        if (mobileContainer) mobileContainer.innerHTML = html;

        // Add event listeners
        document.querySelectorAll('input[name="category"]').forEach(input => {
            input.addEventListener('change', (e) => {
                currentFilters.categoryId = e.target.value;
                loadProducts();
            });
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
};

const loadProducts = async () => {
    const container = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const pageTitle = document.getElementById('pageTitle');

    setLoading(container, true);

    try {
        let products;

        if (currentFilters.search) {
            products = await api.searchProducts(currentFilters.search);
            pageTitle.textContent = `Search Results for "${currentFilters.search}"`;
        } else {
            products = await api.getProducts(currentFilters);
        }

        resultsCount.textContent = `${products.length} products found`;

        if (products.length === 0) {
            setEmptyState(container, 'No products found', 'fa-search');
            return;
        }

        container.innerHTML = products.map(product => createProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p class="text-center">Failed to load products</p>';
    }
};

const setupFilters = () => {
    const sortSelect = document.getElementById('sortSelect');
    const applyPriceBtn = document.getElementById('applyPriceFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const mobileFilterBtn = document.getElementById('mobileFilterBtn');

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sortBy = e.target.value || null;
            loadProducts();
        });
    }

    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', () => {
            currentFilters.minPrice = document.getElementById('minPrice').value || null;
            currentFilters.maxPrice = document.getElementById('maxPrice').value || null;
            loadProducts();
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            currentFilters = { categoryId: null, sortBy: null, minPrice: null, maxPrice: null, search: null };
            document.querySelectorAll('input[name="category"]').forEach(input => input.checked = false);
            document.getElementById('minPrice').value = '';
            document.getElementById('maxPrice').value = '';
            document.getElementById('sortSelect').value = '';
            window.history.pushState({}, '', 'products.html');
            loadProducts();
        });
    }

    if (mobileFilterBtn) {
        mobileFilterBtn.addEventListener('click', () => {
            openModal('filtersModal');
        });
    }
};

window.applyMobileFilters = () => {
    currentFilters.minPrice = document.getElementById('mobileMinPrice').value || null;
    currentFilters.maxPrice = document.getElementById('mobileMaxPrice').value || null;

    const selectedCategory = document.querySelector('#mobileCategoriesFilter input[name="category"]:checked');
    currentFilters.categoryId = selectedCategory ? selectedCategory.value : null;

    loadProducts();
};

const createProductCard = (product) => {
    const imageUrl = product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image';
    const inStock = product.stock > 0;

    return `
        <div class="product-card">
            <div class="product-image" onclick="goToProduct(${product.id})">
                <img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
                <div class="product-actions">
                    <button class="icon-btn wishlist-btn" onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)">
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