import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Navigation, 
  Package, 
  Clock, 
  Phone,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Fix default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconImg from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIconImg,
  shadowUrl: markerShadow,
});

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

const RideMap = () => {
  const { loadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  const [load, setLoad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [completing, setCompleting] = useState(false);

  // Fetch load data
  useEffect(() => {
    const fetchLoad = async () => {
      if (!loadId || !user) return;

      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('id', loadId)
        .eq('assigned_driver_id', user.id)
        .maybeSingle();

      if (error || !data) {
        toast.error('Load not found or not assigned to you');
        navigate('/driver/matches');
        return;
      }

      setLoad(data);
    };

    fetchLoad();
  }, [loadId, user, navigate]);

  // Initialize map with route
  const setupMap = useCallback(async () => {
    if (!mapContainer.current || !load) return;
    setMapError(null);

    try {
      const [pickupCoords, dropCoords] = await Promise.all([
        geocode(load.pickup_city),
        geocode(load.drop_city),
      ]);

      if (!pickupCoords || !dropCoords) {
        setMapError('Could not find one or both locations');
        setLoading(false);
        return;
      }

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

      // Pickup marker (green)
      const pickupMarkerIcon = L.divIcon({
        html: `<div style="width:32px;height:32px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(pickupCoords, { icon: pickupMarkerIcon })
        .bindPopup(`<strong style="color:#10b981">Pickup</strong><br/>${load.pickup_city}`)
        .addTo(map);

      // Drop marker (blue)
      const dropMarkerIcon = L.divIcon({
        html: `<div style="width:32px;height:32px;background:#3b82f6;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(dropCoords, { icon: dropMarkerIcon })
        .bindPopup(`<strong style="color:#3b82f6">Drop</strong><br/>${load.drop_city}`)
        .addTo(map);

      // Get route from OSRM
      try {
        const routeRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${dropCoords[1]},${dropCoords[0]}?overview=full&geometries=geojson`
        );
        const routeData = await routeRes.json();

        if (routeData.routes?.length) {
          const route = routeData.routes[0];
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationHrs = Math.floor(route.duration / 3600);
          const durationMins = Math.floor((route.duration % 3600) / 60);

          setRouteInfo({
            distance: `${distanceKm} km`,
            duration: durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins} min`,
          });

          const coords = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as L.LatLngExpression
          );

          // Route background
          L.polyline(coords, {
            color: '#1e40af',
            weight: 8,
            opacity: 0.4,
          }).addTo(map);

          // Route foreground
          L.polyline(coords, {
            color: '#3b82f6',
            weight: 5,
          }).addTo(map);
        }
      } catch {
        L.polyline([pickupCoords, dropCoords], {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 10',
        }).addTo(map);
      }

      // Fit bounds
      const bounds = L.latLngBounds(pickupCoords, dropCoords);
      map.fitBounds(bounds, { padding: [80, 80] });

      mapRef.current = map;
    } catch (err) {
      setMapError('Failed to load map');
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    if (load) setupMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [load, setupMap]);

  const handleCompleteRide = async () => {
    if (!loadId) return;
    setCompleting(true);

    try {
      const { error } = await supabase
        .from('loads')
        .update({ status: 'completed' })
        .eq('id', loadId)
        .eq('assigned_driver_id', user?.id);

      if (error) throw error;

      toast.success('Ride completed successfully!');
      navigate('/driver/matches');
    } catch (err) {
      toast.error('Failed to complete ride');
    } finally {
      setCompleting(false);
    }
  };

  if (loading || !load) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">{mapError}</p>
        <Button onClick={setupMap}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Full screen map */}
      <div ref={mapContainer} className="absolute inset-0 z-0" />

      {/* Back button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => navigate('/driver/matches')}
          className="shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Route info card */}
      {routeInfo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-card/95 backdrop-blur rounded-xl shadow-lg px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            <span className="font-semibold">{routeInfo.distance}</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">{routeInfo.duration}</span>
          </div>
        </div>
      )}

      {/* Bottom card */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-lg border-t border-border rounded-t-3xl shadow-2xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">{load.pickup_city}</span>
              </div>
              <div className="ml-1.5 w-px h-4 bg-gradient-to-b from-emerald-500 to-blue-500" />
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">{load.drop_city}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">₹{(load.price || 0).toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">{load.weight} tons</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
              <Package className="w-4 h-4" />
              <span>{load.vehicle_type}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(load.pickup_date), 'MMM dd')} at {load.pickup_time}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.open(`tel:+919999999999`, '_self')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Shipper
            </Button>
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCompleteRide}
              disabled={completing}
            >
              {completing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Complete Ride
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideMap;
