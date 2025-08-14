# AI Customer Support Reply Assistant

A modern SaaS platform that provides AI-powered customer support solutions for businesses. Built with Next.js 15+, TypeScript, Tailwind CSS, PostgreSQL, and Redux Toolkit.

## Features

### ✅ MVP Features (Completed)
- **Authentication System**
  - User registration/signup with company information
  - Secure login/logout with JWT tokens and HTTP-only cookies
  - Password hashing with bcryptjs
  - Protected routes and middleware
  
- **Modern UI/UX**
  - Clean, responsive design with Tailwind CSS
  - Dark/light theme support with system preference detection
  - Toast notifications and alerts
  - Form validation with Zod
  - Beautiful landing page with hero section, features, and testimonials
  - Consistent header design across all pages
  
- **State Management**
  - Redux Toolkit for global state
  - Persistent authentication state
  - Alert/notification system
  
- **Database**
  - PostgreSQL with Prisma ORM
  - Type-safe database operations
  - User and session management
  
- **Testing**
  - Jest setup with React Testing Library
  - Unit tests for authentication utilities
  - Component testing
  - API route testing

- **SEO & Performance**
  - Comprehensive meta tags and structured data
  - Open Graph and Twitter Card support
  - Responsive design optimized for all devices
  - Fast loading with Next.js 15 optimizations

### 🚧 Planned Features
- Company information file upload during signup
- AI assistant for customer queries using company data
- Integration endpoints for websites/apps
- Admin dashboard
- Analytics and reporting
- API rate limiting
- Email verification

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Redux Toolkit
- **Authentication**: JWT + HTTP-only cookies + bcryptjs
- **UI Components**: Radix UI + shadcn/ui components
- **Testing**: Jest + React Testing Library
- **Validation**: Zod
- **Theming**: next-themes with dark/light mode support

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   └── auth/          # Authentication endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication forms
│   ├── common/            # Shared components
│   ├── providers/         # Context providers
│   └── ui/                # Base UI components
├── lib/                   # Utilities and configurations
│   ├── auth/              # Authentication utilities
│   ├── prisma/            # Prisma database client
│   ├── store/             # Redux store and slices
│   ├── seo.ts             # SEO utilities
│   └── utils/             # Helper functions
├── hooks/                 # Custom React hooks
└── __tests__/             # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai_customer_support
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_customer_support"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   BCRYPT_ROUNDS=12
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   COOKIE_NAME="auth-token"
   COOKIE_MAX_AGE=604800
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Management

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations to database
npx prisma migrate deploy

# Push schema changes directly (development only)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Request/Response Examples

#### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Inc"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@company.com",
  "password": "securePassword123"
}
```

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow the existing component structure
- Use Tailwind CSS for styling
- Implement proper error handling
- Write tests for new features

### Database Changes
1. Modify schema in `prisma/schema.prisma`
2. Generate client: `npx prisma generate`
3. Create migration: `npx prisma migrate dev --name <migration-name>`
4. Review generated SQL in `prisma/migrations/` folder
5. Apply migration: `npx prisma migrate deploy` (production)

### State Management
- Use Redux Toolkit for global state
- Keep component state local when possible
- Use the provided hooks: `useAppDispatch`, `useAppSelector`

## Security Features

- Password hashing with bcryptjs
- JWT tokens with secure HTTP-only cookies
- Input validation with Zod schemas
- SQL injection protection with Prisma ORM
- Type-safe API endpoints
- Environment variable validation

## Deployment

### Environment Setup
1. Set up production PostgreSQL database
2. Update environment variables for production
3. Set `NODE_ENV=production`
4. Use strong `JWT_SECRET`

### Build
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
