import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    if (!user) return null;

    // Route to different components based on current page and user role
    if (user.role === 'admin') {
      switch (currentPage) {
        case 'dashboard':
        case 'buses':
        case 'students':
        case 'drivers':
        case 'routes':
        case 'attendance':
        case 'reports':
          return <AdminDashboard initialView={currentPage === 'dashboard' ? 'overview' : currentPage} />;
        default:
          return <AdminDashboard />;
      }
    } else if (user.role === 'student') {
      switch (currentPage) {
        case 'dashboard':
          return <StudentDashboard />;
        case 'bus-tracker':
        case 'attendance':
        case 'notifications':
          return <StudentDashboard initialView={currentPage} />;
        default:
          return <StudentDashboard />;
      }
    } else if (user.role === 'driver') {
      switch (currentPage) {
        case 'dashboard':
        case 'route':
        case 'students':
        case 'attendance':
          return <DriverDashboard initialView={currentPage === 'dashboard' ? 'overview' : currentPage} />;
        default:
          return <DriverDashboard />;
      }
    }

    return null;
  };

  return (
    <div className="dashboard-container">
      <div className="flex h-screen">
        <div className="w-64 flex-shrink-0">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;