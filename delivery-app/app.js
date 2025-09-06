class DeliveryApp {
    constructor() {
        this.currentUser = null;
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

        document.getElementById('back-to-dashboard-from-my-orders').addEventListener('click', () => {
            this.showScreen('dashboard-screen');
        });

        document.getElementById('back-to-orders').addEventListener('click', () => {
            this.showScreen('available-orders-screen');
        });

        // Refresh buttons
        document.getElementById('refresh-orders').addEventListener('click', () => {
            this.loadAvailableOrders();
        });

        document.getElementById('refresh-my-orders').addEventListener('click', () => {
            this.loadMyOrders();
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
                    role: 'delivery'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.loadDashboard();
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
        localStorage.removeItem('currentUser');
        this.showScreen('login-screen');
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.loadDashboard();
            this.showScreen('dashboard-screen');
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'available-orders-screen') {
            this.loadAvailableOrders();
        } else if (screenId === 'my-orders-screen') {
            this.loadMyOrders();
        } else if (screenId === 'dashboard-screen') {
            this.loadDashboard();
        }
    }

    async loadDashboard() {
        try {
            const [availableOrders, myOrders] = await Promise.all([
                this.getAvailableOrders(),
                this.getMyOrders()
            ]);

            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('available-orders').textContent = availableOrders.length;
            document.getElementById('my-orders').textContent = myOrders.length;
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async getAvailableOrders() {
        try {
            const response = await fetch(`${this.apiBase}/orders/available`);
            const orders = await response.json();
            return orders.filter(order => 
                order.status === 'pending' || 
                (order.status === 'accepted' && order.deliveryId === this.currentUser.id)
            );
        } catch (error) {
            console.error('Error loading available orders:', error);
            return [];
        }
    }

    async getMyOrders() {
        try {
            const response = await fetch(`${this.apiBase}/orders/available`);
            const orders = await response.json();
            return orders.filter(order => order.deliveryId === this.currentUser.id);
        } catch (error) {
            console.error('Error loading my orders:', error);
            return [];
        }
    }

    async loadAvailableOrders() {
        try {
            const orders = await this.getAvailableOrders();
            this.renderAvailableOrders(orders);
        } catch (error) {
            console.error('Error loading available orders:', error);
        }
    }

    renderAvailableOrders(orders) {
        const ordersList = document.getElementById('available-orders-list');

        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="color: #fff; text-align: center;">No hay pedidos disponibles en este momento</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <h3>Pedido #${order.id}</h3>
                <div class="order-info">
                    <div class="order-info-item">
                        <strong>Tienda ID:</strong>
                        <span>${order.storeId}</span>
                    </div>
                    <div class="order-info-item">
                        <strong>Total:</strong>
                        <span>$${order.total.toFixed(2)}</span>
                    </div>
                    <div class="order-info-item">
                        <strong>Dirección:</strong>
                        <span>${order.address}</span>
                    </div>
                    <div class="order-info-item">
                        <strong>Método de pago:</strong>
                        <span>${order.paymentMethod}</span>
                    </div>
                </div>
                <div class="order-products">
                    <strong>Productos:</strong>
                    ${order.products.map(product => `
                        <div class="product-item">
                            <span>${product.name} x${product.quantity}</span>
                            <span>$${(product.price * product.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                <div class="order-actions">
                    <button class="btn-accept" onclick="app.acceptOrder(${order.id})">Aceptar Pedido</button>
                    <button class="btn-primary" onclick="app.viewOrderDetail(${order.id})">Ver Detalle</button>
                </div>
            </div>
        `).join('');
    }

    async loadMyOrders() {
        try {
            const orders = await this.getMyOrders();
            this.renderMyOrders(orders);
        } catch (error) {
            console.error('Error loading my orders:', error);
        }
    }

    renderMyOrders(orders) {
        const ordersList = document.getElementById('my-orders-list');

        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="color: #fff; text-align: center;">No tienes pedidos asignados</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <h3>Pedido #${order.id}</h3>
                <div class="order-info">
                    <div class="order-info-item">
                        <strong>Tienda ID:</strong>
                        <span>${order.storeId}</span>
                    </div>
                    <div class="order-info-item">
                        <strong>Total:</strong>
                        <span>$${order.total.toFixed(2)}</span>
                    </div>
                    <div class="order-info-item">
                        <strong>Dirección:</strong>
                        <span>${order.address}</span>
                    </div>
                    <div class="order-info-item">
                        <strong>Método de pago:</strong>
                        <span>${order.paymentMethod}</span>
                    </div>
                </div>
                <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                <div class="order-actions">
                    ${this.getOrderActionButtons(order)}
                </div>
            </div>
        `).join('');
    }

    getOrderActionButtons(order) {
        switch (order.status) {
            case 'accepted':
                return `<button class="btn-update" onclick="app.updateOrderStatus(${order.id}, 'in_progress')">Marcar como En Camino</button>`;
            case 'in_progress':
                return `<button class="btn-accept" onclick="app.updateOrderStatus(${order.id}, 'delivered')">Marcar como Entregado</button>`;
            case 'delivered':
                return `<span style="color: #4caf50; font-weight: bold;">Pedido Completado</span>`;
            default:
                return '';
        }
    }

    async acceptOrder(orderId) {
        try {
            const response = await fetch(`${this.apiBase}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'accepted',
                    deliveryId: this.currentUser.id
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Pedido aceptado exitosamente');
                this.loadAvailableOrders();
                this.loadDashboard();
            } else {
                alert('Error al aceptar el pedido: ' + (data.message || 'El pedido ya fue tomado por otro repartidor'));
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            alert('Error al aceptar el pedido');
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`${this.apiBase}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: status
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`Estado actualizado a: ${this.getStatusText(status)}`);
                this.loadMyOrders();
                this.loadDashboard();
            } else {
                alert('Error al actualizar el estado del pedido');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error al actualizar el estado del pedido');
        }
    }

    async viewOrderDetail(orderId) {
        try {
            const response = await fetch(`${this.apiBase}/orders/available`);
            const orders = await response.json();
            const order = orders.find(o => o.id === orderId);
            
            if (order) {
                this.renderOrderDetail(order);
                this.showScreen('order-detail-screen');
            } else {
                alert('Pedido no encontrado');
            }
        } catch (error) {
            console.error('Error loading order detail:', error);
            alert('Error al cargar el detalle del pedido');
        }
    }

    renderOrderDetail(order) {
        const orderDetail = document.getElementById('order-detail-content');
        
        orderDetail.innerHTML = `
            <h2>Pedido #${order.id}</h2>
            
            <div class="delivery-info">
                <h3>Información de Entrega</h3>
                <p><strong>Tienda ID:</strong> ${order.storeId}</p>
                <p><strong>Cliente ID:</strong> ${order.userId}</p>
                <p><strong>Dirección:</strong> ${order.address}</p>
                <p><strong>Método de pago:</strong> ${order.paymentMethod}</p>
                <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Estado:</strong> <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span></p>
            </div>

            <div class="order-products">
                <h3>Productos del Pedido</h3>
                ${order.products.map(product => `
                    <div class="product-item">
                        <span>${product.name} x${product.quantity}</span>
                        <span>$${product.price.toFixed(2)} c/u</span>
                        <span>$${(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="product-item" style="border-top: 2px solid rgba(255, 255, 255, 0.3); font-weight: bold; margin-top: 10px;">
                    <span>Total</span>
                    <span></span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>

            ${order.deliveryId === this.currentUser.id ? `
                <div class="order-actions">
                    ${this.getOrderActionButtons(order)}
                </div>
            ` : ''}
        `;
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
const app = new DeliveryApp();
