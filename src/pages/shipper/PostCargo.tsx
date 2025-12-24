import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Package, 
  Calendar, 
  Truck,
  ArrowRight,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const vehicleTypes = [
  "Open Truck",
  "Container",
  "Trailer",
  "Mini Truck",
  "Refrigerated",
  "Tanker",
];

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
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual cargo posting with Supabase
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Cargo Posted Successfully!",
        description: "We're finding the best matches for your shipment.",
      });
      navigate("/shipper/loads");
    }, 1500);
  };

  return (
    <DashboardLayout userRole="shipper" userName="ABC Logistics">
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
              <div className="space-y-2">
                <Label htmlFor="origin">Pickup Location</Label>
                <Input
                  id="origin"
                  name="origin"
                  placeholder="e.g., Pune, Maharashtra"
                  value={formData.origin}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Delivery Location</Label>
                <Input
                  id="destination"
                  name="destination"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={formData.destination}
                  onChange={handleChange}
                  className="h-12"
                  required
                />
              </div>
            </div>
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
