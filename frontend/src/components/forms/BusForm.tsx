import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bus } from '@/contexts/DataContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

interface BusFormProps {
  isOpen: boolean;
  onClose: () => void;
  bus?: Bus;
  isEdit?: boolean;
}

const BusForm = ({ isOpen, onClose, bus, isEdit = false }: BusFormProps) => {
  const { addBus, updateBus, routes, drivers } = useData();
  
  const [formData, setFormData] = useState({
    routeId: bus?.routeId || '',
    driverId: bus?.driverId || '',
    capacity: bus?.capacity || 50,
    status: bus?.status || 'active',
    location: bus?.location || { lat: 40.7128, lng: -74.0060 }
  });

  const [loading, setLoading] = useState(false);

  const availableDrivers = drivers.filter(driver => 
    !bus || driver.busId === bus.id || !driver.busId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit && bus) {
        updateBus(bus.id, formData);
        toast({
          title: "Success",
          description: "Bus updated successfully",
        });
      } else {
        addBus(formData);
        toast({
          title: "Success",
          description: "Bus added successfully",
        });
      }

      onClose();
      setFormData({
        routeId: '',
        driverId: '',
        capacity: 50,
        status: 'active',
        location: { lat: 40.7128, lng: -74.0060 }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update bus information' : 'Enter bus details to add it to the fleet'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <Select 
              value={formData.routeId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, routeId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Assigned Driver</Label>
            <Select 
              value={formData.driverId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, driverId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name} - {driver.licenseNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
              placeholder="Enter bus capacity"
              min="1"
              max="100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Bus['status'] }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.0001"
                value={formData.location.lat}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, lat: parseFloat(e.target.value) }
                }))}
                placeholder="40.7128"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.0001"
                value={formData.location.lng}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, lng: parseFloat(e.target.value) }
                }))}
                placeholder="-74.0060"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Bus' : 'Add Bus')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusForm;