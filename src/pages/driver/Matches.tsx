import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Package, 
  Clock, 
  Truck,
  Filter,
  ArrowUpRight,
  Navigation,
  Square,
  Phone,
  User
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RouteMap from "@/components/maps/RouteMap";

const DriverMatches = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [confirmAcceptId, setConfirmAcceptId] = useState<string | null>(null);
  const [endingTripId, setEndingTripId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("available");

  // Fetch available loads
  const { data: availableLoads = [], isLoading: loadingAvailable } = useQuery({
    queryKey: ['driver-available-loads'],
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

  // Fetch accepted/assigned loads with shipper info
  const { data: acceptedLoads = [], isLoading: loadingAccepted } = useQuery({
    queryKey: ['driver-accepted-loads', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: loadsData, error } = await supabase
        .from('loads')
        .select('*')
        .eq('assigned_driver_id', user.id)
        .in('status', ['assigned', 'in_progress'])
        .order('pickup_date', { ascending: true });
      
      if (error) throw error;
      if (!loadsData || loadsData.length === 0) return [];

      // Fetch shipper profiles for accepted loads
      const shipperIds = [...new Set(loadsData.map(load => load.shipper_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, phone')
        .in('id', shipperIds);

      // Attach shipper info to loads
      return loadsData.map(load => ({
        ...load,
        shipper_name: profiles?.find(p => p.id === load.shipper_id)?.name || 'Unknown',
        shipper_phone: profiles?.find(p => p.id === load.shipper_id)?.phone || null,
      }));
    },
    enabled: !!user?.id,
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
      
      queryClient.invalidateQueries({ queryKey: ['driver-available-loads'] });
      queryClient.invalidateQueries({ queryKey: ['driver-accepted-loads'] });
      toast.success("Load accepted successfully!", {
        description: "You can view this load in your accepted loads.",
      });
      setActiveTab("accepted");
    } catch (error) {
      toast.error("Failed to accept load. It may already be assigned.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleEndTrip = async (loadId: string) => {
    setEndingTripId(loadId);
    try {
      const { error } = await supabase
        .from('loads')
        .update({ status: 'completed' })
        .eq('id', loadId)
        .eq('assigned_driver_id', user?.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['driver-accepted-loads'] });
      toast.success("Trip completed successfully!", {
        description: "The load has been marked as delivered.",
      });
    } catch (error) {
      toast.error("Failed to complete trip. Please try again.");
    } finally {
      setEndingTripId(null);
    }
  };

  const isLoading = activeTab === "available" ? loadingAvailable : loadingAccepted;
  const loads = activeTab === "available" ? availableLoads : acceptedLoads;

  return (
    <DashboardLayout userRole="driver" userName={profile?.name || "Driver"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">My Loads</h1>
            <p className="text-muted-foreground">Manage your available and accepted loads</p>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="available" className="gap-2">
              <Truck className="w-4 h-4" />
              Available ({availableLoads.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="gap-2">
              <Navigation className="w-4 h-4" />
              Ongoing Trip ({acceptedLoads.length})
            </TabsTrigger>
          </TabsList>

          {/* Available Loads */}
          <TabsContent value="available" className="mt-6">
            <div className="grid gap-6">
              {loadingAvailable ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-4">
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
              ) : availableLoads.length === 0 ? (
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
                availableLoads.map((load) => (
                  <div
                    key={load.id}
                    className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
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
          </TabsContent>

          {/* Ongoing Trip */}
          <TabsContent value="accepted" className="mt-6">
            <div className="grid gap-6">
              {loadingAccepted ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border p-6">
                    <Skeleton className="h-64 w-full mb-4" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                ))
              ) : acceptedLoads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Navigation className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No ongoing trips</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm">
                    Accept a load from the available tab to start your trip.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab("available")}
                  >
                    Browse Available Loads
                  </Button>
                </div>
              ) : (
                acceptedLoads.map((load) => (
                  <div
                    key={load.id}
                    className="bg-card rounded-2xl border-2 border-primary/20 shadow-lg overflow-hidden"
                  >
                    {/* Large Map with Route */}
                    <RouteMap 
                      pickupCity={load.pickup_city} 
                      dropCity={load.drop_city}
                      className="h-64"
                    />

                    <div className="p-6 space-y-6">
                      {/* Route Info */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                          <div>
                            <p className="text-xs text-muted-foreground">Pickup</p>
                            <p className="font-semibold">{load.pickup_city}</p>
                          </div>
                        </div>
                        <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500 via-primary to-red-500 rounded-full" />
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground text-right">Destination</p>
                            <p className="font-semibold">{load.drop_city}</p>
                          </div>
                          <div className="w-4 h-4 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                        </div>
                      </div>

                      {/* Load Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <Package className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="font-semibold">{load.weight} tons</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <Truck className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">Vehicle</p>
                          <p className="font-semibold text-sm">{load.vehicle_type}</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">Pickup</p>
                          <p className="font-semibold text-sm">{format(new Date(load.pickup_date), 'MMM dd')}</p>
                        </div>
                        <div className="bg-primary/10 rounded-xl p-3 text-center">
                          <p className="text-xs text-primary">Earnings</p>
                          <p className="font-bold text-lg text-primary">₹{(load.price || 0).toLocaleString("en-IN")}</p>
                        </div>
                      </div>

                      {/* Shipper Contact Info */}
                      <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20">
                        <h4 className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Shipper Contact
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <p className="font-medium">{(load as any).shipper_name}</p>
                          {((load as any).contact_phone || (load as any).shipper_phone) && (
                            <a 
                              href={`tel:${(load as any).contact_phone || (load as any).shipper_phone}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              {(load as any).contact_phone || (load as any).shipper_phone}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          load.status === 'assigned' 
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' 
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {load.status === 'assigned' ? '📍 Ready to Start' : '🚛 In Progress'}
                        </div>
                      </div>

                      {/* End Trip Button */}
                      <Button 
                        onClick={() => handleEndTrip(load.id)}
                        disabled={endingTripId === load.id}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        size="lg"
                      >
                        {endingTripId === load.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Completing Trip...
                          </>
                        ) : (
                          <>
                            <Square className="w-5 h-5 mr-2" />
                            End Trip - Mark as Delivered
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
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
