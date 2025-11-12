let categories = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!auth.isLoggedIn() || !auth.isAdmin()) {
        window.location.href = '../index.html';
        return;
    }

    await loadCategories();
    await loadProducts();
    setupProductForm();

    document.getElementById('adminLogout').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            auth.logout();
        }
    });
});

const loadCategories = async () => {
    try {
        categories = await api.getCategories();
        const select = document.getElementById('prodCategory');
        select.innerHTML = '<option value="">Select Category</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
};

const loadProducts = async () => {
    const tbody = document.getElementById('productsTableBody');

    try {
        const products = await api.admin.getProducts();

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <img src="${product.imageUrl || 'https://via.placeholder.com/50'}"
                         alt="${product.name}" class="product-thumb">
                </td>
                <td>${product.name}</td>
                <td>${product.category?.name || 'N/A'}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <div class="stars">${generateStars(product.averageRating)}</div>
                    <small>(${product.reviewCount})</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick='editProduct(${JSON.stringify(product)})'>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    }
};

const setupProductForm = () => {
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const categoryId = document.getElementById('prodCategory').value;
        const category = categories.find(c => c.id == categoryId);

        const data = {
            name: document.getElementById('prodName').value,
            description: document.getElementById('prodDescription').value,
            price: parseFloat(document.getElementById('prodPrice').value),
            stock: parseInt(document.getElementById('prodStock').value),
            category: category,
            imageUrl: document.getElementById('prodImage').value
        };

        const productId = document.getElementById('productId').value;

        try {
            if (productId) {
                await api.admin.updateProduct(productId, data);
                showToast('Product updated successfully', 'success');
            } else {
                await api.admin.createProduct(data);
                showToast('Product created successfully', 'success');
            }

            closeModal('productModal');
            loadProducts();
        } catch (error) {
            showToast(error.message || 'Failed to save product', 'error');
        }
    });
};

window.openProductModal = () => {
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    openModal('productModal');
};

window.editProduct = (product) => {
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodDescription').value = product.description;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodStock').value = product.stock;
    document.getElementById('prodCategory').value = product.category?.id || '';
    document.getElementById('prodImage').value = product.imageUrl || '';
    openModal('productModal');
};

window.deleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await api.admin.deleteProduct(productId);
        showToast('Product deleted successfully', 'success');
        loadProducts();
    } catch (error) {
        showToast(error.message || 'Failed to delete product', 'error');
    }
};