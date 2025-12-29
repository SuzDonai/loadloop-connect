import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Package, 
  Clock, 
  Truck,
  Filter,
  ArrowUpRight
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DriverMatches = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [confirmAcceptId, setConfirmAcceptId] = useState<string | null>(null);

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['driver-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleAccept = async () => {
    if (!confirmAcceptId || !user) return;

    setAcceptingId(confirmAcceptId);
    setConfirmAcceptId(null);

    try {
      const { error } = await supabase
        .from('loads')
        .update({ 
          status: 'assigned',
          assigned_driver_id: user.id 
        })
        .eq('id', confirmAcceptId)
        .eq('status', 'open');

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['driver-matches'] });
      toast.success("Load accepted successfully!", {
        description: "You can view this load in your assigned loads.",
      });
    } catch (error) {
      toast.error("Failed to accept load. It may already be assigned.");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <DashboardLayout userRole="driver" userName={profile?.name || "Driver"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Available Loads</h1>
            <p className="text-muted-foreground">Find and accept loads posted by shippers</p>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Matches Grid */}
        <div className="grid gap-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="lg:w-48">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            ))
          ) : loads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Truck className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No available loads</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                There are no open loads at the moment. Check back later for new opportunities.
              </p>
            </div>
          ) : (
            loads.map((load) => (
              <div
                key={load.id}
                className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Route Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-display font-semibold text-lg">
                              {load.pickup_city} → {load.drop_city}
                            </span>
                            <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-medium">
                              Open
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-secondary" />
                          <span className="text-sm">{load.pickup_city}</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-secondary to-primary" />
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <span className="text-sm">{load.drop_city}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {load.weight} tons
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {load.vehicle_type}
                        </div>
                        <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                          ₹{(load.price || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-48">
                      <Button 
                        onClick={() => setConfirmAcceptId(load.id)}
                        disabled={acceptingId === load.id}
                      >
                        {acceptingId === load.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            Accept Load
                            <ArrowUpRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Pickup Time Banner */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Pickup:</span>
                    <span className="font-medium">
                      {format(new Date(load.pickup_date), 'MMM dd, yyyy')} at {load.pickup_time}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      Posted {formatDistanceToNow(new Date(load.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Accept Confirmation Dialog */}
      <AlertDialog
        open={!!confirmAcceptId}
        onOpenChange={() => setConfirmAcceptId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this load?</AlertDialogTitle>
            <AlertDialogDescription>
              By accepting this load, you commit to picking it up and delivering
              it to the destination. This action will assign the load to you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept}>
              Accept Load
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DriverMatches;
