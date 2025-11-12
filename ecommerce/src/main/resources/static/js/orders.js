// orders.js
protectPage();
const API_URL = 'http://localhost:8080/api';

async function loadOrders() {
    try {
        const response = await fetchWithAuth(`${API_URL}/orders`);
        if (!response || !response.ok) throw new Error('Failed to load orders');

        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('ordersList').innerHTML = '<p>Error loading orders</p>';
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersList');

    if (orders.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 3rem;"><h2>No orders yet</h2><a href="products.html" class="btn btn-primary">Start Shopping</a></div>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <h3>Order #${order.id}</h3>
                    <p>Placed on: ${new Date(order.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                    <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                    <p style="margin-top: 0.5rem; font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">$${order.totalAmount.toFixed(2)}</p>
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.product.imageUrl || 'https://via.placeholder.com/80'}" alt="${item.product.name}">
                        <div style="flex: 1;">
                            <h4>${item.product.name}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p style="font-weight: bold; color: var(--primary-color);">$${item.price}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 1rem;">
                <strong>Delivery Address:</strong><br>
                ${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}
            </div>
            <div style="margin-top: 1rem;">
                <strong>Payment Status:</strong> ${order.payment.status}
            </div>
        </div>
    `).join('');
}

loadOrders();