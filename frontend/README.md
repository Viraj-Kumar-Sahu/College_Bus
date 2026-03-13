# College Bus Management System - Frontend

A modern, full-featured React web application for managing college bus transportation with real-time tracking, attendance management, and role-based dashboards.

## Features

- 🚌 Real-time bus tracking with Google Maps integration
- 👥 Role-based access (Admin, Driver, Student)
- 📊 Comprehensive dashboards for each role
- ✅ Attendance management system
- 🗺️ Route management and visualization
- 📱 Responsive design with Tailwind CSS
- 🔐 JWT-based authentication

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Google Maps JavaScript API
- **State Management**: React Context API

## Prerequisites

- Node.js 18+ and npm/yarn/bun
- A backend API server (see Backend API Requirements below)
- Google Maps API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd college-bus-management
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

## Backend API Requirements

This frontend expects a REST API backend with the following endpoints:

### Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "role": "student" // or "driver" or "admin"
}

Success Response (201 Created):
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-or-int",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student"
  }
}

Error Response (400 Bad Request):
{
  "error": "Email already exists" // or other validation error
}
```

#### 2. Login User
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}

Success Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-or-int",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "busId": "bus-001", // optional, for students/drivers
    "profileImage": "https://..." // optional
  }
}

Error Response (401 Unauthorized):
{
  "error": "Invalid credentials"
}
```

#### 3. Validate Token / Get Current User
```http
GET /auth/me
Authorization: Bearer <jwt-token>

Success Response (200 OK):
{
  "user": {
    "id": "uuid-or-int",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "busId": "bus-001",
    "profileImage": "https://..."
  }
}

Error Response (401 Unauthorized):
{
  "error": "Invalid or expired token"
}
```

### Authentication Flow

1. **Registration**: User fills out the registration form → Frontend sends POST to `/auth/register` → On success, user is redirected to login page
2. **Login**: User enters credentials → Frontend sends POST to `/auth/login` → On success, JWT token and user data are stored in `localStorage` → User is redirected to role-specific dashboard
3. **Protected Routes**: Frontend checks for token in `localStorage` → If token exists, includes it in `Authorization: Bearer <token>` header for all API requests → If token is invalid (401 response), user is redirected to login
4. **Logout**: Frontend clears `localStorage` and redirects to login page

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx          # Login page component
│   ├── dashboards/
│   │   ├── AdminDashboard.tsx     # Admin dashboard
│   │   ├── StudentDashboard.tsx   # Student dashboard
│   │   └── DriverDashboard.tsx    # Driver dashboard
│   ├── forms/                     # Form components
│   ├── layout/
│   │   ├── AppLayout.tsx          # Main layout wrapper
│   │   ├── DashboardLayout.tsx    # Dashboard layout
│   │   └── Sidebar.tsx            # Navigation sidebar
│   ├── map/
│   │   ├── GoogleMap.tsx          # Google Maps integration
│   │   └── LiveMap.tsx            # Live bus tracking
│   ├── navigation/
│   │   └── AppRouter.tsx          # Route configuration
│   └── ui/                        # shadcn/ui components
├── contexts/
│   ├── AuthContext.tsx            # Authentication context
│   └── DataContext.tsx            # Data management context
├── pages/
│   ├── Index.tsx                  # Home page
│   ├── Register.tsx               # Registration page
│   └── NotFound.tsx               # 404 page
├── utils/
│   ├── api.ts                     # Axios instance with interceptors
│   └── auth.ts                    # Auth helper functions
├── hooks/                         # Custom React hooks
├── lib/                           # Utility functions
├── App.tsx                        # Root component
├── main.tsx                       # Entry point
└── index.css                      # Global styles
```

## Authentication & Authorization

### Token Storage
- JWT tokens are stored in `localStorage` under the key `auth_token`
- User data is stored in `localStorage` under the key `user`

### Auth Helper Functions
Located in `src/utils/auth.ts`:
- `setToken(token)` - Store JWT token
- `getToken()` - Retrieve JWT token
- `setUser(user)` - Store user data
- `getUser()` - Retrieve user data
- `getUserRole()` - Get current user's role
- `isAuthenticated()` - Check if user is authenticated
- `logout()` - Clear auth data and redirect to login

### API Client
Located in `src/utils/api.ts`:
- Axios instance pre-configured with base URL
- Automatically includes `Authorization: Bearer <token>` header
- Handles 401 responses by clearing auth and redirecting to login

## Role-Based Access

### Admin Dashboard
- Manage buses, routes, students, and drivers
- View system-wide reports and analytics
- Access all data and configurations

### Driver Dashboard
- View assigned route and stops
- Mark student attendance (boarding/alighting)
- Track bus location and status
- Report issues or emergencies

### Student Dashboard
- View assigned bus and route
- Track bus real-time location
- View personal attendance history
- Receive notifications

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required: Backend API base URL
VITE_API_BASE_URL=http://localhost:8000/api

# Optional: Other configuration
VITE_APP_NAME=College Bus Management
```

## Building for Production

1. Set production environment variables in `.env`:
```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

2. Build the project:
```bash
npm run build
```

3. The built files will be in the `dist/` directory, ready to deploy to any static hosting service (Vercel, Netlify, AWS S3, etc.)

## Security Considerations

- Never commit `.env` files with real credentials
- Always use HTTPS in production
- Implement proper CORS configuration on your backend
- Set appropriate token expiration times
- Validate all user inputs on the backend
- Use secure password hashing (bcrypt, argon2)
- Implement rate limiting on authentication endpoints
- Consider implementing refresh tokens for better security

## Backend Implementation Notes

Your backend should:
1. Use a robust JWT library for token generation/validation
2. Hash passwords securely (bcrypt, argon2, pbkdf2)
3. Validate all input data (email format, password strength, role values)
4. Implement proper error handling and return meaningful messages
5. Use HTTPS in production
6. Set appropriate CORS headers
7. Implement rate limiting on auth endpoints
8. Store user roles securely (consider a separate roles table)
9. Never expose sensitive data in API responses
10. Log authentication attempts for security monitoring

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
