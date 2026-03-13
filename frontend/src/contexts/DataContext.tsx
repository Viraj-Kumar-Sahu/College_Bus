import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '@/utils/api';

export interface Student {
  id: string;
  name: string;
  email: string;
  busId: string;
  stopId: string;
  profileImage?: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  busId: string;
  licenseNumber: string;
  phone: string;
  profileImage?: string;
}

export interface Bus {
  id: string;
  routeId: string;
  routeName?: string;
  driverId: string;
  capacity: number;
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'delayed' | 'completed' | 'maintenance';
  lastUpdated: Date;
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  timings: string[];
}

export interface Stop {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  time: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  busId: string;
  timestamp: Date;
  status: 'present' | 'absent' | 'late';
  type: 'pickup' | 'dropoff';
  stopId: string;
}

interface DataContextType {
  // Data
  students: Student[];
  drivers: Driver[];
  buses: Bus[];
  routes: Route[];
  attendance: AttendanceRecord[];
  
  // Student operations
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Driver operations
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<void>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  
  // Bus operations
  addBus: (bus: Omit<Bus, 'id' | 'lastUpdated'>) => Promise<void>;
  updateBus: (id: string, bus: Partial<Bus>) => Promise<void>;
  deleteBus: (id: string) => Promise<void>;
  updateBusLocation: (id: string, location: { lat: number; lng: number }) => Promise<void>;
  
  // Route operations
  addRoute: (route: { name: string; busId?: string; pathJson?: string }) => Promise<void>;
  updateRoute: (id: string, route: { name?: string; busId?: string; pathJson?: string }) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  
  // Attendance operations
  markAttendance: (attendance: Omit<AttendanceRecord, 'id' | 'timestamp'>) => Promise<boolean>;
  getStudentAttendance: (studentId: string) => AttendanceRecord[];
  
  // Utility functions
  getBusByRoute: (routeId: string) => Bus | undefined;
  getStudentsByBus: (busId: string) => Student[];
  getDriverByBus: (busId: string) => Driver | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [routeByBus, setRouteByBus] = useState<Record<string, string>>({});

  const refetchAll = async () => {
    // Fetch routes first to build bus->route mapping used by buses
    await fetchRoutes();
    await Promise.all([
      fetchStudents(),
      fetchDrivers(),
      fetchBuses(),
      fetchAttendance(),
    ]);
  };

  // Initial load
  useEffect(() => {
    refetchAll();
  }, []);

  // --- Fetchers ---
  const fetchStudents = async () => {
    const { data } = await api.get('/students/');
    const mapped: Student[] = data.map((s: any) => ({
      id: String(s.id),
      name: s.name,
      email: s.email,
      busId: s.bus_id ? String(s.bus_id) : '',
      stopId: '',
      profileImage: undefined,
    }));
    setStudents(mapped);
  };

  const fetchDrivers = async () => {
    const { data } = await api.get('/drivers/');
    const mapped: Driver[] = data.map((d: any) => ({
      id: String(d.id),
      name: d.name,
      email: d.email,
      busId: d.bus_id ? String(d.bus_id) : '',
      licenseNumber: d.license_no || '',
      phone: d.phone || '',
      profileImage: undefined,
    }));
    setDrivers(mapped);
  };

const fetchBuses = async () => {
    const { data } = await api.get('/buses/');
    const mapped: Bus[] = data.map((b: any) => ({
      id: String(b.id),
      routeId: routeByBus[String(b.id)] || '',
      routeName: b.route_name || undefined,
      driverId: (b.driver_id ? String(b.driver_id) : (findDriverIdForBus(String(b.id)) || '')),
      capacity: b.capacity || 40,
      location: { lat: b.current_lat || 0, lng: b.current_lng || 0 },
      status: 'active',
      lastUpdated: b.updated_at ? new Date(b.updated_at) : new Date(),
    }));
    setBuses(mapped);
  };

const fetchRoutes = async () => {
    const { data } = await api.get('/routes/');
    const mapped: Route[] = data.map((r: any) => ({
      id: String(r.id),
      name: r.name,
      // Try to parse path as array of stops if provided; else empty
      stops: (() => {
        try {
          const parsed = r.path ? JSON.parse(r.path) : [];
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
        return [] as Stop[];
      })(),
      timings: [],
    }));
    setRoutes(mapped);
    // Build bus -> route mapping
    const mapping: Record<string, string> = {};
    data.forEach((r: any) => {
      if (r.bus_id) mapping[String(r.bus_id)] = String(r.id);
    });
    setRouteByBus(mapping);
  };

  const fetchAttendance = async () => {
    const { data } = await api.get('/attendance/');
    const mapped: AttendanceRecord[] = data.map((a: any) => ({
      id: String(a.id),
      studentId: String(a.student_id),
      busId: a.bus_id ? String(a.bus_id) : '',
      timestamp: a.marked_at ? new Date(a.marked_at) : new Date(),
      status: a.status,
      type: 'pickup',
      stopId: '',
    }));
    setAttendance(mapped);
  };

  // Helpers to derive driver/route for a bus from current state
  const findDriverIdForBus = (busId: string) => drivers.find(d => d.busId === busId)?.id;
  const findRouteIdForBus = (busId: string) => routes.find(r => buses.find(b => b.id === busId && r.id)) && (routes.find(r => r.id && r.id === routes.find(rr => rr.id)?.id)?.id);

  // --- Mutations ---
  const addStudent = async (student: Omit<Student, 'id'> & { rollNo?: string; studentName?: string; studentContact?: string }) => {
    const routeId = student.busId ? routeByBus[String(student.busId)] : undefined;
    await api.post('/students/', {
      name: student.name,
      email: student.email,
      roll_no: (student as any).rollNo,
      contact: (student as any).studentContact,
      bus_id: student.busId ? Number(student.busId) : undefined,
      route: routeId ? Number(routeId) : undefined,
    });
    await fetchStudents();
  };

  const updateStudent = async (id: string, studentUpdate: Partial<Student> & { rollNo?: string; studentContact?: string }) => {
    await api.put(`/students/${id}`, {
      roll_no: (studentUpdate as any).rollNo,
      contact: (studentUpdate as any).studentContact,
    });
    if (studentUpdate.busId) {
      await api.post(`/students/${id}/assign-bus/${studentUpdate.busId}`);
    }
    await fetchStudents();
  };

  const deleteStudent = async (id: string) => {
    const sid = Number(id);
    await api.delete(`/students/${sid}`);
    // Optimistic update
    setStudents(prev => prev.filter(s => s.id !== id));
    await refetchAll();
  };

  const addDriver = async (driver: Omit<Driver, 'id'>) => {
    const routeId = driver.busId ? routeByBus[String(driver.busId)] : undefined;
    const { data } = await api.post('/drivers/', {
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      license_no: driver.licenseNumber,
      bus_id: driver.busId ? Number(driver.busId) : undefined,
      route: routeId ? Number(routeId) : undefined,
    });
    // Optimistically add to state for immediate UI feedback
    const created: Driver = {
      id: String(data.id),
      name: data.name,
      email: data.email,
      busId: data.bus_id ? String(data.bus_id) : '',
      licenseNumber: data.license_no || '',
      phone: data.phone || '',
      profileImage: undefined,
    };
    setDrivers(prev => [...prev, created]);
    // Then refetch to stay consistent with backend
    await refetchAll();
  };

  const updateDriver = async (id: string, driverUpdate: Partial<Driver>) => {
    await api.put(`/drivers/${id}`, {
      license_no: driverUpdate.licenseNumber,
      name: driverUpdate.name,
      contact: driverUpdate.phone,
    });
    if (driverUpdate.busId) {
      await api.post(`/drivers/${id}/assign-bus/${driverUpdate.busId}`);
    }
    await refetchAll();
  };

  const deleteDriver = async (id: string) => {
    const did = Number(id);
    await api.delete(`/drivers/${did}`);
    setDrivers(prev => prev.filter(d => d.id !== id));
    await refetchAll();
  };

  const addBus = async (bus: Omit<Bus, 'id' | 'lastUpdated'>) => {
    // Create bus with generated bus_no
    const busNo = `BUS-${Date.now()}`;
    const { data: created } = await api.post('/buses/', {
      bus_no: busNo,
      capacity: bus.capacity || 40,
    });

    const newBusId = String(created.id);

    // Optimistically update UI
    setBuses(prev => [
      {
        id: newBusId,
        routeId: bus.routeId || '',
        driverId: bus.driverId || '',
        capacity: created.capacity || bus.capacity || 40,
        location: { lat: 0, lng: 0 },
        status: 'active',
        lastUpdated: new Date(),
      },
      ...prev,
    ]);

    if (bus.driverId) {
      await api.post(`/drivers/${bus.driverId}/assign-bus/${newBusId}`);
    }
    if (bus.routeId) {
      await api.post(`/routes/${bus.routeId}/assign-bus/${newBusId}`);
    }

    // Ensure mappings refresh
    await refetchAll();
  };

  const updateBus = async (id: string, busUpdate: Partial<Bus>) => {
    // Update capacity via PUT (requires bus_no, so first get bus)
    const { data: current } = await api.get(`/buses/${id}`);
    const newCapacity = busUpdate.capacity ?? current.capacity;
    await api.put(`/buses/${id}`, {
      bus_no: current.bus_no || current.bus_number,
      capacity: newCapacity,
      model: current.model || undefined,
    });

    // Optimistic UI update
    setBuses(prev => prev.map(b => b.id === id ? { ...b, capacity: newCapacity, lastUpdated: new Date() } : b));

    if (busUpdate.driverId) {
      await api.post(`/drivers/${busUpdate.driverId}/assign-bus/${id}`);
    }
    if (busUpdate.routeId) {
      await api.post(`/routes/${busUpdate.routeId}/assign-bus/${id}`);
    }

    await refetchAll();
  };

  const deleteBus = async (id: string) => {
    await api.delete(`/buses/${id}`);
    await refetchAll();
  };

  const updateBusLocation = async (id: string, location: { lat: number; lng: number }) => {
    // Location updates handled via WebSocket in backend; keep local for UI responsiveness
    setBuses(prev => prev.map(b => b.id === id ? { ...b, location, lastUpdated: new Date() } : b));
  };

  const markAttendance = async (item: Omit<AttendanceRecord, 'id' | 'timestamp'>): Promise<boolean> => {
    try {
      await api.post('/attendance/', {
        student_id: Number(item.studentId),
        bus_id: item.busId ? Number(item.busId) : undefined,
        status: item.status,
      });
      // Ensure all derived stats refresh
      await refetchAll();
      return true;
    } catch (e: any) {
      // If already marked today, treat as a no-op and surface false
      return false;
    }
  };

  // Route mutations
  const addRoute = async (route: { name: string; busId?: string; pathJson?: string }) => {
    const { data } = await api.post('/routes/', {
      name: route.name,
      path: route.pathJson ?? undefined,
      bus_id: route.busId ? Number(route.busId) : undefined,
    });
    const newRouteId = String(data.id);
    if (route.busId) {
      await api.post(`/routes/${newRouteId}/assign-bus/${route.busId}`);
    }
    await fetchRoutes();
  };

  const updateRoute = async (id: string, route: { name?: string; busId?: string; pathJson?: string }) => {
    // Get current to keep values
    const current = routes.find(r => r.id === id);
    await api.put(`/routes/${id}`, {
      name: route.name ?? current?.name,
      path: route.pathJson ?? undefined,
      bus_id: route.busId ? Number(route.busId) : route.busId === '' ? null : undefined,
    });
    if (route.busId) {
      await api.post(`/routes/${id}/assign-bus/${route.busId}`);
    }
    await fetchRoutes();
  };

  const deleteRoute = async (id: string) => {
    await api.delete(`/routes/${id}`);
    await fetchRoutes();
  };

  const getStudentAttendance = (studentId: string) => attendance.filter(a => a.studentId === studentId);

  // Utility functions
  const getBusByRoute = (routeId: string) => buses.find(b => b.routeId === routeId);
  const getStudentsByBus = (busId: string) => students.filter(s => s.busId === busId);
  const getDriverByBus = (busId: string) => drivers.find(d => d.busId === busId);

  return (
    <DataContext.Provider value={{
      students,
      drivers,
      buses,
      routes,
      attendance,
      addStudent,
      updateStudent,
      deleteStudent,
      addDriver,
      updateDriver,
      deleteDriver,
      addBus,
      updateBus,
      deleteBus,
      updateBusLocation,
      markAttendance,
      addRoute,
      updateRoute,
      deleteRoute,
      getStudentAttendance,
      getBusByRoute,
      getStudentsByBus,
      getDriverByBus,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
