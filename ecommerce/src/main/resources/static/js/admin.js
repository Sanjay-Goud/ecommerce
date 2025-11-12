document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn() || !auth.isAdmin()) {
        window.location.href = '../index.html';
        return;
    }

    const user = auth.getCurrentUser();
    document.getElementById('adminName').textContent = user.fullName;

    loadAnalytics();
    loadRecentOrders();

    document.getElementById('adminLogout').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            auth.logout();
        }
    });
});

const loadAnalytics = async () => {
    try {
        const analytics = await api.admin.getAnalytics();

        document.getElementById('totalUsers').textContent = analytics.totalUsers || 0;
        document.getElementById('totalOrders').textContent = analytics.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = formatCurrency(analytics.totalRevenue || 0);

        // Get total products separately
        const products = await api.admin.getProducts();
        document.getElementById('totalProducts').textContent = products.length;

        // Display top products
        displayTopProducts(analytics.topProducts || []);
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Failed to load analytics', 'error');
    }
};

const displayTopProducts = (topProducts) => {
    const tbody = document.getElementById('topProductsTable');

    if (topProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center">No sales data available</td></tr>';
        return;
    }

    tbody.innerHTML = topProducts.slice(0, 10).map(product => `
        <tr>
            <td>${product.name}</td>
            <td><strong>${product.totalSold}</strong> units</td>
        </tr>
    `).join('');
};

const loadRecentOrders = async () => {
    const container = document.getElementById('recentOrdersContainer');

    try {
        const orders = await api.admin.getOrders();
        const recentOrders = orders.slice(0, 5);

        if (recentOrders.length === 0) {
            container.innerHTML = '<p class="text-center">No orders yet</p>';
            return;
        }

        container.innerHTML = recentOrders.map(order => `
            <div class="order-card-admin">
                <div class="order-info">
                    <strong>Order #${order.id}</strong>
                    <span>${formatDate(order.orderDate)}</span>
                </div>
                <div class="order-user">${order.user.fullName}</div>
                <div class="order-amount">${formatCurrency(order.totalAmount)}</div>
                <span class="badge badge-${getStatusColor(order.status)}">${order.status}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = '<p class="text-center">Failed to load orders</p>';
    }
};

const getStatusColor = (status) => {
    const colors = {
        PROCESSING: 'info',
        SHIPPED: 'warning',
        DELIVERED: 'success',
        CANCELLED: 'danger'
    };
    return colors[status] || 'info';
};