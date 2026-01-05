# GitHub Copilot Instructions - Creative Connect Backend

## Project Overview

**Creative Connect Platform** is an AI-powered creative opportunity engine backend built with Node.js and Express. This is a REST API backend, NOT a Nuxt/frontend application. The platform launches Valentine's Day 2026.

**Tech Stack:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken + bcryptjs)
- **Payments:** Stripe API
- **Deployment:** Render.com (NOT Netlify)

## Project Structure

```
creative-connect-backend/
├── server.js              # Main Express application entry point
├── routes/                # API route handlers
│   ├── auth.js           # Authentication endpoints
│   ├── dashboard.js      # Dashboard API
│   ├── payment.js        # Stripe integration
│   ├── va-system.js      # Virtual assistant system
│   └── content-kits.js   # Digital products
├── models/               # Mongoose schemas
│   └── Employee.js       # User/Employee model
├── middleware/           # Express middleware
│   └── auth.js          # JWT verification & RBAC
├── scripts/             # Utility scripts
├── public/              # Static files (landing page)
└── package.json         # Dependencies and scripts
```

## Development Commands

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Production
npm start

# Run tests
npm test

# Lint code
npm run lint

# Seed database
npm run seed
```

## Code Style & Conventions

### JavaScript Standards
- Use ES6+ features (const/let, arrow functions, async/await)
- Use explicit error handling with try/catch blocks
- Always validate input using express-validator
- Use destructuring for cleaner code

### API Response Format
All API responses should follow this structure:
```javascript
// Success
{ success: true, data: {...}, message: 'Optional message' }

// Error
{ success: false, message: 'Error description', error: 'Details' }
```

### Authentication
- All protected routes use JWT middleware from `middleware/auth.js`
- Use `authenticateToken` middleware for protected endpoints
- Use `authorizeRoles(['Admin', 'Manager'])` for role-based access

### Database
- Use Mongoose for all database operations
- Always use proper schema validation
- Use async/await for database operations
- Handle connection errors gracefully

### Error Handling
- Use centralized error handler in server.js
- Log errors with descriptive messages
- Return appropriate HTTP status codes
- Never expose sensitive error details in production

## Security Best Practices

1. **Environment Variables:** Always use `.env` file, never hardcode secrets
2. **Helmet.js:** Security headers are configured in server.js
3. **CORS:** Configure allowed origins properly
4. **Rate Limiting:** Use express-rate-limit on sensitive endpoints
5. **Input Validation:** Use express-validator on all user inputs
6. **JWT:** Use secure secrets, set proper expiration times
7. **Password Hashing:** Always use bcryptjs with proper salt rounds

## API Routes Structure

### Authentication (`/api/auth`)
- POST `/register` - Register new employee (Admin only)
- POST `/login` - Employee login
- POST `/refresh-token` - Refresh JWT
- GET `/me` - Get current user
- POST `/change-password` - Update password

### Dashboard (`/api/dashboard`)
- GET `/overview` - Dashboard statistics
- GET `/team` - Team members list
- PUT `/employee/:id` - Update employee
- GET `/division/:code` - Division statistics

### Payments (`/api/payments`)
- GET `/products` - List products
- POST `/create-checkout` - Create Stripe checkout
- POST `/webhook` - Stripe webhook handler
- GET `/stats` - Revenue statistics

### Virtual Assistant (`/api/va`)
- GET `/dashboard` - VA task dashboard
- POST `/tasks` - Create task
- GET `/tasks` - List tasks
- PATCH `/tasks/:id` - Update task status

### Content Kits (`/api/content-kits`)
- GET `/` - List all kits
- GET `/:id` - Kit details
- GET `/download/:token` - Download verification

## Brand Guidelines

**Color Codes (for UI/frontend integration):**
- Neon Aqua: #00F5FF
- Neon Violet: #7B2CFF
- Midnight Black: #000000

**Division Colors:**
- COO (Operations): Steel #708090
- CMO (Marketing): Violet #7B2CFF
- CTO (Technology): Blue #0066FF
- SMD (Social Media): Aqua #00F5FF
- CCRO (Creator Relations): Coral #FF6B6B

## Environment Variables

Required environment variables (see `.env.example`):
- `NODE_ENV` - development/production
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `OPENAI_API_KEY` - OpenAI API key (for AI features)
- `FRONTEND_URL` - Frontend application URL
- `ALLOWED_ORIGINS` - CORS allowed origins

## Testing

- Use Jest for unit tests
- Use Supertest for API endpoint testing
- Test files should be named `*.test.js`
- Mock external services (Stripe, email) in tests
- Aim for meaningful test coverage on critical paths

## Database Models

### Employee Schema
Primary user model with fields:
- Basic info: name, email, phone, password
- Role: Admin, Manager, Employee, VA
- Division: COO, CMO, CTO, SMD, CCRO
- Status: active, inactive, pending
- Timestamps: createdAt, updatedAt

## Common Pitfalls to Avoid

1. **NOT a Nuxt/Frontend App:** This is a backend API only, no SSR/SSG
2. **NOT Netlify:** Deploy to Render.com, configuration in `render.yaml`
3. **MongoDB Required:** Don't assume SQL database patterns
4. **JWT in Headers:** Use `Authorization: Bearer <token>` format
5. **Async Operations:** Always use async/await with proper error handling
6. **Environment:** Never commit `.env` file or secrets

## Deployment

- **Platform:** Render.com (NOT Netlify)
- **Configuration:** `render.yaml` in root
- **Build:** `npm install`
- **Start:** `node server.js`
- **Health Check:** `/api/health` endpoint

## Additional Notes

- **Platform Launch Target:** Valentine's Day 2026 (February 14, 2026)
- **Project Timeline:** As documented in README and server.js (MVP development phase)
- License: Proprietary
- Platform focus: Creative professionals, designers, content creators
