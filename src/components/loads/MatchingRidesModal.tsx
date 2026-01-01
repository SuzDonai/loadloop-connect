import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  Phone,
  Mail,
  Truck,
  Award,
  MapPin,
  CheckCircle,
} from "lucide-react";
import {
  fetchMatchingDrivers,
  type Driver,
} from "@/data/mockDrivers";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type Load = Tables<'loads'>;

interface MatchingRidesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  load: Load | null;
  onAssign?: (loadId: string, driverId: string) => void;
}

export function MatchingRidesModal({
  open,
  onOpenChange,
  load,
  onAssign,
}: MatchingRidesModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (open && load) {
      loadDrivers();
    }
  }, [open, load]);

  const loadDrivers = async () => {
    if (!load) return;
    setIsLoading(true);
    try {
      const data = await fetchMatchingDrivers(load.id);
      setDrivers(data);
    } catch (error) {
      toast.error("Failed to load matching drivers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (driverId: string) => {
    if (!load) return;
    setAssigningId(driverId);
    try {
      // Get current user to ensure shipper owns the load
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to assign a driver");
        return;
      }

      // Update load in database with driver assignment
      // RLS policies ensure only the shipper who owns the load can update it
      const { error } = await supabase
        .from('loads')
        .update({ 
          assigned_driver_id: driverId,
          status: 'assigned'
        })
        .eq('id', load.id)
        .eq('shipper_id', user.id) // Ensure shipper owns the load
        .eq('status', 'open'); // Only assign if still open

      if (error) {
        console.error('Failed to assign driver:', error);
        toast.error("Failed to assign driver. Please try again.");
        return;
      }

      toast.success("Driver assigned successfully!");
      onAssign?.(load.id, driverId);
      onOpenChange(false);
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error("Failed to assign driver");
    } finally {
      setAssigningId(null);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone.replace(/\s/g, "")}`, "_self");
    toast.info("Opening phone dialer...");
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, "_self");
    toast.info("Opening email client...");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Matching Rides
          </DialogTitle>
          {load && (
            <DialogDescription className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {load.pickup_city} → {load.drop_city}
              <span className="text-muted-foreground">•</span>
              {load.weight} tons
              <span className="text-muted-foreground">•</span>
              ₹{(load.price || 0).toLocaleString("en-IN")}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-4 py-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 border rounded-xl"
                >
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No matching drivers</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                There are no available drivers matching this load at the moment.
                Please check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="group border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Avatar and basic info */}
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold truncate">
                            {driver.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        </div>
                        <div className="mt-1">{renderStars(driver.rating)}</div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            {driver.vehicleType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            {driver.totalTrips} trips
                          </span>
                          <span>{driver.experience} exp</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {driver.vehicleNumber}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <Button
                        size="sm"
                        onClick={() => handleAssign(driver.id)}
                        disabled={!!assigningId}
                        className="flex-1 sm:flex-none"
                      >
                        {assigningId === driver.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                            Assigning...
                          </>
                        ) : (
                          "Assign Driver"
                        )}
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCall(driver.phone)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEmail(driver.email)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isLoading && drivers.length > 0 && (
          <div className="pt-4 border-t text-center text-sm text-muted-foreground">
            Showing {drivers.length} available driver
            {drivers.length !== 1 ? "s" : ""} for this route
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
