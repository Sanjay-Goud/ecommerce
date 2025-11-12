// wishlist.js
protectPage();
const API_URL = 'http://localhost:8080/api';

async function loadWishlist() {
    try {
        const response = await fetchWithAuth(`${API_URL}/wishlist`);
        if (!response || !response.ok) throw new Error('Failed to load wishlist');

        const wishlist = await response.json();
        displayWishlist(wishlist);
    } catch (error) {
        console.error('Error loading wishlist:', error);
        document.getElementById('wishlistGrid').innerHTML = '<p>Error loading wishlist</p>';
    }
}

function displayWishlist(wishlist) {
    const container = document.getElementById('wishlistGrid');

    if (wishlist.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 3rem; grid-column: 1/-1;"><h2>Your wishlist is empty</h2><a href="products.html" class="btn btn-primary">Browse Products</a></div>';
        return;
    }

    container.innerHTML = wishlist.map(item => `
        <div class="product-card">
            <img src="${item.product.imageUrl || 'https://via.placeholder.com/250'}" alt="${item.product.name}">
            <div class="product-info">
                <h3>${item.product.name}</h3>
                <p class="product-price">$${item.product.price}</p>
                <button class="btn btn-primary btn-block" onclick="moveToCart(${item.product.id})">Move to Cart</button>
                <button class="btn btn-danger btn-block" onclick="removeFromWishlist(${item.product.id})" style="margin-top: 0.5rem;">Remove</button>
            </div>
        </div>
    `).join('');
}

async function moveToCart(productId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/wishlist/move-to-cart/${productId}`, { method: 'POST' });
        if (response && response.ok) {
            alert('Moved to cart!');
            loadWishlist();
            updateCartCount();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function removeFromWishlist(productId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/wishlist/remove/${productId}`, { method: 'DELETE' });
        if (response && response.ok) {
            loadWishlist();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

loadWishlist();