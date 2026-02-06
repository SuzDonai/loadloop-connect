import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface RouteMapProps {
  pickupCity: string;
  dropCity: string;
  className?: string;
}

const geocode = async (query: string): Promise<[number, number] | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`
    );
    const data = await res.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (err) {
    console.error('Geocode failed:', err);
  }
  return null;
};

const RouteMap: React.FC<RouteMapProps> = ({ pickupCity, dropCity, className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setupMap = async () => {
    if (!mapContainer.current) return;
    setLoading(true);
    setError(null);

    try {
      const [pickupCoords, dropCoords] = await Promise.all([
        geocode(pickupCity),
        geocode(dropCity),
      ]);

      if (!pickupCoords || !dropCoords) {
        setError('Could not find one or both locations');
        setLoading(false);
        return;
      }

      // Clean up existing map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(mapContainer.current, {
        center: [19.0, 76.7],
        zoom: 6,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Add markers
      const pickupIcon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      L.marker(pickupCoords, { icon: pickupIcon })
        .bindPopup(`<strong>Pickup:</strong><br/>${pickupCity}`)
        .addTo(map);

      L.marker(dropCoords, { icon: pickupIcon })
        .bindPopup(`<strong>Drop:</strong><br/>${dropCity}`)
        .addTo(map);

      // Fetch route from OSRM
      try {
        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${dropCoords[1]},${dropCoords[0]}?overview=full&geometries=geojson`
        );
        const routeData = await routeRes.json();

        if (routeData.routes?.length) {
          const coords = routeData.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as L.LatLngExpression
          );
          L.polyline(coords, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.75,
          }).addTo(map);
        }
      } catch {
        // If routing fails, draw a straight line
        L.polyline([pickupCoords, dropCoords], {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 10',
        }).addTo(map);
      }

      // Fit bounds
      const bounds = L.latLngBounds(pickupCoords, dropCoords);
      map.fitBounds(bounds, { padding: [50, 50] });

      mapRef.current = map;
    } catch (err) {
      setError('Failed to load map');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setupMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pickupCity, dropCity]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl ${className}`} style={{ minHeight: '200px' }}>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted rounded-xl gap-2 ${className}`} style={{ minHeight: '200px' }}>
        <AlertCircle className="w-8 h-8 text-destructive" />
        <span className="text-sm text-muted-foreground">{error}</span>
        <Button variant="outline" size="sm" onClick={setupMap}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '200px' }} />
    </div>
  );
};

export default RouteMap;
