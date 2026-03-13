import React from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Users, 
  Bus, 
  MapPin, 
  ClipboardList,
  Settings,
  LogOut,
  Route,
  Bell,
  BarChart3,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ currentPage, onPageChange }: SidebarProps) => {
  const { user, logout } = useAuth();

  const getNavigationItems = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'buses', label: 'Bus Management', icon: Bus },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'drivers', label: 'Drivers', icon: MapPin },
          { id: 'routes', label: 'Routes', icon: Route },
          { id: 'attendance', label: 'Attendance', icon: ClipboardList },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'bus-tracker', label: 'Bus Tracker', icon: MapPin },
          { id: 'attendance', label: 'My Attendance', icon: QrCode },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ];
      case 'driver':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'route', label: 'My Route', icon: Route },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: ClipboardList },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems(user?.role || 'student');

  return (
    <div className="flex flex-col h-full bg-sidebar-bg border-r border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">CampRide</h2>
            <p className="text-xs text-muted-foreground capitalize">{user?.role} Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "sidebar-nav-item w-full",
                currentPage === item.id && "active"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback>
              {user?.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;