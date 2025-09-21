# Muta7Market - Sports Professionals Marketplace

A comprehensive marketplace platform connecting sports professionals (players and coaches) with clubs and organizations. The platform facilitates discovery, hiring, and transfer processes in the sports industry.

## 🏗️ Architecture

The project consists of three main components:

- **Backend** - RESTful API server built with Node.js and Express
- **Frontend** - User-facing Next.js application for browsing profiles
- **Dashboard** - Admin panel built with Next.js for platform management

## ✨ Features

### Core Features

- **Player Profiles** - Comprehensive profiles with experience, position, salary expectations, media portfolios
- **Coach Profiles** - Professional coach profiles with licenses, achievements, and experience history
- **Sports Management** - Multi-sport support with customizable positions and role types
- **Transfer System** - Complete transfer and hiring workflow
- **Payment Processing** - Integrated payment system with invoicing
- **Promotion System** - Featured listings and premium promotions

### Advanced Features

- **Multilingual Support** - Full Arabic and English localization
- **Media Management** - Video, image, and document uploads via Cloudinary
- **Analytics & Monitoring** - Comprehensive tracking and reporting
- **Notification System** - Real-time notifications via OneSignal
- **Search & Filtering** - Advanced search capabilities with multiple filters
- **SEO Optimization** - Meta tags and structured data for better discoverability

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js (ES6+ modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Storage**: Cloudinary
- **Email**: SendGrid & Nodemailer
- **Caching**: Redis
- **Real-time**: Socket.io
- **API Documentation**: Swagger
- **Validation**: Joi
- **Security**: Helmet, Rate limiting, CORS

### Frontend

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with TanStack Query
- **Internationalization**: Next-intl
- **Animations**: Framer Motion

### Dashboard

- **Framework**: Next.js 15
- **UI Library**: Custom admin components
- **Charts**: ApexCharts, Recharts
- **Calendar**: FullCalendar
- **Maps**: React JVector Map
- **File Upload**: React Dropzone
- **Rich Text Editor**: React Quill

## 📁 Project Structure

```
Muta7Market/
├── Backend/                 # Node.js API Server
│   ├── src/
│   │   ├── config/         # Database, email, cloud storage configs
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Authentication, validation, rate limiting
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── validators/     # Request validation schemas
│   ├── scripts/            # Database migration and utility scripts
│   └── uploads/            # Local file storage
├── Frontend/               # User-facing Next.js app
│   ├── src/
│   │   ├── app/           # Next.js 13+ app directory
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── stores/        # Zustand stores
│   │   └── utils/         # Helper functions
│   └── public/            # Static assets
└── Dashboard/              # Admin dashboard Next.js app
    ├── src/
    │   ├── app/           # Admin pages and layouts
    │   ├── components/    # Dashboard-specific components
    │   ├── context/       # Admin contexts
    │   ├── hooks/         # Dashboard hooks
    │   └── layout/        # Dashboard layouts
    └── public/            # Dashboard assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (≥16.0.0)
- npm (≥8.0.0)
- MongoDB
- Redis (optional, for caching)

### Environment Variables

Create `.env` files in each directory with the following variables:

#### Backend (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/muta7market

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SENDGRID_API_KEY=your-sendgrid-key

# Redis (optional)
REDIS_URL=redis://localhost:6379

# OneSignal
ONESIGNAL_APP_ID=your-app-id
ONESIGNAL_API_KEY=your-api-key
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Dashboard (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
```

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Muta7Market
   ```

2. **Backend Setup**

   ```bash
   cd Backend
   npm install
   npm run seed  # Optional: Seed database with initial data
   npm run dev   # Development mode
   ```

3. **Frontend Setup**

   ```bash
   cd Frontend
   npm install
   npm run dev   # Runs on http://localhost:3000
   ```

4. **Dashboard Setup**
   ```bash
   cd Dashboard
   npm install
   npm run dev   # Runs on http://localhost:3001
   ```

## 📚 API Documentation

Once the backend is running, access the API documentation at:

- **Swagger UI**: `http://localhost:5000/api-docs`

## 🔧 Development Scripts

### Backend

- `npm run dev` - Development mode with nodemon
- `npm run start` - Production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run seed` - Seed database
- `npm run sync-indexes` - Sync MongoDB indexes

### Frontend & Dashboard

- `npm run dev` - Development mode
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🐳 Docker Support

The backend includes Docker support:

```bash
cd Backend
npm run docker:build
npm run docker:run
# Or use docker-compose
npm run docker:compose
```

## 🌐 Deployment

### Backend Deployment

- Supports PM2 for process management
- Includes production setup scripts
- Environment-specific configurations

### Frontend/Dashboard Deployment

- Optimized for Vercel deployment
- Static generation support
- CDN-ready asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions:

- Check the API documentation
- Review the codebase documentation
- Open an issue in the repository

---

**Note**: This is a professional sports marketplace platform designed to connect athletes, coaches, and sports organizations efficiently and securely.
