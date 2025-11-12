// API Helper Functions
const api = {
    // Get auth token
    getToken: () => storage.get(STORAGE_KEYS.TOKEN),

    // Make API request
    request: async (endpoint, options = {}) => {
        const token = api.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token && !endpoint.includes('/auth/')) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Unauthorized - redirect to login
                    auth.logout();
                    window.location.href = 'index.html';
                }
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // GET request
    get: (endpoint) => api.request(endpoint, { method: 'GET' }),

    // POST request
    post: (endpoint, data) => api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // PUT request
    put: (endpoint, data) => api.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // DELETE request
    delete: (endpoint) => api.request(endpoint, { method: 'DELETE' }),

    // Auth APIs
    login: (email, password) => api.post(API_ENDPOINTS.LOGIN, { email, password }),
    signup: (data) => api.post(API_ENDPOINTS.SIGNUP, data),
    adminLogin: (email, password) => api.post(API_ENDPOINTS.ADMIN_LOGIN, { email, password }),

    // Product APIs
    getProducts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`${API_ENDPOINTS.PRODUCTS}${query ? '?' + query : ''}`);
    },
    getProduct: (id) => api.get(API_ENDPOINTS.PRODUCT_DETAIL(id)),
    searchProducts: (query) => api.get(`${API_ENDPOINTS.PRODUCT_SEARCH}?q=${query}`),
    getProductsByCategory: (categoryId) => api.get(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(categoryId)),

    // Category APIs
    getCategories: () => api.get(API_ENDPOINTS.CATEGORIES),

    // Cart APIs
    getCart: () => api.get(API_ENDPOINTS.CART),
    addToCart: (productId, quantity) => api.post(API_ENDPOINTS.CART_ADD, { productId, quantity }),
    updateCartItem: (itemId, quantity) => api.put(API_ENDPOINTS.CART_UPDATE(itemId), { quantity }),
    removeFromCart: (itemId) => api.delete(API_ENDPOINTS.CART_REMOVE(itemId)),
    clearCart: () => api.delete(API_ENDPOINTS.CART_CLEAR),

    // Wishlist APIs
    getWishlist: () => api.get(API_ENDPOINTS.WISHLIST),
    addToWishlist: (productId) => api.post(API_ENDPOINTS.WISHLIST_ADD(productId)),
    removeFromWishlist: (productId) => api.delete(API_ENDPOINTS.WISHLIST_REMOVE(productId)),
    moveToCart: (productId) => api.post(API_ENDPOINTS.WISHLIST_MOVE_TO_CART(productId)),

    // Order APIs
    getOrders: () => api.get(API_ENDPOINTS.ORDERS),
    getOrder: (id) => api.get(API_ENDPOINTS.ORDER_DETAIL(id)),
    checkout: (addressId, paymentMethod) => api.post(API_ENDPOINTS.CHECKOUT, { addressId, paymentMethod }),

    // User APIs
    getProfile: () => api.get(API_ENDPOINTS.PROFILE),
    updateProfile: (data) => api.put(API_ENDPOINTS.PROFILE, data),
    getAddresses: () => api.get(API_ENDPOINTS.ADDRESSES),
    addAddress: (data) => api.post(API_ENDPOINTS.ADDRESSES, data),
    updateAddress: (id, data) => api.put(API_ENDPOINTS.ADDRESS_DETAIL(id), data),
    deleteAddress: (id) => api.delete(API_ENDPOINTS.ADDRESS_DETAIL(id)),

    // Review APIs
    getProductReviews: (productId) => api.get(API_ENDPOINTS.PRODUCT_REVIEWS(productId)),
    addReview: (productId, rating, comment) => api.post(API_ENDPOINTS.REVIEWS, { productId, rating, comment }),
    updateReview: (id, rating, comment) => api.put(API_ENDPOINTS.REVIEW_DETAIL(id), { rating, comment }),
    deleteReview: (id) => api.delete(API_ENDPOINTS.REVIEW_DETAIL(id)),

    // Admin APIs
    admin: {
        getProducts: () => api.get(API_ENDPOINTS.ADMIN_PRODUCTS),
        createProduct: (data) => api.post(API_ENDPOINTS.ADMIN_PRODUCTS, data),
        updateProduct: (id, data) => api.put(API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(id), data),
        deleteProduct: (id) => api.delete(API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(id)),
        getOrders: () => api.get(API_ENDPOINTS.ADMIN_ORDERS),
        updateOrderStatus: (id, status) => api.put(API_ENDPOINTS.ADMIN_ORDER_STATUS(id), { status }),
        getAnalytics: () => api.get(API_ENDPOINTS.ADMIN_ANALYTICS)
    }
};