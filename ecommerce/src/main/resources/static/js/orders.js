document.addEventListener('DOMContentLoaded', () => {
    if (!auth.requireAuth()) return;
    auth.updateUserDisplay();
    updateCartBadge();
    updateWishlistBadge();
    loadOrders();
});

const loadOrders = async () => {
    const container = document.getElementById('ordersContainer');
    setLoading(container, true);

    try {
        const orders = await api.getOrders();

        if (orders.length === 0) {
            setEmptyState(container, 'No orders yet', 'fa-shopping-bag');
            return;
        }

        container.innerHTML = orders.map(order => createOrderCard(order)).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'error');
    }
};

const createOrderCard = (order) => {
    const statusColors = {
        PROCESSING: 'info',
        SHIPPED: 'warning',
        DELIVERED: 'success',
        CANCELLED: 'danger'
    };

    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">${formatDate(order.orderDate)}</p>
                </div>
                <span class="badge badge-${statusColors[order.status]}">${order.status}</span>
            </div>

            <div class="order-items">
                ${order.items.slice(0, 3).map(item => `
                    <div class="order-item">
                        <img src="${item.product.imageUrl || 'https://via.placeholder.com/60'}"
                             alt="${item.product.name}">
                        <div>
                            <div class="item-name">${item.product.name}</div>
                            <div class="item-qty">Qty: ${item.quantity} × ${formatCurrency(item.price)}</div>
                        </div>
                    </div>
                `).join('')}
                ${order.items.length > 3 ? `<p>+ ${order.items.length - 3} more items</p>` : ''}
            </div>

            <div class="order-footer">
                <div class="order-total">
                    <strong>Total:</strong> ${formatCurrency(order.totalAmount)}
                </div>
                <button class="btn btn-primary btn-sm" onclick="viewOrderDetails(${order.id})">
                    View Details
                </button>
            </div>
        </div>
    `;
};

window.viewOrderDetails = (orderId) => {
    // Could open a modal or navigate to detail page
    alert(`View order details for order #${orderId}`);
};