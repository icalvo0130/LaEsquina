class StoreApp {
    constructor() {
        this.currentUser = null;
        this.currentStore = null;
        this.apiBase = 'http://localhost:3000';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Navigation buttons
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('back-to-dashboard').addEventListener('click', () => {
            this.showScreen('dashboard-screen');
        });

        document.getElementById('back-to-dashboard-from-orders').addEventListener('click', () => {
            this.showScreen('dashboard-screen');
        });

        // Store status toggle
        document.getElementById('toggle-status-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleStoreStatus();
        });

        // Products management
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.showModal('add-product-modal');
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal('add-product-modal');
        });

        document.getElementById('cancel-add-product').addEventListener('click', () => {
            this.hideModal('add-product-modal');
        });

        document.getElementById('add-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    role: 'store'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                console.log('User logged in:', this.currentUser);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                await this.loadStoreInfo();
                this.showScreen('dashboard-screen');
            } else {
                alert('Credenciales inválidas');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al iniciar sesión');
        }
    }

    logout() {
        this.currentUser = null;
        this.currentStore = null;
        localStorage.removeItem('currentUser');
        this.showScreen('login-screen');
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.loadStoreInfo();
            this.showScreen('dashboard-screen');
        }
    }

    async loadStoreInfo() {
        try {
            const response = await fetch(`${this.apiBase}/stores`);
            const stores = await response.json();
            this.currentStore = stores.find(s => s.id === this.currentUser.storeId);
            
            if (!this.currentStore) {
                console.error('Store not found for user:', this.currentUser);
                alert('Error: No se encontró la tienda asociada a tu usuario. Por favor contacta al administrador.');
                return;
            }
            
            console.log('Store loaded:', this.currentStore);
            this.updateStoreInfo();
        } catch (error) {
            console.error('Error loading store info:', error);
            alert('Error al cargar la información de la tienda: ' + error.message);
        }
    }

    updateStoreInfo() {
        if (this.currentStore) {
            document.getElementById('store-name').textContent = this.currentStore.name;
            document.getElementById('store-description').textContent = this.currentStore.description;
            
            const statusElement = document.getElementById('store-status');
            const toggleBtn = document.getElementById('toggle-status-btn');
            
            if (this.currentStore.isOpen) {
                statusElement.textContent = 'Abierto';
                statusElement.className = 'status-indicator open';
                toggleBtn.textContent = 'Cerrar Tienda';
            } else {
                statusElement.textContent = 'Cerrado';
                statusElement.className = 'status-indicator closed';
                toggleBtn.textContent = 'Abrir Tienda';
            }
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'products-screen') {
            this.loadProducts();
        } else if (screenId === 'orders-screen') {
            this.loadOrders();
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        // Clear form
        if (modalId === 'add-product-modal') {
            document.getElementById('add-product-form').reset();
        }
    }

    async toggleStoreStatus() {
        if (!this.currentStore || !this.currentStore.id) {
            alert('Error: No se pudo obtener la información de la tienda. Por favor recarga la página.');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/stores/${this.currentStore.id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isOpen: !this.currentStore.isOpen
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentStore.isOpen = data.store.isOpen;
                this.updateStoreInfo();
                alert(`Tienda ${this.currentStore.isOpen ? 'abierta' : 'cerrada'} exitosamente`);
            } else {
                alert('Error al cambiar el estado de la tienda: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error toggling store status:', error);
            alert('Error al cambiar el estado de la tienda: ' + error.message);
        }
    }

    async loadProducts() {
        try {
            const response = await fetch(`${this.apiBase}/products/${this.currentStore.id}`);
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts(products) {
        const productsList = document.getElementById('products-list');
        const userName = document.getElementById('user-name');
        
        userName.textContent = this.currentUser.name;

        if (products.length === 0) {
            productsList.innerHTML = '<p style="color: #fff; text-align: center; grid-column: 1/-1;">No hay productos aún. Agrega tu primer producto.</p>';
            return;
        }

        productsList.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image || 'https://via.placeholder.com/300x150?text=Sin+Imagen'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn-edit" onclick="app.editProduct(${product.id})">Editar</button>
                    <button class="btn-delete" onclick="app.deleteProduct(${product.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    async addProduct() {
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const description = document.getElementById('product-description').value;
        const image = document.getElementById('product-image').value;

        if (!name || !price || price <= 0) {
            alert('Por favor completa todos los campos requeridos con valores válidos');
            return;
        }

        if (!this.currentStore || !this.currentStore.id) {
            alert('Error: No se pudo obtener la información de la tienda. Por favor recarga la página.');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    price,
                    description: description || 'Sin descripción',
                    image: image || 'https://via.placeholder.com/300x200?text=Sin+Imagen',
                    storeId: this.currentStore.id
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Producto agregado exitosamente');
                this.hideModal('add-product-modal');
                this.loadProducts();
            } else {
                alert('Error al agregar el producto: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error al agregar el producto: ' + error.message);
        }
    }

    editProduct(productId) {
        // For simplicity, we'll just show an alert
        // In a real app, you'd open an edit modal
        alert('Función de edición no implementada en esta demo');
    }

    deleteProduct(productId) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            // For simplicity, we'll just show an alert
            // In a real app, you'd make a DELETE request to the API
            alert('Función de eliminación no implementada en esta demo');
        }
    }

    async loadOrders() {
        try {
            const response = await fetch(`${this.apiBase}/orders/available`);
            const orders = await response.json();
            // Filter orders for this store
            const storeOrders = orders.filter(order => order.storeId === this.currentStore.id);
            this.renderOrders(storeOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    renderOrders(orders) {
        const ordersList = document.getElementById('orders-list');

        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="color: #fff; text-align: center;">No hay pedidos aún</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <h3>Pedido #${order.id}</h3>
                <p><strong>Cliente ID:</strong> ${order.userId}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                <p><strong>Dirección:</strong> ${order.address}</p>
                <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
                <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <div class="order-products">
                    <strong>Productos:</strong>
                    ${order.products.map(product => `
                        <div>${product.name} x${product.quantity} - $${(product.price * product.quantity).toFixed(2)}</div>
                    `).join('')}
                </div>
                <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                ${order.status === 'pending' ? `
                    <div class="order-actions">
                        <button class="btn-primary" onclick="app.acceptOrder(${order.id})">Aceptar Pedido</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    async acceptOrder(orderId) {
        try {
            const response = await fetch(`${this.apiBase}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'accepted'
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Pedido aceptado exitosamente');
                this.loadOrders();
            } else {
                alert('Error al aceptar el pedido');
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            alert('Error al aceptar el pedido');
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'accepted': 'Aceptado',
            'in_progress': 'En camino',
            'delivered': 'Entregado'
        };
        return statusMap[status] || status;
    }
}

// Initialize app
const app = new StoreApp();
