// products.js
const API_URL = 'http://localhost:8080/api';

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();

        const select = document.getElementById('categoryFilter');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load products
async function loadProducts(params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_URL}/products${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url);
        const products = await response.json();

        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products</p>';
    }
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('productsGrid');

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No products found</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imageUrl || 'https://via.placeholder.com/250'}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-rating">
                    ${'⭐'.repeat(Math.round(product.averageRating))}
                    <span>(${product.reviewCount || 0})</span>
                </div>
                <p class="product-price">$${product.price}</p>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="product-detail.html?id=${product.id}" class="btn btn-secondary" style="flex: 1; text-align: center;">View</a>
                    ${isLoggedIn() ? `
                        <button class="btn btn-primary" onclick="addToCart(${product.id})" style="flex: 1;">Add to Cart</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Apply filters
function applyFilters() {
    const params = {};

    const categoryId = document.getElementById('categoryFilter').value;
    if (categoryId) params.categoryId = categoryId;

    const sortBy = document.getElementById('sortFilter').value;
    if (sortBy) params.sortBy = sortBy;

    const minPrice = document.getElementById('minPrice').value;
    if (minPrice) params.minPrice = minPrice;

    const maxPrice = document.getElementById('maxPrice').value;
    if (maxPrice) params.maxPrice = maxPrice;

    loadProducts(params);
}

// Clear filters
function clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('searchInput').value = '';
    loadProducts();
}

// Search products
let searchTimeout;
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = e.target.value.trim();
                if (query) {
                    try {
                        const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`);
                        const products = await response.json();
                        displayProducts(products);
                    } catch (error) {
                        console.error('Error searching products:', error);
                    }
                } else {
                    loadProducts();
                }
            }, 500);
        });
    }
});

// Add to cart
async function addToCart(productId) {
    if (!isLoggedIn()) {
        alert('Please login to add items to cart');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/cart/add`, {
            method: 'POST',
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (response && response.ok) {
            alert('Product added to cart!');
            updateCartCount();
        } else {
            const error = await response.text();
            alert(error || 'Failed to add product to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart');
    }
}

// Add to wishlist
async function addToWishlist(productId) {
    if (!isLoggedIn()) {
        alert('Please login to add items to wishlist');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/wishlist/add/${productId}`, {
            method: 'POST'
        });

        if (response && response.ok) {
            alert('Product added to wishlist!');
        } else {
            const error = await response.text();
            alert(error || 'Failed to add product to wishlist');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        alert('Failed to add product to wishlist');
    }
}

// Initialize
loadCategories();
loadProducts();