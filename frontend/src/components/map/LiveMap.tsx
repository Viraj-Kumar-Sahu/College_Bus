import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import GoogleMap from './GoogleMap';

interface LiveMapProps {
  busId?: string;
  height?: string;
  showControls?: boolean;
}

const LiveMap = ({ busId, height = "400px", showControls = true }: LiveMapProps) => {
  const { buses, routes } = useData();
  
  const displayBuses = busId ? buses.filter(bus => bus.id === busId) : buses;
  
  const getRouteById = (routeId: string) => {
    return routes.find(route => route.id === routeId);
  };

  const getBusStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'delayed': return 'bg-warning';
      case 'completed': return 'bg-muted';
      case 'maintenance': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Google Map */}
      <GoogleMap busId={busId} height={height} />
      
      {/* Bus Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayBuses.map((bus, index) => {
          const route = getRouteById(bus.routeId);
          return (
            <div 
              key={bus.id}
              className="dashboard-card p-4 animate-fade-in"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getBusStatusColor(bus.status)}`}></div>
                  <span className="font-semibold text-foreground">{bus.id}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {bus.lastUpdated.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{route?.name || 'Unknown Route'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">
                    {bus.location.lat.toFixed(4)}, {bus.location.lng.toFixed(4)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-muted-foreground capitalize">{bus.status}</span>
                </div>
              </div>

              {/* Simulated bus movement indicator */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Live Position</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      {showControls && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Center Map
          </button>
          <button className="btn-secondary text-xs">
            <Navigation className="h-3 w-3 mr-1" />
            Follow Bus
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span>Delayed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;