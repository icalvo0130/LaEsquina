const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/consumer-app', express.static(path.join(__dirname, '../consumer-app')));
app.use('/store-app', express.static(path.join(__dirname, '../store-app')));
app.use('/delivery-app', express.static(path.join(__dirname, '../delivery-app')));

// Cargar datos mock
const loadData = (filename) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'data', filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveData = (filename, data) => {
  fs.writeFileSync(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2));
};

// Rutas de autenticación
app.post('/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const users = loadData('users.json');
  
  const user = users.find(u => u.email === email && u.password === password && u.role === role);
  
  if (user) {
    const userResponse = { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    };
    
    // Agregar storeId si el usuario es una tienda
    if (user.storeId) {
      userResponse.storeId = user.storeId;
    }
    
    res.json({ 
      success: true, 
      user: userResponse
    });
  } else {
    res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
});

// Rutas de tiendas
app.get('/stores', (req, res) => {
  const stores = loadData('stores.json');
  res.json(stores);
});

app.post('/stores/:id/status', (req, res) => {
  const { id } = req.params;
  const { isOpen } = req.body;
  const stores = loadData('stores.json');
  
  const storeIndex = stores.findIndex(s => s.id === parseInt(id));
  if (storeIndex !== -1) {
    stores[storeIndex].isOpen = isOpen;
    saveData('stores.json', stores);
    res.json({ success: true, store: stores[storeIndex] });
  } else {
    res.status(404).json({ success: false, message: 'Tienda no encontrada' });
  }
});

// Rutas de productos
app.get('/products/:storeId', (req, res) => {
  const { storeId } = req.params;
  const products = loadData('products.json');
  const storeProducts = products.filter(p => p.storeId === parseInt(storeId));
  res.json(storeProducts);
});

app.post('/products', (req, res) => {
  const { name, price, description, image, storeId } = req.body;
  const products = loadData('products.json');
  
  const newProduct = {
    id: Date.now(),
    name,
    price: parseFloat(price),
    description,
    image: image || '',
    storeId: parseInt(storeId),
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  saveData('products.json', products);
  res.json({ success: true, product: newProduct });
});

// Rutas de órdenes
app.post('/orders', (req, res) => {
  const { userId, storeId, products, total, address, paymentMethod } = req.body;
  const orders = loadData('orders.json');
  
  const newOrder = {
    id: Date.now(),
    userId: parseInt(userId),
    storeId: parseInt(storeId),
    products,
    total: parseFloat(total),
    address,
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString(),
    deliveryId: null
  };
  
  orders.push(newOrder);
  saveData('orders.json', orders);
  res.json({ success: true, order: newOrder });
});

app.get('/orders/user/:userId', (req, res) => {
  const { userId } = req.params;
  const orders = loadData('orders.json');
  const userOrders = orders.filter(o => o.userId === parseInt(userId));
  res.json(userOrders);
});

app.get('/orders/available', (req, res) => {
  const orders = loadData('orders.json');
  const availableOrders = orders.filter(o => o.status === 'pending' || o.status === 'accepted');
  res.json(availableOrders);
});

app.patch('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, deliveryId } = req.body;
  const orders = loadData('orders.json');
  
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  if (orderIndex !== -1) {
    const order = orders[orderIndex];
    
    // Verificar si la orden ya fue tomada por otro repartidor
    if (status === 'accepted' && deliveryId && order.deliveryId && order.deliveryId !== deliveryId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Esta orden ya fue tomada por otro repartidor' 
      });
    }
    
    orders[orderIndex].status = status;
    if (deliveryId) {
      orders[orderIndex].deliveryId = deliveryId;
    }
    saveData('orders.json', orders);
    res.json({ success: true, order: orders[orderIndex] });
  } else {
    res.status(404).json({ success: false, message: 'Orden no encontrada' });
  }
});

// Rutas para las aplicaciones cliente
app.get('/consumer-app', (req, res) => {
  res.sendFile(path.join(__dirname, '../consumer-app/index.html'));
});

app.get('/store-app', (req, res) => {
  res.sendFile(path.join(__dirname, '../store-app/index.html'));
});

app.get('/delivery-app', (req, res) => {
  res.sendFile(path.join(__dirname, '../delivery-app/index.html'));
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor La Esquina corriendo en http://localhost:${PORT}`);
});
