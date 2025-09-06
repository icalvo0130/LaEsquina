class ConsumerApp {
    constructor() {
        this.currentUser = null;
        this.cart = [];
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

        document.getElementById('view-orders-btn').addEventListener('click', () => {
            this.showScreen('orders-screen');
        });

        document.getElementById('back-to-stores').addEventListener('click', () => {
            this.showScreen('stores-screen');
        });

        document.getElementById('back-to-store').addEventListener('click', () => {
            this.showScreen('store-detail-screen');
        });

        document.getElementById('back-to-cart').addEventListener('click', () => {
            this.showScreen('cart-screen');
        });

        document.getElementById('back-to-stores-from-orders').addEventListener('click', () => {
            this.showScreen('stores-screen');
        });

        // Cart button
        document.getElementById('cart-btn').addEventListener('click', () => {
            this.showScreen('cart-screen');
        });

        // Checkout
        document.getElementById('checkout-btn').addEventListener('click', () => {
            this.showScreen('checkout-screen');
        });

        document.getElementById('place-order-btn').addEventListener('click', () => {
            this.placeOrder();
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
                    role: 'consumer'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.loadStores();
                this.showScreen('stores-screen');
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
        this.cart = [];
        localStorage.removeItem('currentUser');
        this.showScreen('login-screen');
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.loadStores();
            this.showScreen('stores-screen');
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');

        if (screenId === 'stores-screen') {
            this.loadStores();
        } else if (screenId === 'cart-screen') {
            this.renderCart();
        } else if (screenId === 'checkout-screen') {
            this.renderCheckout();
        } else if (screenId === 'orders-screen') {
            this.loadOrders();
        }
    }

    async loadStores() {
        try {
            const response = await fetch(`${this.apiBase}/stores`);
            const stores = await response.json();
            this.renderStores(stores);
        } catch (error) {
            console.error('Error loading stores:', error);
        }
    }

    renderStores(stores) {
        const storesGrid = document.getElementById('stores-grid');
        const userName = document.getElementById('user-name');
        
        userName.textContent = `Hola, ${this.currentUser.name}`;
        
        storesGrid.innerHTML = stores.map(store => `
            <div class="store-card" onclick="app.selectStore(${store.id})">
                <img src="${store.image}" alt="${store.name}">
                <h3>${store.name}</h3>
                <p>${store.description}</p>
                <p>⭐ ${store.rating} • ${store.deliveryTime}</p>
                <span class="store-status ${store.isOpen ? 'open' : 'closed'}">
                    ${store.isOpen ? 'Abierto' : 'Cerrado'}
                </span>
            </div>
        `).join('');
    }

    async selectStore(storeId) {
        try {
            const response = await fetch(`${this.apiBase}/stores`);
            const stores = await response.json();
            this.currentStore = stores.find(s => s.id === storeId);
            
            if (!this.currentStore.isOpen) {
                alert('Esta tienda está cerrada');
                return;
            }

            this.loadProducts(storeId);
            this.showScreen('store-detail-screen');
        } catch (error) {
            console.error('Error loading store:', error);
        }
    }

    async loadProducts(storeId) {
        try {
            const response = await fetch(`${this.apiBase}/products/${storeId}`);
            const products = await response.json();
            this.currentStore.products = products; // Guardar productos en currentStore
            this.renderStoreDetail(products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderStoreDetail(products) {
        const storeName = document.getElementById('store-name');
        const storeInfo = document.getElementById('store-info');
        const productsGrid = document.getElementById('products-grid');

        storeName.textContent = this.currentStore.name;
        
        storeInfo.innerHTML = `
            <h2>${this.currentStore.name}</h2>
            <p>${this.currentStore.description}</p>
            <p>⭐ ${this.currentStore.rating} • ${this.currentStore.deliveryTime}</p>
        `;

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="quantity-btn" onclick="app.updateQuantity(${product.id}, -1)">-</button>
                    <span class="quantity" id="qty-${product.id}">0</span>
                    <button class="quantity-btn" onclick="app.updateQuantity(${product.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    updateQuantity(productId, change) {
        const quantityElement = document.getElementById(`qty-${productId}`);
        let currentQty = parseInt(quantityElement.textContent) || 0;
        let newQty = Math.max(0, currentQty + change);
        
        quantityElement.textContent = newQty;

        // Update cart
        const existingItem = this.cart.find(item => item.id === productId);
        if (newQty === 0) {
            this.cart = this.cart.filter(item => item.id !== productId);
        } else {
            if (existingItem) {
                existingItem.quantity = newQty;
            } else {
                // Find product details
                const product = this.findProductById(productId);
                if (product) {
                    this.cart.push({
                        ...product,
                        quantity: newQty
                    });
                }
            }
        }

        this.updateCartCount();
    }

    findProductById(productId) {
        // Find product from the loaded products
        if (this.currentStore && this.currentStore.products) {
            return this.currentStore.products.find(p => p.id === productId);
        }
        return null;
    }

    updateCartCount() {
        const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cart-count').textContent = cartCount;
        
        const checkoutBtn = document.getElementById('checkout-btn');
        checkoutBtn.disabled = cartCount === 0;
    }

    renderCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p style="color: #fff; text-align: center;">Tu carrito está vacío</p>';
            cartTotal.textContent = '0.00';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} c/u</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }

    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, item.quantity + change);
            if (item.quantity === 0) {
                this.cart = this.cart.filter(cartItem => cartItem.id !== productId);
            }
        }
        this.renderCart();
        this.updateCartCount();
    }

    renderCheckout() {
        const orderItems = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');

        orderItems.innerHTML = this.cart.map(item => `
            <div class="order-item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderTotal.textContent = total.toFixed(2);
    }

    async placeOrder() {
        const address = document.getElementById('delivery-address').value;
        const paymentMethod = document.getElementById('payment-method').value;

        if (!address || !paymentMethod) {
            alert('Por favor completa todos los campos');
            return;
        }

        try {
            const orderData = {
                userId: this.currentUser.id,
                storeId: this.currentStore.id,
                products: this.cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                address,
                paymentMethod
            };

            const response = await fetch(`${this.apiBase}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (data.success) {
                alert('¡Pedido realizado con éxito!');
                this.cart = [];
                this.updateCartCount();
                this.showScreen('stores-screen');
            } else {
                alert('Error al realizar el pedido');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Error al realizar el pedido');
        }
    }

    async loadOrders() {
        try {
            const response = await fetch(`${this.apiBase}/orders/user/${this.currentUser.id}`);
            const orders = await response.json();
            this.renderOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    renderOrders(orders) {
        const ordersList = document.getElementById('orders-list');

        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="color: #fff; text-align: center;">No tienes pedidos aún</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <h3>Pedido #${order.id}</h3>
                <p>Tienda: ${order.storeId}</p>
                <p>Total: $${order.total.toFixed(2)}</p>
                <p>Dirección: ${order.address}</p>
                <p>Método de pago: ${order.paymentMethod}</p>
                <p>Fecha: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
            </div>
        `).join('');
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
const app = new ConsumerApp();
