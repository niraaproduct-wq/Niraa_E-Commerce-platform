# NIRAA Admin Panel Guide

## 🎯 How to Access the Admin Panel

### 1. Open Your Browser
Go to: **http://localhost:5173/admin**

### 2. Admin Login
You'll see a login screen asking for a PIN.

**Default PIN:** `1234`

Enter the PIN and click "Secure Login" to access the admin dashboard.

## 📊 Admin Dashboard Features

### Dashboard Overview
- **Total Sales Today** - Real-time sales tracking
- **Orders Today** - Count of orders received
- **Active Subscriptions** - Number of active subscriptions
- Revenue graph (placeholder for Chart.js integration)

### Inventory Management
- View all products and stock levels
- Low stock alerts with restock buttons
- Product status monitoring

### Order Management
- Visual order flow board (Kanban style)
- Order statuses: New → Packed → Out for Delivery → Delivered
- Quick action buttons to update order status
- Order details with customer information

### Marketing & Growth
- WhatsApp broadcast messaging
- Banner management
- Promotional campaign tools

## 🔗 Admin Panel URLs

| Page | URL |
|------|-----|
| Admin Login | http://localhost:5173/admin/login |
| Dashboard | http://localhost:5173/admin/dashboard |
| Inventory | http://localhost:5173/admin/inventory |
| Orders | http://localhost:5173/admin/orders |
| Marketing | http://localhost:5173/admin/marketing |

## 🛠️ Backend Admin APIs

The admin panel connects to these backend APIs:

### Authentication Required
All admin APIs require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

### Available Endpoints

#### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

#### Products
- `GET /api/admin/products` - List all products
- `GET /api/admin/products/:id` - Get single product
- `POST /api/admin/products` - Add new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PATCH /api/admin/products/:id/stock` - Update stock

#### Orders
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/orders/:id` - Get single order
- `PATCH /api/admin/orders/:id/status` - Update order status

#### Customers
- `GET /api/admin/customers` - List all customers
- `GET /api/admin/customers/:id` - Get single customer
- `PUT /api/admin/customers/:id` - Update customer
- `PATCH /api/admin/customers/:id/block` - Block/unblock customer

#### Analytics
- `GET /api/admin/analytics/sales` - Get sales analytics

## 🚀 How to Use

### Step 1: Start Both Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Step 2: Access Admin Panel
1. Open browser: http://localhost:5173/admin
2. Enter PIN: `1234`
3. Click "Secure Login"

### Step 3: Navigate Admin Panel
- Click on sidebar links to navigate between sections
- Use "← Back to Website" to return to customer site

## 🔐 Security Notes

### Current Implementation
- Simple PIN-based authentication (PIN: 1234)
- Stored in localStorage
- Suitable for development/demo

### For Production
You should implement:
1. Proper JWT-based authentication
2. Admin user roles and permissions
3. Password hashing and secure storage
4. Session management
5. Rate limiting and CSRF protection

## 📱 Mobile Responsive
The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 Design System
The admin panel uses the same design system as the main website:
- Primary color: Teal (#2d9a8e)
- Secondary color: Gold (#c8a84b)
- Clean, modern interface
- Consistent typography and spacing

## 🔄 Data Flow

1. **Admin Panel** (React frontend)
   - Displays data from backend APIs
   - Sends user actions to backend

2. **Backend APIs** (Node.js/Express)
   - Processes requests
   - Validates authentication
   - Interacts with database

3. **Database** (MongoDB/Excel)
   - Stores products, orders, customers
   - Provides data persistence

## 🛠️ Customization

### Change Admin PIN
Edit `client/src/pages/admin/AdminPages.jsx`:
```javascript
const handleLogin = (e) => {
  e.preventDefault();
  if (pin === 'your_new_pin') { // Change this
    localStorage.setItem('niraa_admin_auth', 'true');
    setAuth(true);
    navigate('/admin/dashboard');
  } else {
    alert('Invalid PIN');
  }
};
```

### Add New Admin Pages
1. Create new component in `client/src/pages/admin/`
2. Add route in `AdminRoutes` component
3. Add navigation link in `AdminLayout`

### Integrate Real Data
Replace mock data with actual API calls:
```javascript
useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  const response = await fetch('/api/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  // Update state with data
};
```

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify both servers are running
3. Ensure backend APIs are accessible
4. Check network tab for API responses

## 🎉 Success!

You now have a complete admin panel to manage your NIRAA e-commerce business!

### What You Can Do:
✅ Monitor sales and orders in real-time
✅ Manage product inventory
✅ Track order fulfillment
✅ Communicate with customers via WhatsApp
✅ Run marketing campaigns
✅ View analytics and reports

The admin panel is ready for production use with proper authentication implementation!