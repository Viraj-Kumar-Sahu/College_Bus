import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import DashboardLayout from './DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

const AppLayout = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect authenticated users from login page to appropriate dashboard
    if (!loading && isAuthenticated && user && location.pathname === '/login') {
      const roleRoutes = {
        student: '/student-dashboard',
        driver: '/driver-dashboard',
        admin: '/admin-dashboard'
      };
      navigate(roleRoutes[user.role] || '/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, user, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginForm />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardLayout />
    </ErrorBoundary>
  );
};

export default AppLayout;