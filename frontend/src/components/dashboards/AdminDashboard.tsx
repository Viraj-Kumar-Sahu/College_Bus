import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bus, 
  Users, 
  MapPin, 
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Route,
  BarChart3,
  Search
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import StudentForm from '@/components/forms/StudentForm';
import DriverForm from '@/components/forms/DriverForm';
import BusForm from '@/components/forms/BusForm';
import LiveMap from '@/components/map/LiveMap';
import { toast } from '@/hooks/use-toast';
import RouteForm from '@/components/forms/RouteForm';

interface AdminDashboardProps {
  initialView?: 'overview' | 'students' | 'drivers' | 'buses' | 'attendance' | 'routes' | 'reports' | 'tracking';
}

const AdminDashboard = ({ initialView = 'overview' }: AdminDashboardProps) => {
  const { students, drivers, buses, routes, attendance, deleteStudent, deleteDriver, deleteBus, getDriverByBus, updateRoute, deleteRoute } = useData();
  
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [driverFormOpen, setDriverFormOpen] = useState(false);
  const [busFormOpen, setBusFormOpen] = useState(false);
  const [routeFormOpen, setRouteFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editingBus, setEditingBus] = useState(null);
  const [activeView, setActiveView] = useState<'overview' | 'students' | 'drivers' | 'buses' | 'attendance' | 'routes' | 'reports' | 'tracking'>(initialView);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync activeView with initialView when sidebar navigation changes
  React.useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);
  const stats = [
    {
      title: 'Total Buses',
      value: buses.length.toString(),
      change: `${buses.filter(b => b.status === 'active').length} active`,
      icon: Bus,
      color: 'text-primary'
    },
    {
      title: 'Active Students',
      value: students.length.toString(),
      change: `${students.filter(s => s.busId).length} assigned`,
      icon: Users,
      color: 'text-success'
    },
    {
      title: 'Drivers',
      value: drivers.length.toString(),
      change: `${drivers.filter(d => d.busId).length} assigned`,
      icon: MapPin,
      color: 'text-warning'
    },
    {
      title: 'Attendance Rate',
      value: `${Math.round((attendance.filter(a => a.status === 'present').length / Math.max(attendance.length, 1)) * 100)}%`,
      change: `${attendance.length} total records`,
      icon: ClipboardList,
      color: 'text-success'
    }
  ];

  // Recent activities from actual data
  const recentActivities = attendance.slice(-5).reverse().map((record, index) => ({
    id: record.id,
    type: 'attendance',
    message: `Student ${students.find(s => s.id === record.studentId)?.name} marked ${record.status} on ${buses.find(b => b.id === record.busId)?.id}`,
    time: `${Math.floor((Date.now() - record.timestamp.getTime()) / 60000)} minutes ago`,
    status: record.status === 'present' ? 'success' : 'warning'
  }));

  // Bus status from actual data
  const busStatus = buses.map(bus => {
    const route = routes.find(r => r.id === bus.routeId);
    const driver = getDriverByBus(bus.id);
    const studentsCount = students.filter(s => s.busId === bus.id).length;
    
    return {
      id: bus.id,
      route: route?.name || 'Unknown Route',
      status: bus.status,
      students: studentsCount,
      driver: driver?.name || 'No Driver Assigned'
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="status-online">Active</Badge>;
      case 'delayed':
        return <Badge className="status-delayed">Delayed</Badge>;
      case 'completed':
        return <Badge className="status-offline">Completed</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteStudent(id);
      toast({ title: "Success", description: "Student deleted successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.detail || e?.message || 'Failed to delete student', variant: 'destructive' });
    }
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      await deleteDriver(id);
      toast({ title: "Success", description: "Driver deleted successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.detail || e?.message || 'Failed to delete driver', variant: 'destructive' });
    }
  };

  const handleDeleteBus = (id: string) => {
    deleteBus(id);
    toast({
      title: "Success",
      description: "Bus deleted successfully", 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your college bus transportation system</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setActiveView('tracking')}>
            <MapPin className="h-4 w-4 mr-2" />
            Live Tracking
          </Button>
          <Button className="btn-primary" onClick={() => setBusFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Bus
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: TrendingUp },
          { key: 'students', label: 'Students', icon: Users },
          { key: 'drivers', label: 'Drivers', icon: MapPin },
          { key: 'buses', label: 'Buses', icon: Bus },
          { key: 'routes', label: 'Routes', icon: Route },
          { key: 'attendance', label: 'Attendance', icon: ClipboardList },
          { key: 'reports', label: 'Reports', icon: BarChart3 },
          { key: 'tracking', label: 'Live Tracking', icon: MapPin }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
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

      {/* Statistics Cards - Show on overview */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted/50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Overview Content */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bus Status */}
          <div className="lg:col-span-2">
            <Card className="dashboard-card">
              <CardHeader className="dashboard-card-header">
                <CardTitle>Live Bus Status</CardTitle>
                <CardDescription>Real-time status of all buses in the fleet</CardDescription>
              </CardHeader>
              <CardContent className="dashboard-card-content">
                <div className="space-y-4">
                  {busStatus.map((bus) => (
                    <div key={bus.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Bus className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{bus.id}</p>
                          <p className="text-sm text-muted-foreground">{bus.route}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">{bus.students} students</p>
                          <p className="text-muted-foreground">{bus.driver}</p>
                        </div>
                        {getStatusBadge(bus.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="dashboard-card">
            <CardHeader className="dashboard-card-header">
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="dashboard-card-content">
              <div className="space-y-4">
                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-success/10' :
                      activity.status === 'warning' ? 'bg-warning/10' : 'bg-muted'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : activity.status === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Students Management */}
      {activeView === 'students' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Students Management</CardTitle>
                <CardDescription>Manage student records and bus assignments</CardDescription>
              </div>
              <Button className="btn-primary" onClick={() => setStudentFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {students
                .filter(student => 
                  student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((student) => {
                const bus = buses.find(b => b.id === student.busId);
                const route = routes.find(r => r.id === bus?.routeId);
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Bus: {bus?.id || 'Unassigned'} • Route: {route?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingStudent(student);
                          setStudentFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drivers Management */}
      {activeView === 'drivers' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Drivers Management</CardTitle>
                <CardDescription>Manage driver records and bus assignments</CardDescription>
              </div>
              <Button className="btn-primary" onClick={() => setDriverFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
            </div>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="space-y-4">
              {drivers.map((driver) => {
                const bus = buses.find(b => b.id === driver.busId);
                const route = routes.find(r => r.id === bus?.routeId);
                return (
                  <div key={driver.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{driver.name}</p>
                        <p className="text-sm text-muted-foreground">{driver.email}</p>
                        <p className="text-xs text-muted-foreground">
                          License: {driver.licenseNumber} • Bus: {driver.busId} • Route: {route?.name || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingDriver(driver);
                          setDriverFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteDriver(driver.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Buses Management */}
      {activeView === 'buses' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Buses Management</CardTitle>
                <CardDescription>Manage bus fleet and route assignments</CardDescription>
              </div>
              <Button className="btn-primary" onClick={() => setBusFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bus
              </Button>
            </div>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="space-y-4">
              {buses.map((bus) => {
                const route = routes.find(r => r.id === bus.routeId);
                const driver = getDriverByBus(bus.id);
                const studentsCount = students.filter(s => s.busId === bus.id).length;
                return (
                  <div key={bus.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Bus className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{bus.id}</p>
                        <p className="text-sm text-muted-foreground">
                          Route: {route?.name || 'Unassigned'} • Driver: {driver?.name || 'Unassigned'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Capacity: {bus.capacity} • Students: {studentsCount} • Status: {bus.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(bus.status)}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingBus(bus);
                          setBusFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteBus(bus.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
            <CardDescription>View all student attendance records</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="space-y-4">
              {attendance.slice().reverse().map((record) => {
                const student = students.find(s => s.id === record.studentId);
                const bus = buses.find(b => b.id === record.busId);
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
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
                        <p className="font-medium text-foreground">{student?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {bus?.id} • {record.type} • {record.timestamp.toLocaleString()}
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

      {/* Live Tracking View */}
      {activeView === 'tracking' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>Live Bus Tracking</CardTitle>
            <CardDescription>Real-time location tracking of all buses</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <LiveMap height="500px" />
          </CardContent>
        </Card>
      )}

      {/* Routes View */}
      {activeView === 'routes' && (
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <div className="flex justify-between items-center w-full">
              <div>
                <CardTitle>Route Management</CardTitle>
                <CardDescription>View and manage bus routes and stops</CardDescription>
              </div>
              <Button className="btn-primary" onClick={() => setRouteFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </Button>
            </div>
          </CardHeader>
          <CardContent className="dashboard-card-content">
            <div className="space-y-6">
              {routes.map((route) => {
                const routeBus = buses.find(b => b.routeId === route.id);
                const onDelete = async () => {
                  await deleteRoute(route.id);
                  toast({ title: 'Success', description: 'Route deleted' });
                };
                const onAddDefaultStops = async () => {
                  const defaultStops = [
                    { id: 's1', name: 'Stop A', coordinates: { lat: 26.9124, lng: 75.7873 }, time: '08:00' },
                    { id: 's2', name: 'Stop B', coordinates: { lat: 26.9220, lng: 75.8000 }, time: '08:15' },
                    { id: 's3', name: 'Campus', coordinates: { lat: 26.9350, lng: 75.8100 }, time: '08:30' },
                  ];
                  await updateRoute(route.id, { pathJson: JSON.stringify(defaultStops) });
                  toast({ title: 'Success', description: 'Added default stops' });
                };
                return (
                  <div key={route.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Route className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{route.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Bus: {routeBus?.id || 'Not Assigned'} • {route.stops.length} stops
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {route.stops.length === 0 && (
                          <Button size="sm" variant="outline" onClick={onAddDefaultStops}>Add Stops</Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={onDelete}>Delete</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 ml-10">
                      {route.stops.map((stop, index) => (
                        <div key={stop.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{stop.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Time: {stop.time} • Coordinates: {stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports View */}
      {activeView === 'reports' && (
        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader className="dashboard-card-header">
              <CardTitle>System Analytics & Reports</CardTitle>
              <CardDescription>Overview of system performance and usage</CardDescription>
            </CardHeader>
            <CardContent className="dashboard-card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Attendance Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Records</span>
                      <span className="font-medium text-foreground">{attendance.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Present</span>
                      <span className="font-medium text-success">{attendance.filter(a => a.status === 'present').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Absent/Late</span>
                      <span className="font-medium text-warning">{attendance.filter(a => a.status !== 'present').length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Fleet Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Active Buses</span>
                      <span className="font-medium text-success">{buses.filter(b => b.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Delayed</span>
                      <span className="font-medium text-warning">{buses.filter(b => b.status === 'delayed').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">Maintenance</span>
                      <span className="font-medium text-destructive">{buses.filter(b => b.status === 'maintenance').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dashboard-card">
            <CardHeader className="dashboard-card-header">
              <CardTitle>Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent className="dashboard-card-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Students per Bus</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(students.length / Math.max(buses.length, 1))}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Average Capacity Used</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(() => {
                      const totalCapacity = buses.map(b => b.capacity).reduce((a, b) => a + b, 0);
                      return totalCapacity > 0 ? Math.round((students.length / totalCapacity) * 100) : 0;
                    })()}%
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Active Routes</p>
                  <p className="text-2xl font-bold text-foreground">{routes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forms */}
      <StudentForm 
        isOpen={studentFormOpen} 
        onClose={() => { 
          setStudentFormOpen(false); 
          setEditingStudent(null); 
        }} 
        student={editingStudent}
        isEdit={!!editingStudent}
      />
      
      <DriverForm 
        isOpen={driverFormOpen} 
        onClose={() => { 
          setDriverFormOpen(false); 
          setEditingDriver(null); 
        }} 
        driver={editingDriver}
        isEdit={!!editingDriver}
      />
      
      <BusForm 
        isOpen={busFormOpen} 
        onClose={() => { 
          setBusFormOpen(false); 
          setEditingBus(null); 
        }} 
        bus={editingBus}
        isEdit={!!editingBus}
      />

      <RouteForm
        isOpen={routeFormOpen}
        onClose={() => setRouteFormOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;