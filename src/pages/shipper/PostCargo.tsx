import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Package, 
  Calendar, 
  ArrowRight,
  Info,
  Route,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LocationPicker from "@/components/maps/LocationPicker";

const vehicleTypes = [
  "Open Truck",
  "Container",
  "Trailer",
  "Mini Truck",
  "Refrigerated",
  "Tanker",
];

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

const PostCargo = () => {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    weight: "",
    volume: "",
    vehicleType: "",
    pickupDate: "",
    pickupTime: "",
    description: "",
    price: "",
    contactPhone: "",
  });
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationSecs, setDurationSecs] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Calculate distance when both coordinates are available
  useEffect(() => {
    if (!pickupCoords || !dropCoords) {
      setDistanceKm(null);
      setDurationSecs(null);
      return;
    }

    const calculateDistance = async () => {
      setIsCalculating(true);
      try {
        // Try Mappls first
        const { data, error } = await supabase.functions.invoke('mappls-distance', {
          body: {
            pickupLat: pickupCoords.lat,
            pickupLon: pickupCoords.lng,
            dropLat: dropCoords.lat,
            dropLon: dropCoords.lng,
          },
        });

        if (!error && data?.distance != null) {
          setDistanceKm(Math.round(data.distance / 1000 * 10) / 10);
          setDurationSecs(data.duration);
        } else {
          // Fallback to OSRM
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropCoords.lng},${dropCoords.lat}?overview=false`
          );
          const osrm = await res.json();
          if (osrm?.routes?.[0]) {
            setDistanceKm(Math.round(osrm.routes[0].distance / 1000 * 10) / 10);
            setDurationSecs(osrm.routes[0].duration);
          }
        }
      } catch (err) {
        console.error('Distance calculation failed:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateDistance();
  }, [pickupCoords, dropCoords]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post cargo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const priceValue = formData.price ? Number(formData.price) : 0;
    const weightValue = Number(formData.weight);
    const volumeValue = formData.volume ? Number(formData.volume) : null;

    const { error } = await supabase.from("loads").insert({
      shipper_id: user.id,
      pickup_city: formData.origin,
      drop_city: formData.destination,
      weight: weightValue,
      volume: volumeValue,
      vehicle_type: formData.vehicleType,
      pickup_date: formData.pickupDate,
      pickup_time: formData.pickupTime,
      description: formData.description || null,
      price: priceValue,
      contact_phone: formData.contactPhone || null,
      status: "open",
      pickup_lat: pickupCoords?.lat ?? null,
      pickup_lon: pickupCoords?.lng ?? null,
      delivery_lat: dropCoords?.lat ?? null,
      delivery_lon: dropCoords?.lng ?? null,
      distance_km: distanceKm,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post cargo. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Cargo Posted Successfully!",
      description: "We're finding the best matches for your shipment.",
    });
    navigate("/shipper/my-loads");
  };

  return (
    <DashboardLayout userRole="shipper" userName={profile?.name || "Shipper"}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Post New Cargo</h1>
          <p className="text-muted-foreground">Fill in the details to find carriers for your shipment</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Route Section */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-2 text-lg font-display font-semibold">
              <MapPin className="w-5 h-5 text-primary" />
              Route Details
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <LocationPicker
                value={formData.origin}
                onChange={(location, coords) => {
                  setFormData({ ...formData, origin: location });
                  setPickupCoords(coords ?? null);
                }}
                placeholder="Search pickup location..."
                label="Pickup Location"
              />
              <LocationPicker
                value={formData.destination}
                onChange={(location, coords) => {
                  setFormData({ ...formData, destination: location });
                  setDropCoords(coords ?? null);
                }}
                placeholder="Search drop location..."
                label="Drop Location"
              />
            </div>

            {/* Distance & Duration display */}
            {(isCalculating || distanceKm !== null) && (
              <div className="flex items-center gap-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                {isCalculating ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating distance...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Route className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Distance</p>
                        <p className="font-semibold text-sm">{distanceKm} km</p>
                      </div>
                    </div>
                    {durationSecs && (
                      <>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Est. Time</p>
                            <p className="font-semibold text-sm">{formatDuration(durationSecs)}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cargo Section */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-2 text-lg font-display font-semibold">
              <Package className="w-5 h-5 text-primary" />
              Cargo Details
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (tons)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  placeholder="e.g., 16"
                  value={formData.weight}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">Volume (cubic meters)</Label>
                <Input
                  id="volume"
                  name="volume"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.volume}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Preferred Vehicle Type</Label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full h-12 px-3 rounded-lg border border-input bg-background"
                required
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="1"
                min="0"
                placeholder="e.g., 25000"
                value={formData.price}
                onChange={handleChange}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone Number</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                placeholder="e.g., +91 9876543210"
                value={formData.contactPhone}
                onChange={handleChange}
                className="h-12"
                required
              />
              <p className="text-xs text-muted-foreground">
                This number will be shared with the driver once they accept the load
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Cargo Description (Optional)</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your cargo (e.g., electronics, perishables, machinery)"
                value={formData.description}
                onChange={handleChange}
                className="w-full min-h-24 px-3 py-2 rounded-lg border border-input bg-background resize-none"
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-2 text-lg font-display font-semibold">
              <Calendar className="w-5 h-5 text-primary" />
              Schedule
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Input
                  id="pickupDate"
                  name="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupTime">Pickup Time</Label>
                <Input
                  id="pickupTime"
                  name="pickupTime"
                  type="time"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">AI-Powered Matching</p>
              <p className="text-muted-foreground">
                Our smart algorithm will find the best carriers for your route, optimizing for cost, time, and sustainability.
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button variant="hero" size="xl" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                Post Cargo
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostCargo;
