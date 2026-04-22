# NIRAA – Home Cleaning Products E-Commerce Platform [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue.svg)](https://nodejs.org/)

![NIRAA Logo](client/src/assets/images/logo.jpeg)

A clean, modern **full-stack e-commerce website** for **NIRAA Wellness & Lifestyle** – selling premium home cleaning products locally in **Dharmapuri & nearby areas**.

## ✨ Features
- 📱 **Mobile-first responsive design**
- 🛒 **Smart cart with quantity management**
- 💳 **UPI & Cash on Delivery payments**
- 📲 **WhatsApp direct order integration**
- 👨‍💼 **Complete admin dashboard** (products, orders, customers, pages)
- 🔐 **OTP-based phone authentication**
- 📍 **GPS location detection & address autocomplete**
- 🚀 **Real-time SMS OTP delivery** (Fast2SMS, MSG91, Twilio)

## 🛠 Tech Stack
| Frontend | Backend | Database | Tools |
|----------|---------|----------|-------|
| React 18 | Node.js/Express | MongoDB/Mongoose | Vite |
| React Router v6 | Firebase Storage | Excel Fallback | Cloudinary |
| Context API | JWT Auth | | Tailwind CSS |

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.x
- MongoDB (local or [Atlas](https://mongodb.com/atlas))
- Git

```bash
git clone https://github.com/Vasanthraja123/E-Commerce-platform-for-Home-cleaning-Product.git
cd "E-Commerce-platform-for-Home-cleaning-Product"
```

### 1. Install Dependencies
```bash
# Backend
cd server && npm install

# Frontend  
cd ../client && npm install

# Return to root
cd ..
```

### 2. Environment Setup
Copy example env files and configure:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env  # if exists
```

**Key vars (server/.env):**
```
MONGO_URI=mongodb://localhost:27017/niraa
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
CLIENT_URL=http://localhost:5173
SMS_PROVIDER=fast2sms  # or msg91,twilio
FAST2SMS_API_KEY=your_key
```

### 3. Run Development Servers
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:5000

## 🔐 Authentication System

**OTP-based phone auth** with Excel/MongoDB storage:

1. Enter phone → Get OTP (SMS/console)
2. Verify OTP → Login/Signup
3. New users: Complete profile + GPS location
4. Returning: Direct dashboard access

**SMS Providers:** Fast2SMS (₹0.15/SMS), MSG91, Twilio

## 📁 Project Structure
```
├── client/           # React/Vite frontend
├── server/           # Express/Mongo backend  
├── scripts/          # Migration/seed scripts
├── .gitignore        # Git ignores
├── README.md         # You're here!
└── requirements.txt  # Node.js info only
```

## 🖼 Screenshots
<!-- Add screenshots here -->
- [Home Page]()
- [Product Details]()
- [Admin Dashboard]()
- [Mobile Checkout]()

## 🚀 Deployment
1. **Frontend**: `npm run build` → Static hosting (Vercel/Netlify)
2. **Backend**: Heroku/Render → MongoDB Atlas
3. **Domain**: Add SSL via Cloudflare

## 🤝 Contributing
1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push & PR

## 📄 License
This project is MIT licensed - see [LICENSE](LICENSE) file.

## 👨‍💼 Contact
**Vasanthraja** – [@github](https://github.com/Vasanthraja123)

**Star this repo if it helps! ⭐**

---

*Built with ❤️ for local Dharmapuri businesses*

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

## New Authentication System

### Overview
The application now includes a comprehensive OTP-based authentication system with the following features:

- **Phone-based OTP Authentication**: Users can login/signup using their phone number with OTP verification
- **Excel-based Data Storage**: User data is stored in Excel files (configurable to MongoDB)
- **Location Integration**: Automatic location detection using Google Maps/OpenStreetMap
- **Two-tier User Flow**: Separate flows for new customers (signup) and existing users (login)
- **Profile Management**: Users can update their profile information including address

### Key Features

#### 1. OTP-Based Authentication
- Send OTP to any phone number
- 5-minute OTP expiry with attempt limits
- Automatic OTP generation and validation
- Development mode shows OTP in console for testing

#### 2. Excel Storage System
- User data stored in Excel files (`server/storage/users.xlsx`)
- Automatic file creation with proper headers
- Support for all user fields including address and location data
- Configurable via `USE_EXCEL_STORAGE=true` environment variable

#### 3. Location Detection
- Automatic GPS location detection using browser geolocation
- Reverse geocoding via OpenStreetMap Nominatim API (no API key required)
- Manual address entry with pincode validation for Dharmapuri area
- Coordinates stored for future delivery optimization

#### 4. User Registration Flow
- **Step 1**: Phone number entry and OTP request
- **Step 2**: OTP verification
- **Step 3**: Profile completion (for new users)
  - First name, last name, email
  - Address with location detection
  - Optional password creation

#### 5. Login Flow
- **Step 1**: Phone number entry and OTP request
- **Step 2**: OTP verification
- **Step 3**: Direct access to dashboard

### API Endpoints

#### Public Endpoints
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login/signup user
- `POST /api/auth/register` - Traditional registration with password
- `POST /api/auth/login` - Traditional login with password

#### Protected Endpoints
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Frontend Components

#### Login Page (`/login`)
- Complete OTP-based authentication flow
- Toggle between login and signup modes
- Location detection with "Use Current Location" button
- Address form with pincode validation
- Password creation for returning users

#### Integration Points
- **Navbar**: Login button redirects to `/login` page
- **Checkout**: Redirects to login if user not authenticated
- **Profile**: Users can update their information

### Database Schema (Excel)

The Excel file includes the following columns:
- User identification (ID, Phone, Email)
- Personal information (Name, First/Last Name)
- Authentication (Password, HasPassword, IsVerified)
- Address details (Street, City, Pincode, State, Landmark)
- Location data (Latitude, Longitude, LocationName)
- Profile status (ProfileComplete)
- Timestamps (CreatedAt, UpdatedAt)

### Configuration

To switch between Excel and MongoDB storage:
```bash
# Use Excel storage (default for development)
USE_EXCEL_STORAGE=true

# Use MongoDB storage
USE_EXCEL_STORAGE=false
```

### SMS Provider Configuration

To enable real SMS OTP delivery (production), configure your preferred SMS provider:

```bash
# Choose SMS provider: development, fast2sms, msg91, twilio, textlocal
SMS_PROVIDER=fast2sms

# Fast2SMS Configuration (Recommended for India)
FAST2SMS_API_KEY=your_api_key_here

# MSG91 Configuration (Enterprise)
MSG91_AUTH_KEY=your_auth_key_here

# Twilio Configuration (Global)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# TextLocal Configuration (India)
TEXTLOCAL_API_KEY=your_api_key_here
```

**Provider Recommendations:**
- **Fast2SMS**: Best for India, affordable (~0.15 INR/SMS)
- **MSG91**: Enterprise solution for India (~0.18 INR/SMS)
- **Twilio**: Global coverage, premium quality (~$0.0075/SMS)
- **TextLocal**: Reliable India service (~0.20 INR/SMS)
- **Development**: Logs OTP to console (default)

### Testing the Authentication Flow

1. **Navigate to `/login`**
2. **Enter phone number** and click "Get OTP"
3. **Check console** for development OTP (e.g., "OTP for 9876543210: 1234")
4. **Enter OTP** and verify
5. **For new users**: Complete profile with name and address
6. **For existing users**: Direct login

### Security Features

- OTP expires after 5 minutes
- Maximum 5 attempts per OTP
- Password hashing with bcrypt
- JWT token authentication
- Phone number validation
- Pincode validation for delivery area

### Future Enhancements

- Google Maps API integration for production
- SMS gateway integration (Twilio, MSG91)
- Email verification
- Password reset functionality
- Social login options
- Admin user management
