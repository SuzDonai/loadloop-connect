import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useDriverLocation } from "@/hooks/useDriverLocation";
import { rankLoads, type ScoredLoad } from "@/lib/loadMatching";
import {
  MapPin, Truck, Package, Star, RefreshCw,
  ArrowUpRight, Clock, CheckCircle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const DriverDashboard = () => {
  const { user, profile } = useAuth();
  const { location, status: locStatus, error: locError, refresh: refreshLocation } = useDriverLocation();

  const { data: loads = [], isLoading, refetch } = useQuery({
    queryKey: ["driver-available-loads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loads")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: assignedLoads = [] } = useQuery({
    queryKey: ["driver-assigned-loads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loads")
        .select("*")
        .eq("assigned_driver_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const completedTrips = assignedLoads.filter((l) => l.status === "completed").length;
  const activeTrips = assignedLoads.filter((l) => l.status === "assigned").length;

  // Score and rank loads based on driver location
  const scoredLoads: ScoredLoad[] =
    location && loads.length > 0
      ? rankLoads(loads as any, location.lat, location.lon)
      : (loads as any[]).map((l) => ({ ...l, score: 0, distanceFromDriver: 0 }));

  const featuredLoad = scoredLoads[0] ?? null;
  const otherLoads = scoredLoads.slice(1, 6);

  const stats = [
    { title: "Available Loads", value: loads.length.toString(), sub: "Open for pickup", icon: Package, color: "primary" as const },
    { title: "Active Trips", value: activeTrips.toString(), sub: "In progress", icon: Truck, color: "secondary" as const },
    { title: "Completed", value: completedTrips.toString(), sub: "All time", icon: CheckCircle, color: "secondary" as const },
    { title: "GPS Status", value: locStatus === "success" ? "Live" : locStatus === "loading" ? "..." : "Off", sub: locError ?? "Tracking", icon: MapPin, color: "accent" as const },
  ];

  const userName = profile?.name || "Driver";

  return (
    <DashboardLayout userRole="driver" userName={userName}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground">Smart load matching based on your location</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refreshLocation(); refetch(); }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="success" asChild>
              <Link to="/driver/matches">
                Find Loads
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Location Banner */}
        {locStatus === "success" && location && (
          <div className="flex items-center gap-2 rounded-xl bg-secondary/10 border border-secondary/20 px-4 py-3 text-sm">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="text-secondary font-medium">GPS Active</span>
            <span className="text-muted-foreground">
              — {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </span>
          </div>
        )}
        {locStatus === "error" && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-destructive font-medium">Location unavailable</span>
            <span className="text-muted-foreground">— {locError}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === "primary" ? "bg-primary/10 text-primary"
                      : stat.color === "secondary" ? "bg-secondary/10 text-secondary"
                      : "bg-accent/10 text-accent"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.title}</span>
                  <span className="text-xs text-secondary">{stat.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Load */}
        {featuredLoad && featuredLoad.score > 0 && (
          <div className="relative bg-card rounded-2xl border-2 border-primary/30 shadow-lg overflow-hidden">
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              <Star className="w-3 h-3" /> Best Match
            </div>
            <div className="p-6">
              <h2 className="font-display font-semibold text-lg mb-4">⭐ Featured Load</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {featuredLoad.pickup_city} → {featuredLoad.drop_city}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {featuredLoad.weight} kg • {featuredLoad.distanceFromDriver} km away • Score: {featuredLoad.score}/100
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">₹{featuredLoad.price?.toLocaleString() ?? "N/A"}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(featuredLoad.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Loads */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">
              {location ? "Nearby Loads" : "Available Loads"}
            </h2>
            <Link to="/driver/matches" className="text-sm text-primary hover:underline">View all</Link>
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
            ) : otherLoads.length === 0 && !featuredLoad ? (
              <div className="p-6 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No available loads at the moment</p>
              </div>
            ) : (
              otherLoads.map((load) => (
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
                        {load.weight} kg
                        {load.distanceFromDriver > 0 && ` • ${load.distanceFromDriver} km away`}
                        {load.score > 0 && ` • Score: ${load.score}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">₹{load.price?.toLocaleString() ?? "N/A"}</div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-accent" />
                        <span className="text-accent capitalize">{load.status}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/driver/matches"><ArrowUpRight className="w-4 h-4" /></Link>
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
