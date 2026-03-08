import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, AlertCircle, MapPin, Clock, Route, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
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

interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

interface RouteDetails {
  totalDistance: string;
  totalDuration: string;
  steps: RouteStep[];
}

interface RouteMapProps {
  pickupCity: string;
  dropCity: string;
  className?: string;
  showDetails?: boolean;
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

const formatDistance = (meters: number): string => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} min`;
};

// Parse OSRM maneuver type into readable instruction
const parseInstruction = (step: any): string => {
  const maneuver = step.maneuver;
  const name = step.name || 'unnamed road';
  const type = maneuver.type;
  const modifier = maneuver.modifier || '';

  switch (type) {
    case 'depart': return `Head ${modifier} on ${name}`;
    case 'arrive': return `Arrive at destination`;
    case 'turn': return `Turn ${modifier} onto ${name}`;
    case 'merge': return `Merge ${modifier} onto ${name}`;
    case 'fork': return `Take the ${modifier} fork onto ${name}`;
    case 'roundabout': return `Enter roundabout and take exit onto ${name}`;
    case 'rotary': return `Enter rotary and take exit onto ${name}`;
    case 'new name': return `Continue onto ${name}`;
    case 'continue': return `Continue ${modifier} on ${name}`;
    case 'end of road': return `Turn ${modifier} at end of road onto ${name}`;
    case 'ramp': return `Take ramp ${modifier} onto ${name}`;
    case 'exit roundabout': return `Exit roundabout onto ${name}`;
    default: return `Continue on ${name}`;
  }
};

const RouteMap: React.FC<RouteMapProps> = ({ pickupCity, dropCity, className = "", showDetails = true }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const setupMap = async () => {
    if (!mapContainer.current) return;
    setLoading(true);
    setError(null);
    setRouteDetails(null);

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

      // Custom pickup icon (green)
      const pickupIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:28px;height:28px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      // Custom drop icon (red)
      const dropIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:28px;height:28px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      L.marker(pickupCoords, { icon: pickupIcon })
        .bindPopup(`<strong>📍 Pickup:</strong><br/>${pickupCity}`)
        .addTo(map);

      L.marker(dropCoords, { icon: dropIcon })
        .bindPopup(`<strong>🏁 Drop:</strong><br/>${dropCity}`)
        .addTo(map);

      // Fetch route from OSRM with steps
      try {
        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${dropCoords[1]},${dropCoords[0]}?overview=full&geometries=geojson&steps=true`
        );
        const routeData = await routeRes.json();

        if (routeData.routes?.length) {
          const route = routeData.routes[0];
          const coords = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as L.LatLngExpression
          );
          L.polyline(coords, {
            color: '#3b82f6',
            weight: 5,
            opacity: 0.85,
          }).addTo(map);

          // Extract route details
          const totalDistance = route.distance;
          const totalDuration = route.duration;
          const steps: RouteStep[] = [];

          for (const leg of route.legs) {
            for (const step of leg.steps) {
              if (step.distance > 50) { // Filter out very short steps
                steps.push({
                  instruction: parseInstruction(step),
                  distance: formatDistance(step.distance),
                  duration: formatDuration(step.duration),
                });
              }
            }
          }

          setRouteDetails({
            totalDistance: formatDistance(totalDistance),
            totalDuration: formatDuration(totalDuration),
            steps,
          });
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
    <div className="rounded-xl overflow-hidden border border-border">
      {/* Map */}
      <div className={`w-full ${className}`}>
        <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '200px' }} />
      </div>

      {/* Route Details Panel */}
      {showDetails && routeDetails && (
        <div className="bg-card border-t border-border">
          {/* Summary */}
          <div className="flex items-center gap-6 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Route className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="font-semibold text-sm">{routeDetails.totalDistance}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Time</p>
                <p className="font-semibold text-sm">{routeDetails.totalDuration}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Steps</p>
                <p className="font-semibold text-sm">{routeDetails.steps.length}</p>
              </div>
            </div>
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSteps(!showSteps)}
                className="text-xs gap-1"
              >
                {showSteps ? 'Hide' : 'Directions'}
                {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Step-by-step directions */}
          {showSteps && (
            <div className="border-t border-border max-h-64 overflow-y-auto">
              {routeDetails.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                >
                  <div className="flex flex-col items-center mt-0.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0
                        ? 'bg-secondary text-secondary-foreground'
                        : i === routeDetails.steps.length - 1
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{step.instruction}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{step.distance}</span>
                      <span>•</span>
                      <span>{step.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteMap;
