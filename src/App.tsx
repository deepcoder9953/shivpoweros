import React from 'react';
import { AuthProvider } from './auth/AuthContext';
import { RouterProvider, useRouter } from './router/Router';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OtpVerificationPage } from './pages/OtpVerificationPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { LeadManagementPage } from './pages/LeadManagementPage';

const AppRoutes: React.FC = () => {
  const { path } = useRouter();

  switch (path) {
    case '/':
      return <HomePage />;

    case '/login':
      return <LoginPage />;

    case '/register':
      return <RegisterPage />;

    case '/verify-otp':
      return <OtpVerificationPage />;

    case '/forgot-password':
      return <ForgotPasswordPage />;

    case '/reset-password':
      return <ResetPasswordPage />;

    case '/app':
      return (
        <ProtectedRoute>
          <LeadManagementPage />
        </ProtectedRoute>
      );

    default:
      // Fallback unknown routes to Public Home Page
      return <HomePage />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}
