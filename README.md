# Makora - AI Customer Support Reply Assistant

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
  - **Colorful Dashboard Design** with gradient backgrounds and animations
  
- **Company Data Management**
  - **Manual File Upload**: Upload text files containing company information
  - **Automatic Website Extraction**: Extract content from any website URL automatically
  - Intelligent content parsing that filters out navigation, ads, and irrelevant content
  - Extracts page titles, meta descriptions, headings, and main content
  - Dual-option interface with tabbed selection between manual and automatic methods
  
- **Advanced AI Chat Features**
  - **Copy & Edit AI Responses**: Users can copy AI replies to clipboard or edit them inline
  - **Regenerate Responses**: Option to generate new AI responses for the same question
  - **Reply Count Tracking**: Automatic tracking of AI response generations for billing purposes
  - Interactive chat interface with enhanced user controls
  - Real-time reply counter displayed on dashboard
  
- **Enhanced Dashboard**
  - **Colorful Design System**: Gradient backgrounds, animated blobs, and vibrant cards
  - **Four-Section Layout**: Profile, Company Data, Quick Start, and AI Usage tracking
  - **Real-time Usage Analytics**: Track AI reply generations with visual counters
  - **Responsive Grid System**: Optimized for desktop and mobile viewing
  
- **State Management**
  - Redux Toolkit for global state
  - Persistent authentication state
  - Alert/notification system
  
- **Database**
  - PostgreSQL with Prisma ORM
  - Type-safe database operations
  - User and session management
  - **AI Reply Tracking**: Database schema for tracking AI usage and billing
  
- **Web Scraping & Content Processing**
  - **Cheerio-based HTML parsing** for intelligent content extraction
  - **Content cleaning algorithms** that remove unwanted elements
  - **URL validation and timeout handling** for robust website processing
  - **Structured content extraction** with metadata preservation
  
<!-- Testing section removed as tests were stripped from the repo -->

- **SEO & Performance**
  - Comprehensive meta tags and structured data
  - Open Graph and Twitter Card support
  - Responsive design optimized for all devices
  - Fast loading with Next.js 15 optimizations

### 🚧 Planned Features
- Email verification
- Integration endpoints for websites/apps
- Admin dashboard
- Enhanced analytics and reporting
- API rate limiting
- Multi-language support
- Email verification

## Tech Stack

- **Framework**: Next.js 15+ (App Router) with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Redux Toolkit with persistence
- **Authentication**: JWT + HTTP-only cookies + bcryptjs
- **UI Components**: Radix UI + shadcn/ui components
- **Web Scraping**: Cheerio for HTML parsing and content extraction
<!-- Testing tooling removed -->
- **Validation**: Zod
- **Theming**: next-themes with dark/light mode support
- **Icons**: Lucide React for consistent iconography

## Recent Updates (August 2025)

### 🚀 Major Feature Additions

#### 1. **Website Content Extraction**
- **Automatic Content Scraping**: Enter any website URL and automatically extract relevant content
- **Intelligent Parsing**: Uses Cheerio to parse HTML and extract main content while filtering out navigation, ads, and irrelevant sections
- **Content Optimization**: Extracts page titles, meta descriptions, headings, and main content in a structured format
- **Dual Input Options**: Choose between manual file upload or automatic website extraction

#### 2. **Enhanced AI Chat Experience**
- **Interactive Response Management**: Copy, edit, and regenerate AI responses
- **Inline Editing**: Edit AI responses directly in the chat interface with save/cancel options
- **Response Regeneration**: Generate alternative responses for the same question
- **Usage Tracking**: Automatic tracking of AI response generations for billing and analytics

#### 3. **Colorful Dashboard Redesign**
- **Visual Enhancement**: Gradient backgrounds, animated elements, and vibrant color schemes
- **Improved UX**: Four-card layout with distinct color coding for different sections
- **Real-time Analytics**: Live tracking of AI usage with visual counters
- **Responsive Design**: Optimized for all screen sizes with smooth animations

#### 4. **Advanced Content Management**
- **Flexible Data Input**: Support for both manual file uploads and automatic website content extraction
- **Content Validation**: URL validation, content length checks, and error handling
- **Structured Storage**: Organized content storage with metadata preservation

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── website-extract/ # Website content extraction API
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Enhanced dashboard with colorful design
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication forms
│   ├── dashboard/         # Dashboard components
│   │   ├── AIChatDialog.tsx      # Enhanced chat with copy/edit/regenerate
│   │   ├── WebsiteExtractor.tsx  # Website content extraction
│   │   └── CompanyDataUpload.tsx # Manual file upload
│   ├── common/            # Shared components
│   ├── providers/         # Context providers
│   └── ui/                # Base UI components (Radix UI + shadcn)
├── lib/                   # Utilities and configurations
│   ├── auth/              # Authentication utilities
│   ├── prisma/            # Prisma database client with enhanced schema
│   ├── store/             # Redux store and slices
│   ├── design-system.ts   # Centralized design system with gradients and animations
│   ├── seo.ts             # SEO utilities
│   └── utils/             # Helper functions
├── hooks/                 # Custom React hooks
└── (tests removed)        # Test files removed from this repo
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

Testing artifacts and Jest configuration were removed from this repository per project cleanup.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Company Data Management
- `POST /api/website-extract` - Extract content from website URL
- `POST /api/company-data/upload` - Upload company data file (if implemented)

## Feature Usage

### 🌐 Website Content Extraction
1. **Navigate to Dashboard**: Login and go to the dashboard
2. **Access Company Data Card**: Find the "Company Information" card
3. **Click "Add Company Data"**: Opens the data input modal
4. **Choose "Extract from Website"**: Select the website extraction tab
5. **Enter Website URL**: Input any public website URL (e.g., https://example.com)
6. **Click "Extract"**: The system will automatically:
   - Fetch the website content
   - Parse and clean the HTML
   - Extract main content, titles, and headings
   - Store the processed content in the database
7. **Success Confirmation**: See a success message with content length details

### 💬 Enhanced AI Chat Features
1. **Open Chat**: Click "Chat with AI Assistant" in the Quick Start card
2. **Ask Questions**: Type your customer service related questions
3. **Interact with Responses**: Each AI response includes:
   - **Copy Button**: Copy the response to clipboard
   - **Edit Button**: Modify the response inline with save/cancel options
   - **Regenerate Button**: Generate a new response for the same question
4. **Track Usage**: See live reply count updates in the AI Usage card

### 📊 Dashboard Analytics
- **Profile Information**: View your account details and company info
- **Company Data Status**: See whether company data is uploaded and manage it
- **AI Usage Tracking**: Monitor reply generation count for billing purposes
- **Quick Actions**: Access all main features from centralized dashboard

### Request/Response Examples

#### Website Extraction
```bash
POST /api/website-extract
Content-Type: application/json
Cookie: auth-token=<jwt-token>

{
  "websiteUrl": "https://example.com"
}

# Response
{
  "success": true,
  "data": {
    "websiteUrl": "https://example.com",
    "contentLength": 2548,
    "extractedAt": "2025-08-16T10:30:00Z"
  }
}
```

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
