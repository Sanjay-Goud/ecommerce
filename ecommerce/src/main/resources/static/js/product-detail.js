// Product Detail Page Logic
let currentProduct = null;
let selectedQuantity = 1;
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', () => {
    auth.updateUserDisplay();

    if (auth.isLoggedIn()) {
        updateCartBadge();
        updateWishlistBadge();
    }

    const productId = getUrlParameter('id');
    if (productId) {
        loadProduct(productId);
        loadReviews(productId);
    } else {
        window.location.href = 'products.html';
    }

    setupRatingInput();
    setupReviewForm();
});

const loadProduct = async (productId) => {
    const container = document.getElementById('productContainer');
    setLoading(container, true);

    try {
        currentProduct = await api.getProduct(productId);
        displayProduct();
        updateBreadcrumb();
    } catch (error) {
        console.error('Error loading product:', error);
        container.innerHTML = '<p class="text-center">Product not found</p>';
    }
};

const displayProduct = () => {
    const container = document.getElementById('productContainer');
    const imageUrl = currentProduct.imageUrl || 'https://via.placeholder.com/500x500?text=No+Image';
    const inStock = currentProduct.stock > 0;

    container.innerHTML = `
        <div class="product-detail">
            <div class="product-gallery">
                <div class="main-image">
                    <img src="${imageUrl}" alt="${currentProduct.name}"
                         onerror="this.src='https://via.placeholder.com/500x500?text=No+Image'">
                </div>
            </div>

            <div class="product-info-section">
                <h1 class="product-title">${currentProduct.name}</h1>

                <div class="product-meta">
                    <div class="product-rating-large">
                        <div class="rating-stars">${generateStars(currentProduct.averageRating)}</div>
                        <span class="rating-text">${currentProduct.averageRating.toFixed(1)}</span>
                        <span class="review-count">(${currentProduct.reviewCount} reviews)</span>
                    </div>
                </div>

                <div class="product-price-section">
                    <div class="product-price-large">${formatCurrency(currentProduct.price)}</div>
                    <div class="stock-status ${inStock ? 'in-stock' : 'out-of-stock'}">
                        <i class="fas ${inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${inStock ? `In Stock (${currentProduct.stock} available)` : 'Out of Stock'}
                    </div>
                </div>

                ${inStock ? `
                <div class="quantity-selector">
                    <label>Quantity:</label>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(-1)"><i class="fas fa-minus"></i></button>
                        <input type="number" id="quantityInput" value="1" min="1" max="${currentProduct.stock}"
                               onchange="validateQuantity()">
                        <button onclick="changeQuantity(1)"><i class="fas fa-plus"></i></button>
                    </div>
                </div>

                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addProductToCart()">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn btn-secondary" onclick="addProductToWishlist()">
                        <i class="fas fa-heart"></i> Add to Wishlist
                    </button>
                </div>
                ` : ''}

                <div class="product-description">
                    <h3>Description</h3>
                    <p>${currentProduct.description || 'No description available.'}</p>
                </div>

                <div class="product-specs">
                    <h3>Product Details</h3>
                    <div class="spec-list">
                        <div class="spec-item">
                            <span class="spec-label">Category</span>
                            <span class="spec-value">${currentProduct.category?.name || 'N/A'}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Stock</span>
                            <span class="spec-value">${currentProduct.stock} units</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Average Rating</span>
                            <span class="spec-value">${currentProduct.averageRating.toFixed(1)}/5.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const changeQuantity = (delta) => {
    const input = document.getElementById('quantityInput');
    let value = parseInt(input.value) + delta;
    if (value < 1) value = 1;
    if (value > currentProduct.stock) value = currentProduct.stock;
    input.value = value;
    selectedQuantity = value;
};

const validateQuantity = () => {
    const input = document.getElementById('quantityInput');
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > currentProduct.stock) value = currentProduct.stock;
    input.value = value;
    selectedQuantity = value;
};

const addProductToCart = async () => {
    if (!auth.requireAuth()) {
        openModal('loginModal');
        return;
    }
    validateQuantity();
    await addToCart(currentProduct.id, selectedQuantity);
};

const addProductToWishlist = async () => {
    if (!auth.requireAuth()) {
        openModal('loginModal');
        return;
    }
    await addToWishlist(currentProduct.id);
};

const updateBreadcrumb = () => {
    document.getElementById('breadcrumbCategory').textContent = currentProduct.category?.name || 'Category';
    document.getElementById('breadcrumbProduct').textContent = currentProduct.name;
};

// Reviews
const loadReviews = async (productId) => {
    const container = document.getElementById('reviewsContainer');
    setLoading(container, true);

    try {
        const reviews = await api.getProductReviews(productId);

        if (reviews.length === 0) {
            container.innerHTML = '<p class="text-center">No reviews yet. Be the first to review!</p>';
            return;
        }

        container.innerHTML = reviews.map(review => createReviewCard(review)).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = '<p class="text-center">Failed to load reviews</p>';
    }
};

const createReviewCard = (review) => {
    const initial = review.user.fullName.charAt(0).toUpperCase();
    const currentUser = auth.getCurrentUser();
    const isMyReview = currentUser && review.user.id === currentUser.userId;

    return `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${initial}</div>
                    <div class="reviewer-details">
                        <h4>${review.user.fullName}</h4>
                        <div class="review-date">${formatDate(review.createdAt)}</div>
                    </div>
                </div>
                <div class="review-rating">${generateStars(review.rating)}</div>
            </div>
            <p class="review-comment">${review.comment}</p>
            ${isMyReview ? `
                <div class="review-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editReview(${review.id}, ${review.rating}, '${review.comment.replace(/'/g, "\\'")}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteReview(${review.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            ` : ''}
        </div>
    `;
};

const setupRatingInput = () => {
    const ratingInput = document.getElementById('ratingInput');
    const stars = ratingInput.querySelectorAll('i');

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            document.getElementById('ratingValue').value = selectedRating;
            updateStarDisplay();
        });

        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });
    });

    ratingInput.addEventListener('mouseleave', () => {
        highlightStars(selectedRating);
    });
};

const highlightStars = (count) => {
    const stars = document.querySelectorAll('#ratingInput i');
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
};

const updateStarDisplay = () => {
    highlightStars(selectedRating);
};

const setupReviewForm = () => {
    const writeReviewBtn = document.getElementById('writeReviewBtn');
    const reviewForm = document.getElementById('reviewForm');

    writeReviewBtn.addEventListener('click', () => {
        if (!auth.requireAuth()) {
            openModal('loginModal');
            return;
        }
        document.getElementById('reviewModalTitle').textContent = 'Write a Review';
        document.getElementById('reviewId').value = '';
        document.getElementById('reviewComment').value = '';
        selectedRating = 0;
        highlightStars(0);
        openModal('reviewModal');
    });

    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (selectedRating === 0) {
            showToast('Please select a rating', 'warning');
            return;
        }

        const comment = document.getElementById('reviewComment').value;
        const reviewId = document.getElementById('reviewId').value;

        try {
            if (reviewId) {
                await api.updateReview(reviewId, selectedRating, comment);
                showToast('Review updated successfully', 'success');
            } else {
                await api.addReview(currentProduct.id, selectedRating, comment);
                showToast('Review added successfully', 'success');
            }

            closeModal('reviewModal');
            loadReviews(currentProduct.id);
            loadProduct(currentProduct.id); // Reload to update rating
        } catch (error) {
            showToast(error.message || 'Failed to submit review', 'error');
        }
    });
};

window.editReview = (reviewId, rating, comment) => {
    document.getElementById('reviewModalTitle').textContent = 'Edit Review';
    document.getElementById('reviewId').value = reviewId;
    document.getElementById('reviewComment').value = comment;
    selectedRating = rating;
    highlightStars(rating);
    openModal('reviewModal');
};

window.deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        await api.deleteReview(reviewId);
        showToast('Review deleted successfully', 'success');
        loadReviews(currentProduct.id);
        loadProduct(currentProduct.id);
    } catch (error) {
        showToast(error.message || 'Failed to delete review', 'error');
    }
};