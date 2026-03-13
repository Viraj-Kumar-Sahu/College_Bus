import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bus, 
  MapPin, 
  Users, 
  Route,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';
import LiveMap from '@/components/map/LiveMap';

interface DriverDashboardProps {
  initialView?: 'overview' | 'route' | 'students' | 'attendance';
}

const DriverDashboard = ({ initialView = 'overview' }: DriverDashboardProps) => {
  const { user } = useAuth();
  const { buses, routes, students, attendance, updateBus, markAttendance } = useData();
  
  const [activeView, setActiveView] = useState<'overview' | 'route' | 'students' | 'attendance'>(initialView);
  const [isOnRoute, setIsOnRoute] = useState(true);
  const [gpsEnabled, setGpsEnabled] = useState(true);

  // Sync activeView with initialView when sidebar navigation changes
  React.useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);
  
  // Find driver's bus
  const driverBus = buses.find(bus => bus.driverId === String(user?.id));
  const driverRoute = routes.find(route => route.id === driverBus?.routeId);
  const driverRouteName = driverRoute?.name || driverBus?.routeName || 'Unassigned';
  const studentsOnBus = students.filter(student => student.busId === driverBus?.id);

  // Handler functions
  const handleLocationUpdate = () => {
    if (!driverBus) return;
    
    // Simulate GPS location update
    const newLat = driverBus.location.lat + (Math.random() - 0.5) * 0.01;
    const newLng = driverBus.location.lng + (Math.random() - 0.5) * 0.01;
    
    updateBus(driverBus.id, {
      location: { lat: newLat, lng: newLng },
      status: 'active'
    });
    
    toast({
      title: "Location Updated",
      description: "Your bus location has been updated successfully.",
    });
  };

  const handleMarkBoarded = async (studentId: string) => {
    if (!driverBus) return;
    
    const ok = await markAttendance({
      studentId,
      busId: driverBus.id,
      status: 'present',
      type: 'pickup',
      stopId: 'current-stop'
    });
    
    toast({
      title: ok ? "Student Boarded" : "Already Marked",
      description: ok ? "Student attendance has been marked successfully." : "Today's attendance already recorded.",
    });
  };

  const handleEmergency = () => {
    toast({
      title: "Emergency Alert Sent",
      description: "Emergency services have been notified of your location.",
      variant: "destructive"
    });
  };

  const handleReportIssue = () => {
    toast({
      title: "Issue Reported",
      description: "Your issue has been reported to the administration.",
    });
  };

  // Calculate stats
  const todayAttendance = attendance.filter(record => 
    record.busId === driverBus?.id && 
    record.timestamp.toDateString() === new Date().toDateString()
  );
  
  const todayStats = {
    totalStudents: studentsOnBus.length,
    studentsBoarded: todayAttendance.filter(r => r.status === 'present').length,
    completedTrips: studentsOnBus.length > 0 ? Math.floor(todayAttendance.length / studentsOnBus.length) : 0,
    onTimePerformance: '95%'
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Driver Dashboard</h1>
          <p className="text-muted-foreground">Manage your route and track student attendance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleEmergency}>
            <Phone className="h-4 w-4 mr-2" />
            Emergency
          </Button>
          <Button variant="destructive" onClick={handleReportIssue}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { key: 'overview', label: 'Overview', icon: Bus },
          { key: 'route', label: 'My Route', icon: Route },
          { key: 'students', label: 'Students', icon: Users },
          { key: 'attendance', label: 'Attendance', icon: ClipboardList }
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

      {/* Status Controls - Show on overview */}
      {activeView === 'overview' && (
        <>
          <Card className="dashboard-card bg-gradient-card">
            <CardHeader className="dashboard-card-header">
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Route Status & Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="dashboard-card-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">On Route</label>
                    <Switch checked={isOnRoute} onCheckedChange={setIsOnRoute} />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">GPS Tracking</label>
                    <Switch checked={gpsEnabled} onCheckedChange={setGpsEnabled} />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Bus className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{driverBus?.id || 'No Bus Assigned'}</p>
                    <p className="text-sm text-muted-foreground">{driverRouteName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Route className="h-8 w-8 text-success" />
                  <div>
                    <p className="font-medium text-foreground">Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {driverRoute?.stops.length || 0} stops
                    </p>
                    <Button size="sm" className="mt-2 btn-primary" onClick={handleLocationUpdate}>
                      Update Location
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{todayStats.studentsBoarded}</p>
                    <p className="text-sm text-muted-foreground">Students Boarded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{todayStats.completedTrips}</p>
                    <p className="text-sm text-muted-foreground">Completed Trips</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-warning" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{todayStats.onTimePerformance}</p>
                    <p className="text-sm text-muted-foreground">On Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">45 min</p>
                    <p className="text-sm text-muted-foreground">ETA Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students Management */}
            <Card className="dashboard-card">
              <CardHeader className="dashboard-card-header">
                <CardTitle>Students on Board</CardTitle>
                <CardDescription>Manage student attendance and boarding status</CardDescription>
              </CardHeader>
              <CardContent className="dashboard-card-content">
                <div className="space-y-3">
                  {studentsOnBus.length > 0 ? studentsOnBus.map((student) => {
                    const studentAttendance = attendance.find(a => 
                      a.studentId === student.id && 
                      a.busId === driverBus?.id &&
                      a.timestamp.toDateString() === new Date().toDateString()
                    );
                    const isBoarded = studentAttendance?.status === 'present';
                    
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Stop: {routes.find(r => r.stops.some(s => s.id === student.stopId))?.stops.find(s => s.id === student.stopId)?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            isBoarded ? 'status-online' : 'bg-warning text-warning-foreground'
                          }>
                            {isBoarded ? 'Boarded' : 'Waiting'}
                          </Badge>
                          {!isBoarded && (
                            <Button size="sm" className="btn-primary" onClick={() => handleMarkBoarded(student.id)}>
                              Mark Boarded
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No students assigned to this bus
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Map */}
            <Card className="dashboard-card">
              <CardHeader className="dashboard-card-header">
                <CardTitle>Live Bus Tracking</CardTitle>
                <CardDescription>Monitor your bus location and route progress</CardDescription>
              </CardHeader>
              <CardContent className="dashboard-card-content">
                {driverBus ? (
                  <LiveMap busId={driverBus.id} height="300px" />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No bus assigned to your account</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Route View */}
      {activeView === 'route' && driverRoute && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>My Route - {driverRoute.name}</CardTitle>
            <CardDescription>View your assigned route and stops</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="space-y-4">
              {driverRoute.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{stop.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Time: {stop.time} • Coordinates: {stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleLocationUpdate}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Location
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <LiveMap busId={driverBus?.id} height="400px" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students View */}
      {activeView === 'students' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>All Students on My Bus</CardTitle>
            <CardDescription>Complete list of assigned students</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="space-y-3">
              {studentsOnBus.map((student) => {
                const studentAttendance = attendance.filter(a => 
                  a.studentId === student.id && 
                  a.busId === driverBus?.id
                );
                const todayAttendance = studentAttendance.find(a =>
                  a.timestamp.toDateString() === new Date().toDateString()
                );
                
                return (
                  <div key={student.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <Badge className={todayAttendance ? 'status-online' : 'bg-muted'}>
                        {todayAttendance ? 'Present Today' : 'Not Marked'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Stop: {routes.find(r => r.stops.some(s => s.id === student.stopId))?.stops.find(s => s.id === student.stopId)?.name || 'Unknown'} • 
                      Total Attendance: {studentAttendance.length} records
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance View */}
      {activeView === 'attendance' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>View all attendance records for your bus</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="space-y-3">
              {attendance
                .filter(record => record.busId === driverBus?.id)
                .slice()
                .reverse()
                .map((record) => {
                  const student = students.find(s => s.id === record.studentId);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          record.status === 'present' ? 'bg-success/10' : 'bg-warning/10'
                        }`}>
                          {record.status === 'present' ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student?.name || 'Unknown Student'}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.type} • {record.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={record.status === 'present' ? 'status-online' : 'status-delayed'}>
                        {record.status}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DriverDashboard;