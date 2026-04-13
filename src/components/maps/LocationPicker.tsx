import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X, Loader2, LocateFixed } from 'lucide-react';

// Fix default marker icons for Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MAHARASHTRA_BOUNDS: L.LatLngBoundsExpression = [
  [15.6, 72.6],
  [22.1, 80.9],
];

const MAHARASHTRA_CENTER: L.LatLngExpression = [19.0, 76.7];

interface LocationPickerProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  label?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "Search location in Maharashtra...",
  label,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !showMap) return;
    if (mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center: MAHARASHTRA_CENTER,
      zoom: 6,
      maxBounds: MAHARASHTRA_BOUNDS,
      minZoom: 5,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Click handler for reverse geocoding
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=in&zoom=10`
        );
        const data = await res.json();
        if (data.display_name) {
          setSearchQuery(data.display_name);
          onChange(data.display_name, { lat, lng });
          updateMarker(lat, lng, map);
        }
      } catch (err) {
        console.error('Reverse geocode failed:', err);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [showMap, onChange]);

  const updateMarker = (lat: number, lng: number, map: L.Map) => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: markerIcon,
          iconRetinaUrl: markerIcon2x,
          shadowUrl: markerShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      }).addTo(map);
    }
    map.flyTo([lat, lng], 12);
  };

  const searchLocations = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const bbox = `${MAHARASHTRA_BOUNDS[0][1]},${MAHARASHTRA_BOUNDS[0][0]},${MAHARASHTRA_BOUNDS[1][1]},${MAHARASHTRA_BOUNDS[1][0]}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&viewbox=${bbox}&bounded=1&limit=5`
      );
      const data: SearchResult[] = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=in&zoom=10`
          );
          const data = await res.json();
          if (data.display_name) {
            setSearchQuery(data.display_name);
            onChange(data.display_name, { lat, lng });
            if (mapRef.current) {
              updateMarker(lat, lng, mapRef.current);
            }
          }
        } catch (err) {
          console.error('Reverse geocode failed:', err);
        } finally {
          setIsLocating(false);
        }
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== value) {
        searchLocations(searchQuery);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchLocations, value]);

  const handleSelectLocation = (result: SearchResult) => {
    setSearchQuery(result.display_name);
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onChange(result.display_name, { lat, lng });
    setShowResults(false);

    if (mapRef.current) {
      updateMarker(lat, lng, mapRef.current);
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
                key={result.place_id}
                type="button"
                onClick={() => handleSelectLocation(result)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-sm">{result.display_name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
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
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground z-[1000]">
            Click on map to select location (Maharashtra only)
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
