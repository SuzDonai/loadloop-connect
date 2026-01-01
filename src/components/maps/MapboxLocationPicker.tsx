import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X } from 'lucide-react';

// Maharashtra bounds
const MAHARASHTRA_BOUNDS: [[number, number], [number, number]] = [
  [72.6, 15.6], // Southwest
  [80.9, 22.1], // Northeast
];

const MAHARASHTRA_CENTER: [number, number] = [76.7, 19.0];

interface MapboxLocationPickerProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  label?: string;
}

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
}

const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search location in Maharashtra...",
  label,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-mapbox-token`
        );
        const data = await response.json();
        if (data.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !showMap || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: MAHARASHTRA_CENTER,
      zoom: 6,
      maxBounds: MAHARASHTRA_BOUNDS,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      // Reverse geocode to get place name
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&country=IN&region=Maharashtra`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const placeName = data.features[0].place_name;
            setSearchQuery(placeName);
            onChange(placeName, { lat, lng });
            updateMarker(lng, lat);
          }
        });
    });

    return () => {
      map.current?.remove();
    };
  }, [showMap, mapboxToken, onChange]);

  const updateMarker = (lng: number, lat: number) => {
    if (!map.current) return;

    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }

    map.current.flyTo({ center: [lng, lat], zoom: 12 });
  };

  const searchLocations = useCallback(
    async (query: string) => {
      if (!query || query.length < 3 || !mapboxToken) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${mapboxToken}&country=IN&region=Maharashtra&bbox=${MAHARASHTRA_BOUNDS[0][0]},${MAHARASHTRA_BOUNDS[0][1]},${MAHARASHTRA_BOUNDS[1][0]},${MAHARASHTRA_BOUNDS[1][1]}&limit=5`
        );
        const data = await response.json();
        setSearchResults(data.features || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [mapboxToken]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== value) {
        searchLocations(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchLocations, value]);

  const handleSelectLocation = (result: SearchResult) => {
    setSearchQuery(result.place_name);
    onChange(result.place_name, {
      lat: result.center[1],
      lng: result.center[0],
    });
    setShowResults(false);

    if (map.current) {
      updateMarker(result.center[0], result.center[1]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {label}
        </label>
      )}

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(searchResults.length > 0)}
            placeholder={placeholder}
            className="h-12 pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  onChange('');
                  setSearchResults([]);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMap(!showMap)}
              className="h-8"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelectLocation(result)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-sm">{result.place_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}
      </div>

      {/* Map Container */}
      {showMap && (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <div
            ref={mapContainer}
            className="w-full h-64"
            style={{ minHeight: '256px' }}
          />
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
            Click on map to select location (Maharashtra only)
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxLocationPicker;
