import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LocationState {
  lat: number;
  lon: number;
}

export function useDriverLocation(autoRefreshMs = 30000) {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationState | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateLocation = useCallback(async () => {
    if (!user?.id) return;
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setStatus('error');
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });

        const { error: dbError } = await supabase
          .from('profiles')
          .update({
            current_lat: latitude,
            current_lon: longitude,
            last_location_update: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (dbError) {
          console.error('Failed to save location:', dbError);
          setError('Failed to save location');
          setStatus('error');
        } else {
          setError(null);
          setStatus('success');
        }
      },
      (geoError) => {
        setError(geoError.message);
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [user?.id]);

  useEffect(() => {
    updateLocation();
    const interval = setInterval(updateLocation, autoRefreshMs);
    return () => clearInterval(interval);
  }, [updateLocation, autoRefreshMs]);

  return { location, status, error, refresh: updateLocation };
}
