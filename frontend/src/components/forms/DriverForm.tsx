import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Driver } from '@/contexts/DataContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

interface DriverFormProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: Driver;
  isEdit?: boolean;
}

const DriverForm = ({ isOpen, onClose, driver, isEdit = false }: DriverFormProps) => {
  const { addDriver, updateDriver, buses, routes } = useData();
  
  const [formData, setFormData] = useState({
    name: driver?.name || '',
    email: driver?.email || '',
    busId: driver?.busId || '',
    licenseNumber: driver?.licenseNumber || '',
    phone: driver?.phone || '',
    profileImage: driver?.profileImage || ''
  });

  const [loading, setLoading] = useState(false);

  const getRouteByBusId = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    return routes.find(r => r.id === bus?.routeId);
  };

  const availableBuses = buses.filter(bus => 
    !driver || bus.driverId === driver.id || !bus.driverId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && driver) {
        updateDriver(driver.id, formData);
        toast({
          title: "Success",
          description: "Driver updated successfully",
        });
      } else {
        addDriver(formData);
        toast({
          title: "Success",
          description: "Driver added successfully",
        });
      }

      onClose();
      setFormData({
        name: '',
        email: '',
        busId: '',
        licenseNumber: '',
        phone: '',
        profileImage: ''
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
          <DialogTitle>{isEdit ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update driver information' : 'Enter driver details to add them to the system'}
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
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license">License Number</Label>
            <Input
              id="license"
              value={formData.licenseNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
              placeholder="Enter license number"
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
                {availableBuses.map((bus) => {
                  const route = getRouteByBusId(bus.id);
                  return (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.id} - {route?.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {formData.busId && (
              <p className="text-xs text-muted-foreground">Route: {getRouteByBusId(formData.busId)?.name || 'N/A'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Profile Image URL (Optional)</Label>
            <Input
              id="profileImage"
              value={formData.profileImage}
              onChange={(e) => setFormData(prev => ({ ...prev, profileImage: e.target.value }))}
              placeholder="Enter image URL"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Driver' : 'Add Driver')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverForm;