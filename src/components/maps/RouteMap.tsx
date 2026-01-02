import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RouteMapProps {
  pickupCity: string;
  dropCity: string;
  className?: string;
}

const MAHARASHTRA_CENTER: [number, number] = [76.7, 19.0];

const RouteMap: React.FC<RouteMapProps> = ({ pickupCity, dropCity, className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Please log in to view the map');
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

      if (!response.ok) {
        throw new Error('Failed to fetch map token');
      }

      const data = await response.json();
      if (data.token) {
        setMapboxToken(data.token);
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: MAHARASHTRA_CENTER,
      zoom: 6,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Geocode both cities and add markers
    const geocodeAndAddMarkers = async () => {
      try {
        // Geocode pickup
        const pickupRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(pickupCity)}.json?access_token=${mapboxToken}&country=IN&limit=1`
        );
        const pickupData = await pickupRes.json();
        
        // Geocode drop
        const dropRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(dropCity)}.json?access_token=${mapboxToken}&country=IN&limit=1`
        );
        const dropData = await dropRes.json();

        if (pickupData.features?.length && dropData.features?.length && map.current) {
          const pickupCoords = pickupData.features[0].center as [number, number];
          const dropCoords = dropData.features[0].center as [number, number];

          // Add pickup marker (green)
          new mapboxgl.Marker({ color: '#10b981' })
            .setLngLat(pickupCoords)
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup:</strong><br/>${pickupCity}`))
            .addTo(map.current);

          // Add drop marker (blue)
          new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat(dropCoords)
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>Drop:</strong><br/>${dropCity}`))
            .addTo(map.current);

          // Fetch route
          const routeRes = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropCoords[0]},${dropCoords[1]}?geometries=geojson&access_token=${mapboxToken}`
          );
          const routeData = await routeRes.json();

          if (routeData.routes?.length && map.current) {
            const route = routeData.routes[0].geometry;

            map.current.on('load', () => {
              if (!map.current) return;
              
              map.current.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route,
                },
              });

              map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round',
                },
                paint: {
                  'line-color': '#3b82f6',
                  'line-width': 4,
                  'line-opacity': 0.75,
                },
              });
            });

            // If map is already loaded
            if (map.current.isStyleLoaded()) {
              if (!map.current.getSource('route')) {
                map.current.addSource('route', {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    properties: {},
                    geometry: route,
                  },
                });

                map.current.addLayer({
                  id: 'route',
                  type: 'line',
                  source: 'route',
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                  },
                  paint: {
                    'line-color': '#3b82f6',
                    'line-width': 4,
                    'line-opacity': 0.75,
                  },
                });
              }
            }
          }

          // Fit bounds to show both points
          const bounds = new mapboxgl.LngLatBounds();
          bounds.extend(pickupCoords);
          bounds.extend(dropCoords);
          map.current.fitBounds(bounds, { padding: 50 });
        }
      } catch (err) {
        console.error('Failed to geocode locations:', err);
      }
    };

    geocodeAndAddMarkers();

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, pickupCity, dropCity]);

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
        <Button variant="outline" size="sm" onClick={fetchToken}>
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
