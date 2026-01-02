import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  MapPin, 
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

const RideMap = () => {
  const { loadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const [load, setLoad] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
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

  // Fetch Mapbox token
  const fetchToken = useCallback(async () => {
    setTokenError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setTokenError('Please log in to view the map');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-mapbox-token`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch map token');

      const data = await response.json();
      if (data.token) {
        setMapboxToken(data.token);
      }
    } catch (err) {
      setTokenError('Failed to load map');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Initialize map with route
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !load) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [76.7, 19.0],
      zoom: 6,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    }), 'top-right');

    const setupRoute = async () => {
      try {
        // Geocode pickup
        const pickupRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(load.pickup_city)}.json?access_token=${mapboxToken}&country=IN&limit=1`
        );
        const pickupData = await pickupRes.json();

        // Geocode drop
        const dropRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(load.drop_city)}.json?access_token=${mapboxToken}&country=IN&limit=1`
        );
        const dropData = await dropRes.json();

        if (pickupData.features?.length && dropData.features?.length && map.current) {
          const pickupCoords = pickupData.features[0].center as [number, number];
          const dropCoords = dropData.features[0].center as [number, number];

          // Add pickup marker
          const pickupEl = document.createElement('div');
          pickupEl.className = 'pickup-marker';
          pickupEl.innerHTML = `<div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>`;
          
          new mapboxgl.Marker(pickupEl)
            .setLngLat(pickupCoords)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong class="text-emerald-600">Pickup</strong><br/>${load.pickup_city}`))
            .addTo(map.current);

          // Add drop marker
          const dropEl = document.createElement('div');
          dropEl.className = 'drop-marker';
          dropEl.innerHTML = `<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>`;

          new mapboxgl.Marker(dropEl)
            .setLngLat(dropCoords)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong class="text-blue-600">Drop</strong><br/>${load.drop_city}`))
            .addTo(map.current);

          // Get directions
          const routeRes = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropCoords[0]},${dropCoords[1]}?geometries=geojson&overview=full&access_token=${mapboxToken}`
          );
          const routeData = await routeRes.json();

          if (routeData.routes?.length && map.current) {
            const route = routeData.routes[0];
            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationHrs = Math.floor(route.duration / 3600);
            const durationMins = Math.floor((route.duration % 3600) / 60);

            setRouteInfo({
              distance: `${distanceKm} km`,
              duration: durationHrs > 0 ? `${durationHrs}h ${durationMins}m` : `${durationMins} min`,
            });

            map.current.on('load', () => {
              if (!map.current) return;

              map.current.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route.geometry,
                },
              });

              map.current.addLayer({
                id: 'route-bg',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#1e40af', 'line-width': 8, 'line-opacity': 0.4 },
              });

              map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#3b82f6', 'line-width': 5 },
              });
            });

            // If already loaded
            if (map.current.isStyleLoaded() && !map.current.getSource('route')) {
              map.current.addSource('route', {
                type: 'geojson',
                data: { type: 'Feature', properties: {}, geometry: route.geometry },
              });

              map.current.addLayer({
                id: 'route-bg',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#1e40af', 'line-width': 8, 'line-opacity': 0.4 },
              });

              map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#3b82f6', 'line-width': 5 },
              });
            }
          }

          // Fit bounds
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(pickupCoords);
          bounds.extend(dropCoords);
          map.current.fitBounds(bounds, { padding: 80 });
        }
      } catch (err) {
        console.error('Failed to setup route:', err);
      }
    };

    setupRoute();

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, load]);

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

  if (tokenError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">{tokenError}</p>
        <Button onClick={fetchToken}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Full screen map */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-card/95 backdrop-blur rounded-xl shadow-lg px-6 py-3 flex items-center gap-6">
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
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-card/95 backdrop-blur-lg border-t border-border rounded-t-3xl shadow-2xl">
        <div className="p-6 space-y-4">
          {/* Route summary */}
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

          {/* Load details */}
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

          {/* Actions */}
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
