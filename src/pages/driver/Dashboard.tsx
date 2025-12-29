import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Truck, 
  TrendingUp, 
  Leaf, 
  MapPin, 
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const DriverDashboard = () => {
  const { user, profile } = useAuth();

  // Fetch open loads from database
  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['driver-available-loads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch assigned loads for stats
  const { data: assignedLoads = [] } = useQuery({
    queryKey: ['driver-assigned-loads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('assigned_driver_id', user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const completedTrips = assignedLoads.filter(l => l.status === 'completed').length;
  const activeTrips = assignedLoads.filter(l => l.status === 'assigned').length;

  const stats = [
    {
      title: "Available Loads",
      value: loads.length.toString(),
      change: "Open for pickup",
      icon: Package,
      color: "primary",
    },
    {
      title: "Active Trips",
      value: activeTrips.toString(),
      change: "In progress",
      icon: Truck,
      color: "secondary",
    },
    {
      title: "Completed Trips",
      value: completedTrips.toString(),
      change: "All time",
      icon: CheckCircle,
      color: "secondary",
    },
    {
      title: "Profile Status",
      value: "Active",
      change: "Verified",
      icon: MapPin,
      color: "accent",
    },
  ];

  const userName = profile?.name || 'Driver';

  return (
    <DashboardLayout userRole="driver" userName={userName}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your trips</p>
          </div>
          <Button variant="success" asChild>
            <Link to="/driver/matches">
              Find New Loads
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary/10 text-primary"
                        : stat.color === "secondary"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.title}</span>
                  <span className="text-xs text-secondary">{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Available Loads */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Available Loads</h2>
            <Link to="/driver/matches" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))
            ) : loads.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No available loads at the moment</p>
              </div>
            ) : (
              loads.map((load) => (
                <div key={load.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {load.pickup_city} → {load.drop_city}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {load.weight} kg • {formatDistanceToNow(new Date(load.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">₹{load.price?.toLocaleString() || 'N/A'}</div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-accent" />
                        <span className="text-accent capitalize">{load.status}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/driver/matches">
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
