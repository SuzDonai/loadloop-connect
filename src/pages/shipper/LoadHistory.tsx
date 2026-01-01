import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { 
  MapPin, 
  Package, 
  Calendar, 
  Weight, 
  IndianRupee,
  CheckCircle2,
  Truck,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Load = Tables<'loads'>;

// Maharashtra cities with approximate distances (mock data)
const cityDistances: Record<string, Record<string, number>> = {
  "Mumbai": { "Pune": 150, "Nagpur": 840, "Nashik": 170, "Aurangabad": 340, "Solapur": 400 },
  "Pune": { "Mumbai": 150, "Nagpur": 720, "Nashik": 210, "Aurangabad": 240, "Solapur": 250 },
  "Nagpur": { "Mumbai": 840, "Pune": 720, "Nashik": 650, "Aurangabad": 480, "Solapur": 550 },
  "Nashik": { "Mumbai": 170, "Pune": 210, "Nagpur": 650, "Aurangabad": 180, "Solapur": 420 },
  "Aurangabad": { "Mumbai": 340, "Pune": 240, "Nagpur": 480, "Nashik": 180, "Solapur": 240 },
  "Solapur": { "Mumbai": 400, "Pune": 250, "Nagpur": 550, "Nashik": 420, "Aurangabad": 240 },
};

const getEstimatedDistance = (pickup: string, drop: string): number => {
  const pickupCity = Object.keys(cityDistances).find(city => 
    pickup.toLowerCase().includes(city.toLowerCase())
  );
  const dropCity = Object.keys(cityDistances).find(city => 
    drop.toLowerCase().includes(city.toLowerCase())
  );
  
  if (pickupCity && dropCity && cityDistances[pickupCity]?.[dropCity]) {
    return cityDistances[pickupCity][dropCity];
  }
  
  // Default estimate based on random distance
  return Math.floor(Math.random() * 500) + 100;
};

const LoadHistoryCard = ({ load }: { load: Load }) => {
  const distance = getEstimatedDistance(load.pickup_city, load.drop_city);
  
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4 hover:shadow-md transition-shadow">
      {/* Header with Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{load.vehicle_type}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(load.created_at).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
        <Badge 
          variant={load.status === 'completed' ? 'default' : load.status === 'assigned' ? 'secondary' : 'outline'}
          className={load.status === 'completed' ? 'bg-emerald-500' : ''}
        >
          {load.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
          {load.status === 'assigned' && <Truck className="w-3 h-3 mr-1" />}
          {load.status === 'open' && <Clock className="w-3 h-3 mr-1" />}
          {load.status}
        </Badge>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <div className="w-0.5 h-8 bg-border" />
          <div className="w-3 h-3 rounded-full bg-rose-500" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Pickup</p>
            <p className="font-medium text-sm">{load.pickup_city}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Drop</p>
            <p className="font-medium text-sm">{load.drop_city}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="font-bold text-primary">{distance} km</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Weight className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Weight</p>
            <p className="text-sm font-medium">{load.weight} tons</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Pickup Date</p>
            <p className="text-sm font-medium">
              {new Date(load.pickup_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-sm font-medium">₹{load.price?.toLocaleString() || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadHistorySkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="grid grid-cols-3 gap-3 pt-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

export default function LoadHistory() {
  const { user, profile } = useAuth();

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['shipper-load-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('shipper_id', user.id)
        .in('status', ['completed', 'assigned'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const stats = useMemo(() => {
    const completed = loads.filter(l => l.status === 'completed').length;
    const assigned = loads.filter(l => l.status === 'assigned').length;
    const totalDistance = loads.reduce((acc, load) => {
      return acc + getEstimatedDistance(load.pickup_city, load.drop_city);
    }, 0);
    const totalSpent = loads.reduce((acc, load) => acc + (load.price || 0), 0);
    
    return { completed, assigned, totalDistance, totalSpent };
  }, [loads]);

  return (
    <DashboardLayout userRole="shipper" userName={profile?.name || "Shipper"}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Load History</h1>
          <p className="text-muted-foreground mt-1">
            View all your completed and assigned shipments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs">Completed</span>
            </div>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Truck className="w-4 h-4" />
              <span className="text-xs">In Transit</span>
            </div>
            <p className="text-2xl font-bold">{stats.assigned}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Total Distance</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalDistance.toLocaleString()} km</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <IndianRupee className="w-4 h-4" />
              <span className="text-xs">Total Spent</span>
            </div>
            <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Load List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <LoadHistorySkeleton key={i} />
            ))}
          </div>
        ) : loads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No load history</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Your completed and assigned shipments will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loads.map((load) => (
              <LoadHistoryCard key={load.id} load={load} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
