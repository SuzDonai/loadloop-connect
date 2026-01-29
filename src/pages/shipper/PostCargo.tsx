import { useState } from "react";
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
  Check,
  ChevronsUpDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const vehicleTypes = [
  "Open Truck",
  "Container",
  "Trailer",
  "Mini Truck",
  "Refrigerated",
  "Tanker",
];

const maharashtraCities = [
  "Ahilyanagar",
  "Akola",
  "Amravati",
  "Chhatrapati Sambhajinagar",
  "Beed",
  "Bhandara",
  "Buldhana",
  "Chandrapur",
  "Dhule",
  "Gadchiroli",
  "Gondia",
  "Hingoli",
  "Jalgaon",
  "Jalna",
  "Kolhapur",
  "Latur",
  "Mumbai City",
  "Mumbai Suburban",
  "Nagpur",
  "Nanded",
  "Nandurbar",
  "Nashik",
  "Dharashiv",
  "Palghar",
  "Parbhani",
  "Pune",
  "Raigad",
  "Ratnagiri",
  "Sangli",
  "Satara",
  "Sindhudurg",
  "Solapur",
  "Thane",
  "Wardha",
  "Washim",
  "Yavatmal",
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
    price: "",
    contactPhone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

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

    // Parse numeric values - use Number() for better precision with integers
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
              <div className="space-y-2">
                <Label>Pickup Location</Label>
                <Popover open={originOpen} onOpenChange={setOriginOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={originOpen}
                      className="w-full h-12 justify-between font-normal"
                    >
                      {formData.origin || "Select pickup city..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search city..." />
                      <CommandList>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                          {maharashtraCities.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={(currentValue) => {
                                setFormData({ ...formData, origin: currentValue });
                                setOriginOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.origin === city ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Delivery Location</Label>
                <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={destinationOpen}
                      className="w-full h-12 justify-between font-normal"
                    >
                      {formData.destination || "Select delivery city..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search city..." />
                      <CommandList>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup>
                          {maharashtraCities.map((city) => (
                            <CommandItem
                              key={city}
                              value={city}
                              onSelect={(currentValue) => {
                                setFormData({ ...formData, destination: currentValue });
                                setDestinationOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.destination === city ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {city}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
