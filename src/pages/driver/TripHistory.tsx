import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Package, IndianRupee, Route } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TripHistory = () => {
  const { user, profile } = useAuth();

  const { data: acceptedLoads, isLoading } = useQuery({
    queryKey: ['driver-trip-history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('assigned_driver_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Simple distance estimation based on city names (mock calculation)
  const estimateDistance = (pickup: string, drop: string) => {
    // This is a simplified mock - in production, use a real mapping API
    const baseDistance = Math.abs(pickup.length - drop.length) * 50 + 100;
    return Math.min(baseDistance + Math.random() * 200, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in_transit':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'delivered':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout userRole="driver" userName={profile?.name || "Driver"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Trip History</h1>
          <p className="text-muted-foreground">View all your accepted and completed trips</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : acceptedLoads && acceptedLoads.length > 0 ? (
          <div className="grid gap-4">
            {acceptedLoads.map((load) => {
              const distance = estimateDistance(load.pickup_city, load.drop_city);
              return (
                <Card key={load.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        Load #{load.id.slice(0, 8)}
                      </CardTitle>
                      <Badge className={getStatusColor(load.status)}>
                        {load.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Pickup</p>
                            <p className="font-medium text-foreground">{load.pickup_city}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Drop</p>
                            <p className="font-medium text-foreground">{load.drop_city}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Route className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Distance:</span>
                          <span className="font-medium text-foreground">{distance.toFixed(0)} km</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-foreground">{load.pickup_date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium text-foreground">{load.pickup_time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Weight: {load.weight} kg</span>
                        <span>•</span>
                        <span>Vehicle: {load.vehicle_type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-bold text-primary">
                        <IndianRupee className="h-5 w-5" />
                        {(load.price || 0).toLocaleString()}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Accepted {formatDistanceToNow(new Date(load.updated_at), { addSuffix: true })}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No trips yet</h3>
              <p className="text-muted-foreground">
                Accept loads from the Find Matches page to start building your trip history.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TripHistory;
