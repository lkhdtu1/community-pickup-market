# Community Pickup Market

A full-stack e-commerce platform connecting local producers with consumers, built with modern web technologies and best practices.

## Table of Contents
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Design Patterns](#design-patterns)
- [UML Diagrams](#uml-diagrams)

## Architecture

The system follows a modern microservices architecture with clear separation of concerns:

### Frontend (React + TypeScript)
- Built with React 18 and TypeScript for type safety
- Uses Vite as the build tool for fast development and optimized production builds
- Implements modern UI components using Radix UI and Tailwind CSS
- State management with React Query for server state
- Form handling with React Hook Form and Zod validation

### Backend (Node.js + Express + TypeScript)
- RESTful API built with Express.js and TypeScript
- PostgreSQL database with TypeORM for data persistence
- Redis for caching and session management
- JWT for authentication
- Stripe integration for payments
- Nodemailer for email notifications

## Technology Stack

### Frontend Technologies
- **React**: Chosen for its component-based architecture, large ecosystem, and excellent developer experience
- **TypeScript**: Provides static typing and better code maintainability
- **Vite**: Offers faster development experience and optimized builds
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Radix UI**: Unstyled, accessible components for building high-quality design systems
- **React Query**: Efficient server state management
- **React Router**: Client-side routing
- **Zod**: TypeScript-first schema validation

### Backend Technologies
- **Node.js**: Chosen for its non-blocking I/O and excellent performance
- **Express**: Lightweight and flexible web framework
- **TypeScript**: Type safety and better code organization
- **PostgreSQL**: Robust relational database with excellent performance
- **TypeORM**: Type-safe ORM for database operations
- **Redis**: In-memory data store for caching and session management
- **JWT**: Secure token-based authentication
- **Stripe**: Industry-standard payment processing
- **Nodemailer**: Reliable email delivery

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone -b TAM1 https://github.com/lkhdtu1/community-pickup-market.git
cd community-pickup-market
```

2. Install dependencies:
```bash
npm install
cd server
npm install
```

3. Set up environment variables:
Create a `.env` file in the server directory with the following content:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=community_market
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@community-pickup-market.com
```

4. Start the development servers:
```bash
# Terminal 1 (Backend)
cd server
npm run dev

# Terminal 2 (Frontend)
cd ..
npm run dev
```

## Database Setup

1. Create the database:
```bash
sudo -u postgres createdb community_market
```

2. The database schema will be automatically created by TypeORM migrations when the server starts.

## Security Features

The application implements several security measures:

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - Password hashing with bcrypt
   - Session management with Redis

2. **API Security**
   - CORS protection
   - Rate limiting
   - Input validation with express-validator
   - SQL injection prevention through TypeORM
   - XSS protection through proper input sanitization

3. **Data Protection**
   - Environment variables for sensitive data
   - Secure password storage
   - HTTPS enforcement in production
   - Stripe integration for secure payments

## Testing

The project includes comprehensive testing:

1. **Frontend Tests**
   - Unit tests with Jest
   - Integration tests
   - E2E tests

2. **Backend Tests**
   - API tests
   - Unit tests
   - Integration tests

Run tests with:
```bash
# Frontend tests
npm test

# Backend tests
cd server
npm test
```

## Deployment

The application can be deployed using Docker:

1. Build the Docker images:
```bash
docker-compose build
```

2. Run the containers:
```bash
docker-compose up
```

## Design Patterns

The project implements several design patterns:

1. **MVC Pattern**
   - Models: TypeORM entities
   - Views: React components
   - Controllers: Express route handlers

2. **Repository Pattern**
   - Data access abstraction through TypeORM repositories

3. **Singleton Pattern**
   - Database connection management
   - Redis client management

4. **Strategy Pattern**
   - Payment processing strategies
   - Authentication strategies

5. **Observer Pattern**
   - Event handling in React components
   - WebSocket notifications

## UML Diagrams

The project includes the following UML diagrams (in the `docs` directory):

1. **Use Case Diagram**
   - Shows interactions between users and the system
   - Covers main features like authentication, shopping, and order management

2. **Class Diagram**
   - Illustrates the system's class structure
   - Shows relationships between entities

3. **Sequence Diagrams**
   - Order processing flow
   - Authentication flow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
