# NIRAA Wellness & Lifestyle – Full Stack E-Commerce

A clean, modern e-commerce website for NIRAA Wellness & Lifestyle — selling home cleaning products locally in Dharmapuri & nearby areas.

## Tech Stack
- **Frontend**: React 18, React Router v6, Context API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Payments**: UPI / Cash on Delivery
- **WhatsApp**: Direct order integration

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
MONGO_URI=mongodb://localhost:27017/niraa
JWT_SECRET=your_jwt_secret_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Run

```bash
# Run backend (from /server)
npm run dev

# Run frontend (from /client)
npm run dev
```

Frontend runs on http://localhost:5173  
Backend runs on http://localhost:5000

## Features
- Product listing with combo packs & discounts
- Cart with quantity management
- Checkout with UPI & Cash on Delivery
- WhatsApp order button
- Admin dashboard (product/order management)
- Mobile-first, responsive design