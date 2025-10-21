# 🔐 Authentication Setup Guide

## Overview
This project implements a complete authentication system using Strapi as the backend and Next.js as the frontend, following modern security best practices.

## 🏗️ Architecture

### Backend (Strapi)
- **Users & Permissions Plugin**: Handles user registration, login, and JWT tokens
- **JWT Configuration**: 7-day token expiration
- **CORS Setup**: Configured for frontend domain
- **Password Reset**: Built-in forgot password functionality

### Frontend (Next.js)
- **AuthProvider**: Context-based authentication state management
- **Protected Routes**: Middleware and components for route protection
- **Form Validation**: Client-side validation with error handling
- **Token Storage**: Secure localStorage with fallback handling

## 🚀 Features Implemented

### ✅ User Registration
- Username, email, and password fields
- Password confirmation validation
- Minimum password length (6 characters)
- Real-time form validation

### ✅ User Login
- Email/username and password authentication
- Remember me functionality
- JWT token management
- Automatic redirect to account page

### ✅ Password Reset
- Forgot password functionality
- Email-based reset codes
- Secure password reset flow

### ✅ Protected Routes
- Middleware-based route protection
- Automatic redirect to login
- Protected component wrapper

### ✅ Security Features
- JWT token expiration (7 days)
- Secure token storage
- CORS configuration
- Input validation and sanitization

## 📁 File Structure

```
frontend/src/
├── providers/
│   └── auth-provider.tsx          # Authentication context and logic
├── components/
│   └── protected-route.tsx       # Route protection component
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       └── page.tsx          # Login/Register page
│   └── account/
│       └── page.tsx              # Protected account page
└── middleware.ts                  # Route protection middleware

backend/
├── config/
│   └── plugins.ts                # Strapi plugin configuration
└── src/
    └── api/                       # API endpoints
```

## 🔧 Configuration

### Backend Configuration
The Strapi backend is configured with:
- Users & Permissions plugin enabled
- JWT tokens with 7-day expiration
- CORS enabled for frontend domain
- Registration fields: username, email, password

### Frontend Configuration
The Next.js frontend includes:
- Environment variables for Strapi URL
- Middleware for route protection
- Context provider for authentication state
- Form validation and error handling

## 🛡️ Security Best Practices

1. **JWT Tokens**: Short-lived tokens (7 days) with secure storage
2. **Password Validation**: Minimum length and confirmation matching
3. **CORS Protection**: Restricted to frontend domain only
4. **Input Sanitization**: All user inputs are validated
5. **Route Protection**: Middleware prevents unauthorized access
6. **Error Handling**: Secure error messages without sensitive data

## 🚦 Usage

### Registration
```typescript
const { register } = useAuth();
await register({ username, email, password });
```

### Login
```typescript
const { login } = useAuth();
await login({ identifier: email, password });
```

### Password Reset
```typescript
const { forgotPassword, resetPassword } = useAuth();
await forgotPassword(email);
await resetPassword(code, password, passwordConfirmation);
```

### Protected Routes
```tsx
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

## 🔄 Authentication Flow

1. **Registration**: User fills form → Strapi creates user → JWT returned → User logged in
2. **Login**: User enters credentials → Strapi validates → JWT returned → User logged in
3. **Protected Access**: User accesses protected route → Middleware checks token → Access granted/denied
4. **Logout**: Token removed → User redirected to login

## 🎯 Next Steps

To complete the authentication setup:

1. **Configure Email Provider**: Set up email service for password reset
2. **Add Social Login**: Implement Google/GitHub OAuth
3. **User Profile Management**: Add profile editing functionality
4. **Role-Based Access**: Implement user roles and permissions
5. **Session Management**: Add session timeout and refresh tokens

## 🐛 Troubleshooting

### Common Issues
- **CORS Errors**: Ensure frontend URL is in Strapi CORS config
- **Token Expired**: Check JWT expiration settings
- **Registration Fails**: Verify Strapi plugin configuration
- **Protected Routes**: Ensure middleware is properly configured

### Debug Steps
1. Check browser console for errors
2. Verify Strapi backend is running
3. Check network requests in DevTools
4. Validate environment variables
5. Test API endpoints directly

## 📚 Additional Resources

- [Strapi Users & Permissions Documentation](https://docs.strapi.io/dev-docs/plugins/users-permissions)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
