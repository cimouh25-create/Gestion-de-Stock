# Authentication System Implementation Guide

## Overview
Complete authentication system with Sign In and Sign Up functionality has been implemented for the Gestion de Stock application.

## Features Implemented

### Backend (Django)

#### 1. **User Model** (`backend/users/models.py`)
- Extends Django's AbstractUser
- Custom fields: `role`, `telephone`
- Roles: admin, gestionnaire, lecteur

#### 2. **Serializers** (`backend/users/serializers.py`)
- `UserSerializer`: Serialize user data
- `UserRegistrationSerializer`: Handle user registration with password validation
- `CustomTokenObtainPairSerializer`: Custom JWT token with user info
- `UserLoginSerializer`: Login validation
- `PasswordChangeSerializer`: Password change validation

#### 3. **Views** (`backend/users/views.py`)
- `CustomTokenObtainPairView`: Enhanced login endpoint
- `UserViewSet`: User management with custom actions:
  - `register`: Create new user account
  - `me`: Get current user profile
  - `update_profile`: Update user profile
  - `change_password`: Change password

#### 4. **API Endpoints** (`backend/users/urls.py`)
```
POST   /api/users/register/             - Register new user
POST   /api/auth/login/                 - Login (returns JWT tokens)
GET    /api/users/me/                   - Get current user profile
PUT    /api/users/update_profile/       - Update profile
POST   /api/users/change_password/      - Change password
POST   /api/auth/refresh/               - Refresh access token
POST   /api/auth/verify/                - Verify token
```

### Frontend (React)

#### 1. **AuthService** (`frontend/src/services/authService.js`)
- Handles all API communication
- Token management (storage, retrieval)
- User data persistence
- Methods: `register()`, `login()`, `logout()`, `getCurrentUser()`, `changePassword()`

#### 2. **AuthContext** (`frontend/src/contexts/AuthContext.jsx`)
- Manages global auth state
- Providers: `user`, `isAuthenticated`, `loading`, `error`
- Actions: `register()`, `login()`, `logout()`, `updateProfile()`, `changePassword()`
- Hook: `useAuth()`

#### 3. **Pages**
- **SignIn** (`frontend/src/pages/SignIn.jsx`)
  - Modern UI with gradient background
  - Form validation
  - Error handling
  - Remember me & forgot password links
  
- **SignUp** (`frontend/src/pages/SignUp.jsx`)
  - Two-step form layout
  - Real-time field validation
  - Password strength indicator
  - Role selection
  - Terms & conditions acceptance

#### 4. **ProtectedRoute** (`frontend/src/components/ProtectedRoute.jsx`)
- Route protection component
- Redirects unauthenticated users to sign-in
- Loading state handling

#### 5. **DashboardLayout** (`frontend/src/layout/DashboardLayout.jsx`)
- User profile display
- Role badge with color coding
- Profile dropdown menu
- Logout functionality
- Responsive design for mobile and desktop

## Setup Instructions

### Backend Setup

1. **Ensure dependencies are installed**:
```bash
pip install djangorestframework djangorestframework-simplejwt django-cors-headers
```

2. **Run migrations** (if not already done):
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

3. **Create a superuser** (optional):
```bash
python manage.py createsuperuser
```

4. **Start the backend server**:
```bash
python manage.py runserver
```

### Frontend Setup

1. **Install dependencies** (if not already done):
```bash
cd frontend
npm install
```

2. **Start the development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal)

## Usage Flow

### Registration (Sign Up)
1. User navigates to `/sign-up`
2. Fills in registration form with validation
3. Submits form to `/api/users/register/`
4. User account created with role `lecteur` by default
5. Redirects to dashboard or sign-in

### Login (Sign In)
1. User navigates to `/sign-in`
2. Enters username and password
3. Submits form to `/api/auth/login/`
4. Backend returns access and refresh tokens
5. Tokens stored in localStorage
6. User redirected to dashboard
7. Dashboard protected by `ProtectedRoute`

### Protected Routes
- All dashboard routes are wrapped with `ProtectedRoute`
- If user not authenticated, redirected to `/sign-in`
- Access token automatically included in API requests
- Token refresh handled automatically

## Token Management

### Storage
- Access token: `localStorage.access_token`
- Refresh token: `localStorage.refresh_token`
- User data: `localStorage.user`

### Access Token Lifetime
- Default: 1 hour
- Configurable in `backend/config/settings.py` → `SIMPLE_JWT`

### Refresh Token
- Default: 7 days
- Automatically rotated on refresh
- Used to obtain new access tokens

## Authentication Flow Diagram

```
User -> Sign In Page
         ↓
    Enter Credentials
         ↓
    POST /api/auth/login/
         ↓
    Backend validates & returns tokens
         ↓
    Store tokens in localStorage
         ↓
    Redirect to Dashboard
         ↓
    ProtectedRoute checks auth
         ↓
    Access granted to dashboard
```

## API Request Headers

All authenticated requests include:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Error Handling

### Common Errors
- **Invalid credentials**: "Identifiants invalides."
- **Username exists**: "Cet identifiant existe déjà."
- **Email exists**: "Cet email est déjà utilisé."
- **Passwords don't match**: "Les mots de passe ne correspondent pas."
- **Weak password**: "Le mot de passe doit contenir au moins 8 caractères."
- **Token expired**: Automatically refreshes or redirects to sign-in

### Error Response Example
```json
{
  "success": false,
  "errors": {
    "username": ["Cet identifiant existe déjà."],
    "email": ["Cet email est déjà utilisé."]
  }
}
```

## Security Features

1. **Password Hashing**: Django's PBKDF2 algorithm
2. **JWT Tokens**: Secure token-based authentication
3. **CORS Configuration**: Limited to specified origins
4. **Token Rotation**: Refresh tokens rotated on use
5. **Secure Storage**: Tokens in localStorage (consider HttpOnly cookies for production)
6. **Password Validation**: Minimum 8 characters, confirmation matching
7. **Form Validation**: Frontend and backend validation

## Production Considerations

1. **Environment Variables**: Move SECRET_KEY to `.env` file
2. **HTTPS**: Use HTTPS in production
3. **HttpOnly Cookies**: Store tokens in HttpOnly cookies instead of localStorage
4. **CORS**: Restrict CORS origins to your domain
5. **Token Expiry**: Adjust token lifetimes as needed
6. **Rate Limiting**: Add rate limiting to auth endpoints
7. **Email Verification**: Add email verification on registration
8. **Password Reset**: Implement password reset functionality

## Testing the System

### Register a New User
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123"
  }'
```

### Get Current User Profile
```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer <access_token>"
```

## Troubleshooting

### "Port already in use"
- Change port: `python manage.py runserver 8001`
- Or: `npm run dev -- --port 5174`

### "CORS error"
- Check `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`
- Ensure frontend URL is in the list

### "Token not found"
- Check browser localStorage
- Ensure tokens are being saved
- Check network requests in browser DevTools

### "Unauthorized 401"
- Token may be expired
- Try refreshing page to get new token
- Clear localStorage and sign in again

## Future Enhancements

1. Add email verification on registration
2. Implement password reset functionality
3. Add two-factor authentication (2FA)
4. Social login (Google, Facebook)
5. User profile edit page
6. Admin user management interface
7. Activity logging
8. Session management
9. API key authentication for external integrations
10. Rate limiting on auth endpoints
