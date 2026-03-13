import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';
import { isAuthenticated } from '@/utils/auth';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<AppLayout />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver-dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tracking" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/students" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/drivers" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/buses" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/routes" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRouter;