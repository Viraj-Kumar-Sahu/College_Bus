import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bus, 
  MapPin, 
  Clock, 
  QrCode,
  Bell,
  CheckCircle,
  Route,
  Calendar,
  Check,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import LiveMap from '@/components/map/LiveMap';
import { toast } from '@/hooks/use-toast';

interface StudentDashboardProps {
  initialView?: 'dashboard' | 'bus-tracker' | 'attendance' | 'notifications';
}

const StudentDashboard = ({ initialView = 'dashboard' }: StudentDashboardProps) => {
  const { user } = useAuth();
  const { students, buses, routes, attendance, markAttendance, getStudentAttendance } = useData();
  
  // Map initialView to activeView
  const mapInitialView = (view: string) => {
    if (view === 'bus-tracker') return 'tracking';
    if (view === 'notifications') return 'dashboard'; // Show notifications in dashboard
    return view as 'dashboard' | 'tracking' | 'attendance';
  };
  
  const [activeView, setActiveView] = useState<'dashboard' | 'tracking' | 'attendance'>(mapInitialView(initialView));

  // Sync activeView with initialView when sidebar navigation changes
  React.useEffect(() => {
    setActiveView(mapInitialView(initialView));
  }, [initialView]);
  
  // Find current student data
  const currentStudent = students.find(s => s.email === user?.email);
  const studentBus = currentStudent ? buses.find(b => b.id === currentStudent.busId) : null;
  const studentRoute = studentBus ? routes.find(r => r.id === studentBus.routeId) : null;
  const studentStop = currentStudent && studentRoute ? 
    studentRoute.stops.find(s => s.id === currentStudent.stopId) : null;

  // Build busInfo if a bus is assigned; route is optional
  const busInfo = studentBus ? {
    id: studentBus.id,
    route: studentRoute?.name || studentBus.routeName || 'Unassigned',
    driver: 'Mike Rodriguez', // TODO: derive from drivers state
    currentLocation: `${studentBus.location.lat.toFixed(4)}, ${studentBus.location.lng.toFixed(4)}`,
    eta: Math.floor(Math.random() * 15 + 5) + ' minutes', // Simulated ETA
    status: studentBus.status,
    nextStop: studentRoute?.stops[0]?.name || 'Unknown'
  } : null;

  // Generate realistic schedule based on route data
  const todaySchedule = studentRoute && studentStop ? [
    { 
      time: '07:30 AM', 
      location: studentStop.name, 
      status: 'completed', 
      type: 'pickup' 
    },
    { 
      time: '08:15 AM', 
      location: 'College Main Gate', 
      status: 'completed', 
      type: 'dropoff' 
    },
    { 
      time: '05:00 PM', 
      location: 'College Main Gate', 
      status: 'upcoming', 
      type: 'pickup' 
    },
    { 
      time: '05:45 PM', 
      location: studentStop.name, 
      status: 'upcoming', 
      type: 'dropoff' 
    }
  ] : [];

  // Calculate attendance stats from actual data
  const studentAttendance = currentStudent ? getStudentAttendance(currentStudent.id) : [];
  const thisWeekAttendance = studentAttendance.filter(record => {
    const recordDate = new Date(record.timestamp);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return recordDate > weekAgo;
  });
  
  const attendanceStats = {
    thisWeek: thisWeekAttendance.filter(r => r.status === 'present').length,
    totalDays: 5, // Assuming 5 working days
    percentage: Math.round((thisWeekAttendance.filter(r => r.status === 'present').length / Math.max(thisWeekAttendance.length, 1)) * 100) || 0,
    streak: Math.min(thisWeekAttendance.filter(r => r.status === 'present').length, 5)
  };

  // Generate recent notifications based on actual data
  const recentNotifications = [
    {
      id: 1,
      message: studentBus ? `Your bus ${studentBus.id} is currently ${studentBus.status}` : 'No bus assigned',
      time: '5 minutes ago',
      type: 'status'
    },
    {
      id: 2,
      message: `Latest attendance: ${studentAttendance.length > 0 ? studentAttendance[studentAttendance.length - 1].status : 'No records'}`,
      time: '2 hours ago',
      type: 'attendance'
    },
    {
      id: 3,
      message: studentRoute ? `Route: ${studentRoute.name}` : 'No route assigned',
      time: '3 hours ago',
      type: 'route'
    }
  ];

  const handleMarkAttendance = async () => {
    if (!currentStudent || !studentBus) {
      toast({
        title: "Error",
        description: "No bus assignment found",
        variant: "destructive"
      });
      return;
    }

    const ok = await markAttendance({
      studentId: currentStudent.id,
      busId: studentBus.id,
      status: 'present',
      type: 'pickup',
      stopId: currentStudent.stopId
    });

    if (ok) {
      toast({ title: "Success", description: "Attendance marked successfully!" });
    } else {
      toast({ title: "Already marked", description: "Today's attendance already recorded.", variant: 'default' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Track your bus and manage your daily commute</p>
        </div>
        <div className="flex gap-3">
          <Button className="btn-primary" onClick={handleMarkAttendance}>
            <Check className="h-4 w-4 mr-2" />
            Mark Attendance
          </Button>
          <Button variant="outline" onClick={() => setActiveView('tracking')}>
            <MapPin className="h-4 w-4 mr-2" />
            Track Bus
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: Bus },
          { key: 'tracking', label: 'Live Tracking', icon: MapPin },
          { key: 'attendance', label: 'My Attendance', icon: Calendar }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard View */}
      {activeView === 'dashboard' && busInfo && (
        <>
          {/* Bus Status Card */}
          <Card className="dashboard-card bg-gradient-card">
            <CardHeader className="dashboard-card-header">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" />
                    Your Bus: {busInfo.id}
                  </CardTitle>
                  <CardDescription>{busInfo.route}</CardDescription>
                </div>
                <Badge className={busInfo.status === 'active' ? 'status-online' : 'status-delayed'}>
                  {busInfo.status === 'active' ? 'On Time' : busInfo.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="dashboard-card-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Current Location</p>
                    <p className="text-sm text-muted-foreground">{busInfo.currentLocation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-foreground">ETA to Next Stop</p>
                    <p className="text-sm text-muted-foreground">{busInfo.eta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Route className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">Next Stop</p>
                    <p className="text-sm text-muted-foreground">{busInfo.nextStop}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button className="btn-primary" onClick={() => setActiveView('tracking')}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Track Bus Live
                </Button>
                <Button variant="outline" onClick={handleMarkAttendance}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Mark Present
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <div className="lg:col-span-2">
              <Card className="dashboard-card">
                <CardHeader className="dashboard-card-header">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>Your bus pickup and drop-off times</CardDescription>
                </CardHeader>
                <CardContent className="dashboard-card-content">
                  <div className="space-y-4">
                    {todaySchedule.map((schedule, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className={`p-2 rounded-full ${
                          schedule.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
                        }`}>
                          {schedule.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <Clock className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{schedule.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {schedule.type === 'pickup' ? 'Pickup from' : 'Drop-off at'} {schedule.location}
                          </p>
                        </div>
                        <Badge variant={schedule.status === 'completed' ? 'default' : 'secondary'}>
                          {schedule.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance & Notifications */}
            <div className="space-y-6">
              {/* Attendance Stats */}
              <Card className="dashboard-card">
                <CardHeader className="dashboard-card-header">
                  <CardTitle>This Week's Attendance</CardTitle>
                  <CardDescription>Your bus attendance record</CardDescription>
                </CardHeader>
                <CardContent className="dashboard-card-content">
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {attendanceStats.thisWeek}/{attendanceStats.totalDays}
                      </p>
                      <p className="text-sm text-muted-foreground">Days Attended</p>
                    </div>
                    
                    <Progress value={attendanceStats.percentage} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Attendance Rate</span>
                      <span className="font-medium text-foreground">{attendanceStats.percentage}%</span>
                    </div>
                    
                    <div className="p-3 bg-success/10 rounded-lg text-center">
                      <p className="text-sm font-medium text-success">
                        🔥 {attendanceStats.streak} day streak!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card className="dashboard-card">
                <CardHeader className="dashboard-card-header">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="dashboard-card-content">
                  <div className="space-y-3">
                    {recentNotifications.map((notification) => (
                      <div key={notification.id} className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* No Bus Assigned Message */}
      {activeView === 'dashboard' && !busInfo && (
        <Card className="dashboard-card">
          <CardContent className="p-8 text-center">
            <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Bus Assigned</h3>
            <p className="text-muted-foreground">
              You haven't been assigned to a bus yet. Please contact the admin office.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Live Tracking View */}
      {activeView === 'tracking' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>Live Bus Tracking</CardTitle>
            <CardDescription>
              {busInfo ? `Track your bus ${busInfo.id} in real-time` : 'No bus assigned'}
            </CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            {busInfo ? (
              <LiveMap busId={busInfo.id} height="500px" />
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bus assigned for tracking</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendance History View */}
      {activeView === 'attendance' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>My Attendance History</CardTitle>
            <CardDescription>Your complete attendance record</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="space-y-4">
              {studentAttendance.length > 0 ? (
                studentAttendance.slice().reverse().map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        record.status === 'present' ? 'bg-success/10' : 'bg-warning/10'
                      }`}>
                        {record.status === 'present' ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <Clock className="h-5 w-5 text-warning" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {record.type} - {record.status}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.timestamp.toLocaleDateString()} at {record.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={record.status === 'present' ? 'status-online' : 'status-delayed'}>
                      {record.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No attendance records found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;