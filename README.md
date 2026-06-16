#  Bike Rental System - Full Stack Application

A complete, production-ready bike rental platform with user authentication, bike inventory management, booking system, reviews, and comprehensive admin dashboard.

---

##  Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Backend Documentation](#backend-documentation)
- [Frontend Documentation](#frontend-documentation)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

##  Project Overview

This is a full-stack bike rental management system designed for:
- **Users:** Browse bikes, make bookings, write reviews, manage profiles
- **Admins:** Manage inventory, approve bookings, view analytics, manage users
- **Operators:** Track revenue, monitor bike availability, handle payment processing

### Key Highlights
-  **Complete API Integration** - Frontend directly connected to backend
-  **Role-Based Access Control** - Separate admin and user interfaces
-  **Secure Authentication** - JWT tokens with httpOnly cookies
-  **Real-time Analytics** - Dashboard with revenue tracking and statistics
-  **Responsive Design** - Works on desktop, tablet, and mobile
-  **Image Management** - Cloudinary integration for bike images
-  **Email Support** - Password reset and notifications

---

## 📁 Project Structure

```
bike-rental-system/
│
├── backend/                          # Express.js API Server
│   ├── config/
│   │   ├── db.js                     # MongoDB connection
│   │   └── cloudinary.js             # Cloudinary setup
│   │
│   ├── controllers/                  # Route handlers
│   │   ├── authController.js         # Auth operations
│   │   ├── bikeController.js         # Bike management
│   │   ├── bookingController.js      # Booking operations
│   │   ├── reviewController.js       # Review management
│   │   └── adminController.js        # Admin operations
│   │
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   ├── errorHandler.js           # Error handling
│   │   ├── notFound.js               # 404 handling
│   │   └── upload.js                 # File upload config
│   │
│   ├── models/                       # Database schemas
│   │   ├── User.js
│   │   ├── Bike.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   └── Payment.js
│   │
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js
│   │   ├── bikeRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── services/
│   │   └── cloudinaryService.js      # Image upload service
│   │
│   ├── utils/
│   │   ├── apiResponse.js            # Response formatter
│   │   ├── appError.js               # Error class
│   │   ├── generateToken.js          # JWT generation
│   │   ├── logger.js                 # Winston logger
│   │   └── sendEmail.js              # Email service
│   │
│   ├── logs/                         # Application logs
│   ├── app.js                        # Express app setup
│   ├── server.js                     # Server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                         # React + Vite Client
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Axios instance
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   │
│   │   ├── components/
│   │   │   ├── Layout.jsx            # Main layout
│   │   │   ├── BikeCard.jsx          # Bike display component
│   │   │   └── UI.jsx                # Reusable UI components
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Home page
│   │   │   ├── AuthPage.jsx          # Login/Register
│   │   │   ├── BikesPage.jsx         # Bike catalog
│   │   │   ├── BikeDetailPage.jsx    # Bike details
│   │   │   ├── BookingsPage.jsx      # User bookings
│   │   │   ├── ProfilePage.jsx       # User profile
│   │   │   └── AdminPage.jsx         # Admin dashboard
│   │   │
│   │   ├── utils/
│   │   │   └── format.js             # Formatting utilities
│   │   │
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── styles.css                # Global styles
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── node_modules/
├── package.json                      # Root scripts
├── package-lock.json
└── README.md                         # This file
```

---

##  Technology Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | v18+ |
| Framework | Express.js | v4.19+ |
| Database | MongoDB | v7+ |
| ODM | Mongoose | v8.4+ |
| Authentication | JWT (jsonwebtoken) | v9.0+ |
| Password Hashing | bcryptjs | v2.4+ |
| Image Storage | Cloudinary | v1.41+ |
| File Upload | Multer | v1.4+ |
| Email | Nodemailer | v6.9+ |
| HTTP Headers | Helmet | v7.1+ |
| CORS | CORS | v2.8+ |
| Logging | Winston | v3.13+ |
| Rate Limiting | express-rate-limit | v7.3+ |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | v18.3+ |
| Build Tool | Vite | v5.4+ |
| Router | React Router | v6.26+ |
| HTTP Client | Axios | v1.7+ |
| Styling | CSS3 | Native |
| Date Utils | date-fns | v3.6+ |

---

##  Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)
- SMTP email service (for password reset emails)

### Step 1: Clone and Initial Setup

```bash
# Navigate to project directory
cd "Bike rental system"

# Install all dependencies (root, backend, and frontend)
npm run install-all
```

### Step 2: Backend Configuration

1. Create `.env` file in the `backend/` folder:

```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your credentials:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bike-rental?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# CORS
CLIENT_URL=http://localhost:5173

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@bikerental.com
```

3. Install backend dependencies:

```bash
npm install
```

### Step 3: Frontend Configuration

1. Create `.env` file in the `frontend/` folder:

```bash
cd ../frontend
cp .env.example .env
```

2. Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

3. Install frontend dependencies:

```bash
npm install
```

---

##  Backend Documentation

### Running Backend

```bash
cd backend

# Development (with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000/api`

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Key Features

 **Authentication**
- User registration and login
- JWT token generation
- Password reset via email
- Session persistence with httpOnly cookies

 **Bike Management**
- Full CRUD operations
- Image uploads to Cloudinary
- Search and filtering
- Availability tracking
- Rating and review integration

 **Booking System**
- Create bookings with date range validation
- Prevent overlapping bookings
- Auto-calculate rental costs
- Payment tracking
- Admin approval workflow

 **Review System**
- Users can review bikes they've rented
- Rating aggregation
- Admin moderation support

 **Admin Dashboard**
- Real-time statistics
- Revenue analytics (monthly/total)
- User management (block/unblock)
- Booking approval workflow
- Top bikes analytics

### Security Features

-  bcrypt password hashing
-  JWT authentication with expiry
-  Helmet for HTTP headers
-  CORS protection
-  NoSQL injection prevention via mongo-sanitize
-  Rate limiting on auth endpoints (20 requests/15 mins)
-  General rate limiting (100 requests/15 mins)

### Error Handling

All endpoints return consistent JSON responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "meta": { /* pagination if applicable */ }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* validation errors */ }
}
```

---

##  Frontend Documentation

### Running Frontend

```bash
cd frontend

# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The client will be available at `http://localhost:5173`

### Project Structure

**Pages:**
- `Home.jsx` - Dashboard with featured bikes and statistics
- `AuthPage.jsx` - Login/register interface
- `BikesPage.jsx` - Bike catalog with search and filters
- `BikeDetailPage.jsx` - Bike details, booking form, and reviews
- `BookingsPage.jsx` - User's booking history
- `ProfilePage.jsx` - User profile and password management
- `AdminPage.jsx` - Admin dashboard with analytics

**Components:**
- `Layout.jsx` - Main navigation and layout
- `BikeCard.jsx` - Bike display card component
- `UI.jsx` - Reusable UI components (Card, Pill, Stat, EmptyState)

**Context:**
- `AuthContext.jsx` - Centralized auth state and token management

**API Client:**
- Auto-attaches JWT tokens to requests
- Handles 401 errors with auto-logout
- BaseURL configuration via .env

### Features

 **User Interface**
- Dark theme with glassmorphism
- Responsive grid layout (desktop, tablet, mobile)
- Smooth navigation with React Router

 **Authentication**
- Register with email, phone, name, password
- Login with email and password
- Auto-logout on token expiry
- Session persistence via localStorage

 **Bike Browsing**
- Real-time search
- Filter by category, fuel type, price range
- Pagination (24 items per page)
- Sort by rating, newest, price

 **Booking**
- Date range selection
- Pickup/dropoff location specification
- Payment method choice (cash, online, card)
- Real-time cost calculation
- Booking status tracking

 **Reviews**
- Star rating (1-5)
- Review text and title
- One review per user per bike
- Review history display

 **Admin Dashboard**
- Key metrics (users, bikes, bookings, revenue)
- User management with block/unblock
- Booking approval workflow
- Revenue analytics

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - User login
POST   /api/auth/logout                - User logout (protected)
GET    /api/auth/profile               - Get current user (protected)
PUT    /api/auth/profile               - Update profile (protected)
PUT    /api/auth/change-password       - Change password (protected)
POST   /api/auth/forgot-password       - Request password reset
POST   /api/auth/reset-password/:token - Reset password with token
```

### Bikes

```
GET    /api/bikes                      - Get all bikes (search, filter, pagination)
GET    /api/bikes/:id                  - Get bike details
POST   /api/bikes                      - Create bike (admin only)
PUT    /api/bikes/:id                  - Update bike (admin only)
DELETE /api/bikes/:id                  - Delete bike (admin only)
PUT    /api/bikes/:id/availability     - Toggle availability (admin only)
```

### Bookings

```
POST   /api/bookings                   - Create booking (protected)
GET    /api/bookings/my                - Get user's bookings (protected)
GET    /api/bookings/:id               - Get booking details (protected)
GET    /api/bookings                   - Get all bookings (admin only)
PUT    /api/bookings/:id/approve       - Approve booking (admin only)
PUT    /api/bookings/:id/reject        - Reject booking (admin only)
PUT    /api/bookings/:id/complete      - Complete booking (admin only)
PUT    /api/bookings/:id/cancel        - Cancel booking (protected)
```

### Reviews

```
POST   /api/reviews                    - Create review (protected)
GET    /api/reviews/bike/:bikeId       - Get bike reviews
PUT    /api/reviews/:id                - Update review (protected)
DELETE /api/reviews/:id                - Delete review (protected)
GET    /api/reviews                    - Get all reviews (admin only)
```

### Admin

```
GET    /api/admin/dashboard            - Get dashboard stats (admin only)
GET    /api/admin/users                - Get all users (admin only)
GET    /api/admin/users/:id            - Get user details (admin only)
PUT    /api/admin/users/:id/block      - Block/unblock user (admin only)
DELETE /api/admin/users/:id            - Delete user (admin only)
```

---

## ✨ Features

### User Features

| Feature | Status | Details |
|---------|--------|---------|
| User Registration |  | Email, phone, name, password validation |
| User Login |  | Email/password auth with JWT |
| Password Reset |  | Email-based token reset |
| Profile Management |  | Update name, phone, address, avatar |
| Password Change |  | Secure password update |
| Bike Browsing |  | Search, filter, sort, pagination |
| Bike Details |  | Full specs, images, reviews, availability |
| Booking Creation |  | Date selection, cost calculation |
| Booking History |  | Track all bookings and status |
| Reviews |  | Rate and review bikes |
| Notifications |  | Email on booking status changes |

### Admin Features

| Feature | Status | Details |
|---------|--------|---------|
| Dashboard Analytics |  | Users, bikes, revenue, bookings |
| Revenue Tracking |  | Monthly revenue, total revenue |
| User Management |  | View, block, delete users |
| Bike Management |  | Create, edit, delete, toggle availability |
| Booking Approval |  | Review, approve, reject bookings |
| Booking Completion |  | Mark rentals as complete |
| Top Bikes Analytics |  | Most booked bikes |
| Monthly Analytics |  | Revenue and bookings by month |

---

##  Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String (10 digits),
  password: String (bcrypt-hashed),
  role: String (enum: ['user', 'admin']),
  avatar: {
    public_id: String,
    url: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  drivingLicense: {
    number: String,
    expiryDate: Date
  },
  isBlocked: Boolean,
  isEmailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Bike Collection

```javascript
{
  _id: ObjectId,
  name: String,
  brand: String,
  model: String,
  year: Number,
  category: String (enum: ['Sport', 'Cruiser', 'Adventure', ...]),
  registrationNumber: String (unique),
  engineCapacity: Number,
  fuelType: String (enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']),
  mileage: Number,
  pricePerDay: Number,
  securityDeposit: Number,
  description: String,
  features: [String],
  images: [{
    public_id: String,
    url: String
  }],
  isAvailable: Boolean,
  location: String,
  condition: String (enum: ['Excellent', 'Good', 'Fair']),
  totalBookings: Number,
  averageRating: Number,
  totalReviews: Number,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  bike: ObjectId (ref: Bike),
  startDate: Date,
  endDate: Date,
  totalDays: Number,
  pricePerDay: Number,
  securityDeposit: Number,
  subtotal: Number,
  totalAmount: Number,
  bookingStatus: String (enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled']),
  paymentStatus: String (enum: ['unpaid', 'paid', 'refunded', 'partial']),
  paymentMethod: String (enum: ['cash', 'online', 'card']),
  pickupLocation: String,
  dropoffLocation: String,
  notes: String,
  adminNotes: String,
  approvedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  completedAt: Date,
  cancelledBy: String (enum: ['user', 'admin']),
  cancellationReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  bike: ObjectId (ref: Bike),
  booking: ObjectId (ref: Booking),
  rating: Number (1-5),
  title: String,
  comment: String,
  isVisible: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Collection

```javascript
{
  _id: ObjectId,
  booking: ObjectId (ref: Booking),
  user: ObjectId (ref: User),
  amount: Number,
  currency: String,
  paymentMethod: String (enum: ['cash', 'online', 'card', 'upi']),
  paymentStatus: String (enum: ['pending', 'completed', 'failed', 'refunded']),
  transactionId: String,
  paymentGateway: String,
  refundAmount: Number,
  refundedAt: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

##  Authentication Flow

### JWT Token Flow

```
1. User registers/logs in
   ↓
2. Server validates credentials and generates JWT
   ↓
3. JWT sent in response and stored in:
   - localStorage (for API requests)
   - httpOnly cookie (for security)
   ↓
4. Frontend sends JWT in Authorization header for protected routes
   ↓
5. Backend verifies JWT and extracts user info
   ↓
6. Request processed with user context
   ↓
7. On token expiry: automatic logout and redirect to auth
```

### Protected Routes

**Frontend:**
- `/bookings` - Requires user login
- `/profile` - Requires user login
- `/admin` - Requires admin role

**Backend:**
- All routes prefixed with `POST /api/bookings` - Requires auth
- All routes prefixed with `GET /api/admin` - Requires admin auth
- All routes prefixed with `PUT /api/admin` - Requires admin auth

---

##  Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Run Both Simultaneously (if concurrently is installed)

From root directory:
```bash
npm run dev
```

### Option 3: Production Build

**Build frontend:**
```bash
cd frontend
npm run build
```

**Run backend in production:**
```bash
cd backend
NODE_ENV=production npm start
```

Then serve the built frontend from a static server or the backend.

---

##  Troubleshooting

### Issue: CORS Error

**Cause:** Frontend and backend URLs don't match

**Solution:**
```bash
# Ensure in backend/.env
CLIENT_URL=http://localhost:5173

# Ensure in frontend/.env
VITE_API_URL=http://localhost:5000/api
```

### Issue: MongoDB Connection Failed

**Cause:** Invalid connection string or IP not whitelisted

**Solution:**
1. Verify `MONGODB_URI` in `backend/.env`
2. In MongoDB Atlas, add your IP to IP Whitelist
3. For development, you can use `0.0.0.0/0` (all IPs)

### Issue: Authentication Fails

**Cause:** JWT_SECRET not set or mismatch

**Solution:**
```bash
# In backend/.env, ensure JWT_SECRET is set
JWT_SECRET=your_very_long_random_secret_key_minimum_32_chars

# Restart backend server
```

### Issue: Image Upload Fails

**Cause:** Invalid Cloudinary credentials

**Solution:**
1. Verify Cloudinary credentials in `backend/.env`
2. Ensure account has API access enabled
3. Check rate limits on Cloudinary account

### Issue: Password Reset Email Not Received

**Cause:** Invalid SMTP configuration

**Solution:**
1. Verify SMTP credentials in `backend/.env`
2. For Gmail: Use app-specific password, not account password
3. Enable "Less secure app access" if using Gmail

### Issue: Booking Creation Fails

**Cause:** Overlapping bookings or dates

**Solution:**
- End date must be after start date
- Start date cannot be in the past
- Check if bike is already booked for those dates

---

##  API Response Examples

### Successful Response

```json
{
  "success": true,
  "message": "Bikes fetched successfully",
  "data": [
    {
      "_id": "60d5ec49c1234567890abc1",
      "name": "Royal Enfield Classic 350",
      "brand": "Royal Enfield",
      "pricePerDay": 800,
      "isAvailable": true,
      "averageRating": 4.5
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": {
    "email": "Email is required",
    "password": "Password must be at least 6 characters"
  }
}
```

---

##  Default Admin Account

To access admin features:

1. Register a user account normally
2. Update the user in database to have admin role:

```bash
# Using MongoDB CLI
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Or seed via code:

```javascript
// In your database seed file
await User.create({
  name: 'Admin',
  email: 'admin@bikerental.com',
  password: 'Admin@123',
  phone: '9999999999',
  role: 'admin',
});
```

---

##  Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Authentication](https://jwt.io/)
- [Vite Guide](https://vitejs.dev/)

---

##  License

This project is open source and available under the ISC License.

---

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

##  Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Last Updated:** June 2026
**Version:** 1.0.0
**Status:** Production Ready 
