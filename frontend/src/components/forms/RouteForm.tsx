import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/hooks/use-toast';

interface RouteFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const RouteForm = ({ isOpen, onClose }: RouteFormProps) => {
  const { addRoute, buses, routes } = useData();

  const [formData, setFormData] = useState({
    name: '',
    busId: '',
    pathJson: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If no path provided, create a simple default path with three demo stops
      let pathJson = formData.pathJson;
      if (!pathJson || pathJson.trim() === '') {
        const defaultStops = [
          { id: 's1', name: 'Stop A', coordinates: { lat: 26.9124, lng: 75.7873 }, time: '08:00' },
          { id: 's2', name: 'Stop B', coordinates: { lat: 26.9220, lng: 75.8000 }, time: '08:15' },
          { id: 's3', name: 'Campus', coordinates: { lat: 26.9350, lng: 75.8100 }, time: '08:30' },
        ];
        pathJson = JSON.stringify(defaultStops);
      }

      await addRoute({
        name: formData.name,
        busId: formData.busId || undefined,
        pathJson,
      });
      toast({ title: 'Success', description: 'Route added successfully' });
      onClose();
      setFormData({ name: '', busId: '', pathJson: '' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add route', variant: 'destructive' });
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add New Route</DialogTitle>
          <DialogDescription>Enter route details. Path JSON is optional.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Route Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Route A - City Center"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bus">Assign to Bus (optional)</Label>
            <Select value={formData.busId} onValueChange={(v) => setFormData(prev => ({ ...prev, busId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    {bus.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">Path JSON (optional)</Label>
            <Textarea
              id="path"
              value={formData.pathJson}
              onChange={(e) => setFormData(prev => ({ ...prev, pathJson: e.target.value }))}
              placeholder='e.g., [{"lat":12.34,"lng":56.78},{"lat":12.35,"lng":56.79}]'
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Add Route'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RouteForm;
