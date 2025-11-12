// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    ADMIN_LOGIN: '/auth/admin/login',

    // Products
    PRODUCTS: '/products',
    PRODUCT_DETAIL: (id) => `/products/${id}`,
    PRODUCT_SEARCH: '/products/search',
    PRODUCTS_BY_CATEGORY: (id) => `/products/category/${id}`,

    // Categories
    CATEGORIES: '/categories',

    // Cart
    CART: '/cart',
    CART_ADD: '/cart/add',
    CART_UPDATE: (id) => `/cart/update/${id}`,
    CART_REMOVE: (id) => `/cart/remove/${id}`,
    CART_CLEAR: '/cart/clear',

    // Wishlist
    WISHLIST: '/wishlist',
    WISHLIST_ADD: (id) => `/wishlist/add/${id}`,
    WISHLIST_REMOVE: (id) => `/wishlist/remove/${id}`,
    WISHLIST_MOVE_TO_CART: (id) => `/wishlist/move-to-cart/${id}`,

    // Orders
    ORDERS: '/orders',
    ORDER_DETAIL: (id) => `/orders/${id}`,
    CHECKOUT: '/orders/checkout',

    // User
    PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    ADDRESS_DETAIL: (id) => `/users/addresses/${id}`,

    // Reviews
    REVIEWS: '/reviews',
    PRODUCT_REVIEWS: (id) => `/reviews/product/${id}`,
    REVIEW_DETAIL: (id) => `/reviews/${id}`,

    // Admin
    ADMIN_PRODUCTS: '/admin/products',
    ADMIN_PRODUCT_DETAIL: (id) => `/admin/products/${id}`,
    ADMIN_ORDERS: '/admin/orders',
    ADMIN_ORDER_STATUS: (id) => `/admin/orders/${id}/status`,
    ADMIN_ANALYTICS: '/admin/analytics'
};

// Storage Keys
const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    CART_COUNT: 'cart_count',
    WISHLIST_COUNT: 'wishlist_count'
};

// Helper Functions
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    clear: () => {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};