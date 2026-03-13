import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Student } from '@/contexts/DataContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  isEdit?: boolean;
}

const StudentForm = ({ isOpen, onClose, student, isEdit = false }: StudentFormProps) => {
  const { addStudent, updateStudent, buses, routes } = useData();
  
  const [formData, setFormData] = useState({
    name: student?.name || '',
    email: student?.email || '',
    rollNo: '',
    studentName: '',
    studentContact: '',
    busId: student?.busId || '',
  });

  const [loading, setLoading] = useState(false);

  const getRouteByBusId = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    return routes.find(r => r.id === bus?.routeId);
  };

  const selectedRoute = formData.busId ? getRouteByBusId(formData.busId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && student) {
        updateStudent(student.id, formData);
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        addStudent(formData);
        toast({
          title: "Success",
          description: "Student added successfully",
        });
      }

      onClose();
      setFormData({
        name: '',
        email: '',
        rollNo: '',
        studentName: '',
        studentContact: '',
        busId: '',
      });
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.message || 'Something went wrong. Please try again.';
      toast({
        title: "Error",
        description: msg,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update student information' : 'Enter student details to add them to the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roll">Roll Number</Label>
            <Input
              id="roll"
              value={formData.rollNo}
              onChange={(e) => setFormData(prev => ({ ...prev, rollNo: e.target.value }))}
              placeholder="e.g., CS2025-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              value={formData.studentName}
              onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
              placeholder="Student full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentContact">Student Contact</Label>
            <Input
              id="studentContact"
              value={formData.studentContact}
              onChange={(e) => setFormData(prev => ({ ...prev, studentContact: e.target.value }))}
              placeholder="e.g., 9876543210"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bus">Assigned Bus</Label>
            <Select 
              value={formData.busId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, busId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus) => {
                  const route = getRouteByBusId(bus.id);
                  return (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.id} - {route?.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedRoute && (
              <p className="text-xs text-muted-foreground">Route: {selectedRoute.name}</p>
            )}
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Student' : 'Add Student')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;