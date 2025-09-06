# La Esquina - App de Delivery

Una aplicación completa de delivery inspirada en Rappi, construida con Node.js/Express y Web Components con JavaScript.

## 🚀 Características

- **3 Aplicaciones Cliente:**
  - 👤 **App de Consumidor**: Pedir comida, gestionar carrito, ver historial
  - 🏪 **App de Tienda**: Gestionar productos, abrir/cerrar tienda, ver pedidos
  - 🚚 **App de Repartidor**: Ver pedidos disponibles, gestionar entregas

- **Backend Completo:**
  - API REST con Node.js y Express
  - Autenticación por roles
  - Gestión de tiendas, productos y órdenes
  - Base de datos mock en archivos JSON

- **Diseño Moderno:**
  - Efecto liquid glass con CSS
  - Paleta de colores morada
  - Diseño responsive
  - Interfaz intuitiva

## 📁 Estructura del Proyecto

```
La esquina/
├── server/                 # Backend
│   ├── index.js           # Servidor principal
│   └── data/              # Base de datos mock
│       ├── users.json
│       ├── stores.json
│       ├── products.json
│       └── orders.json
├── public/                # Página de inicio
│   ├── index.html
│   ├── index.css
│   └── index.js
├── consumer-app/          # App de Consumidor
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── store-app/            # App de Tienda
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── delivery-app/         # App de Repartidor
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── package.json
```

## 🛠️ Instalación y Uso

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd "La esquina"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor**
   ```bash
   npm start
   ```

4. **Abrir la aplicación**
   - Navega a `http://localhost:3000`
   - Selecciona tu rol (Consumidor, Restaurante, Repartidor)

## 👥 Credenciales de Prueba

### Consumidores
- **Email:** juan@consumer.com | **Contraseña:** 123456
- **Email:** maria@consumer.com | **Contraseña:** 123456

### Tiendas
- **Email:** carlos@store.com | **Contraseña:** 123456 (Pizza Corner)
- **Email:** ana@store.com | **Contraseña:** 123456 (Burger Palace)

### Repartidores
- **Email:** pedro@delivery.com | **Contraseña:** 123456
- **Email:** luis@delivery.com | **Contraseña:** 123456

## 🔄 Flujo de la Aplicación

### 1. Consumidor
1. Inicia sesión con credenciales de consumidor
2. Ve las tiendas disponibles
3. Selecciona una tienda abierta
4. Agrega productos al carrito
5. Procede al checkout
6. Completa el pedido con dirección y método de pago
7. Ve el historial de pedidos

### 2. Tienda
1. Inicia sesión con credenciales de tienda
2. Ve el panel de administración
3. Abre/cierra la tienda
4. Gestiona productos (agregar nuevos)
5. Ve pedidos recibidos
6. Acepta pedidos pendientes

### 3. Repartidor
1. Inicia sesión con credenciales de repartidor
2. Ve el dashboard con estadísticas
3. Explora pedidos disponibles
4. Acepta pedidos
5. Actualiza el estado (en camino, entregado)
6. Gestiona sus pedidos asignados

## 🎨 Características del Diseño

- **Liquid Glass Effect**: Efecto de vidrio líquido con `backdrop-filter`
- **Paleta Morada**: Gradientes y colores en tonos morados
- **Responsive**: Adaptable a móviles y tablets
- **Sin Emojis**: Interfaz limpia sin emojis en el diseño
- **Sin Degradados**: Colores sólidos y efectos de transparencia

## 🔧 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión

### Tiendas
- `GET /stores` - Listar tiendas
- `POST /stores/:id/status` - Cambiar estado de tienda

### Productos
- `GET /products/:storeId` - Productos de una tienda
- `POST /products` - Crear producto

### Órdenes
- `POST /orders` - Crear orden
- `GET /orders/user/:userId` - Órdenes de usuario
- `GET /orders/available` - Órdenes disponibles
- `PATCH /orders/:id/status` - Actualizar estado de orden

## 🚀 Tecnologías Utilizadas

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Base de Datos:** Archivos JSON (mock)
- **Estilos:** CSS con efectos de transparencia y blur
- **Comunicación:** Fetch API para llamadas HTTP

## 📱 Funcionalidades Implementadas

✅ Autenticación por roles  
✅ Gestión de tiendas (abrir/cerrar)  
✅ CRUD de productos  
✅ Sistema de carrito de compras  
✅ Creación y gestión de órdenes  
✅ Panel de repartidor con estados  
✅ Diseño liquid glass morado  
✅ Responsive design  
✅ Navegación entre pantallas  
✅ Persistencia de sesión  

## 🎯 Próximas Mejoras

- [ ] Implementar edición y eliminación de productos
- [ ] Agregar notificaciones en tiempo real
- [ ] Implementar geolocalización
- [ ] Agregar sistema de calificaciones
- [ ] Implementar pagos reales
- [ ] Agregar más validaciones
- [ ] Implementar tests unitarios

---

**¡Disfruta usando La Esquina! 🍕🍔🍜**
# LaEsquina
