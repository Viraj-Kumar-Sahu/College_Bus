import React, { useEffect, useRef, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { MapPin, Navigation, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleMapProps {
  busId?: string;
  height?: string;
  center?: { lat: number; lng: number };
}

const GoogleMap = ({ 
  busId, 
  height = "400px", 
  center = { lat: 26.9124, lng: 75.7873 } // Jaipur, India
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const { buses, routes } = useData();

  const recenterMap = () => {
    if (!mapInstanceRef.current) return;
    
    const displayBuses = busId ? buses.filter(bus => bus.id === busId) : buses;
    if (displayBuses.length > 0) {
      const firstBus = displayBuses[0];
      mapInstanceRef.current.setCenter({ lat: firstBus.location.lat, lng: firstBus.location.lng });
      mapInstanceRef.current.setZoom(14);
    } else {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(12);
    }
  };

  // Load Google Maps script
  useEffect(() => {
    if ((window as any).google?.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDEdWtiwFVmtfxw0W40FSoZTmTRWSDL3Zk&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.warn('Google Maps failed to load, using fallback map');
      setIsLoaded(false);
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !(window as any).google?.maps) return;

    try {
      const google = (window as any).google;
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
    } catch (error) {
      console.warn('Failed to initialize Google Maps:', error);
      setIsLoaded(false);
    }
  }, [isLoaded, center]);

  // Update bus markers
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;

    const displayBuses = busId ? buses.filter(bus => bus.id === busId) : buses;
    const google = (window as any).google;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    // Add new markers
    displayBuses.forEach(bus => {
      const route = routes.find(r => r.id === bus.routeId);
      
      try {
        const marker = new google.maps.Marker({
          position: { lat: bus.location.lat, lng: bus.location.lng },
          map: mapInstanceRef.current,
          title: `Bus ${bus.id} - ${route?.name || 'Unknown Route'}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
                <path d="M12 14h16v8H12z" fill="white"/>
                <circle cx="16" cy="26" r="2" fill="white"/>
                <circle cx="24" cy="26" r="2" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">Bus ${bus.id}</h3>
              <p style="margin: 0; color: #666;">Route: ${route?.name || 'Unknown'}</p>
              <p style="margin: 4px 0 0 0; color: #666;">Status: ${bus.status}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.set(bus.id, marker);
      } catch (error) {
        console.warn('Failed to create marker for bus:', bus.id, error);
      }
    });
  }, [buses, routes, busId]);

  // Fallback map for when Google Maps doesn't load
  if (!isLoaded || !(window as any).google?.maps) {
    return (
      <div 
        className="relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-border overflow-hidden flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center space-y-4">
          <MapPin className="h-12 w-12 text-primary mx-auto" />
          <div>
            <h3 className="font-semibold text-foreground">Map Loading...</h3>
            <p className="text-sm text-muted-foreground">
              Simulated bus tracking for Jaipur area
            </p>
          </div>
          
          {/* Show bus positions in fallback */}
          <div className="grid gap-2 max-w-sm">
            {(busId ? buses.filter(bus => bus.id === busId) : buses.slice(0, 3)).map(bus => {
              const route = routes.find(r => r.id === bus.routeId);
              return (
                <div key={bus.id} className="flex items-center gap-2 text-sm bg-card/50 rounded p-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="font-medium">Bus {bus.id}</span>
                  <span className="text-muted-foreground">({route?.name})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full rounded-lg border border-border shadow-lg"
        style={{ height }}
      />
      <Button
        onClick={recenterMap}
        size="icon"
        className="absolute top-4 right-4 shadow-md"
        title="Recenter map to bus location"
      >
        <Locate className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default GoogleMap;