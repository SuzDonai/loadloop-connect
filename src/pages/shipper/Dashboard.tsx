import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Package, 
  TrendingDown, 
  Leaf, 
  Truck,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Load {
  id: string;
  pickup_city: string;
  drop_city: string;
  weight: number;
  status: string;
  created_at: string;
}

const ShipperDashboard = () => {
  const { profile, user } = useAuth();
  const [recentLoads, setRecentLoads] = useState<Load[]>([]);
  const [stats, setStats] = useState({
    activeLoads: 0,
    completedLoads: 0,
  });

  useEffect(() => {
    if (user) {
      fetchLoads();
    }
  }, [user]);

  const fetchLoads = async () => {
    const { data, error } = await supabase
      .from("loads")
      .select("*")
      .eq("shipper_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentLoads(data);
      const active = data.filter((l) => l.status === "open" || l.status === "assigned").length;
      const completed = data.filter((l) => l.status === "completed").length;
      setStats({ activeLoads: active, completedLoads: completed });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const dashboardStats = [
    {
      title: "Total Savings",
      value: "₹1,24,500",
      change: "+18%",
      icon: TrendingDown,
      color: "primary",
    },
    {
      title: "Active Loads",
      value: stats.activeLoads.toString(),
      change: "Current",
      icon: Package,
      color: "primary",
    },
    {
      title: "CO₂ Reduced",
      value: "4.8 tons",
      change: "+0.6 tons",
      icon: Leaf,
      color: "secondary",
    },
    {
      title: "Completed Shipments",
      value: stats.completedLoads.toString(),
      change: "This month",
      icon: Truck,
      color: "secondary",
    },
  ];

  return (
    <DashboardLayout userRole="shipper" userName={profile?.name || "Shipper"}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, {profile?.name || "Shipper"}!</h1>
            <p className="text-muted-foreground">Manage your shipments and track savings</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/shipper/post-cargo">
              Post New Cargo
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => {
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
                        : "bg-secondary/10 text-secondary"
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

        {/* Recent Loads */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Recent Loads</h2>
            <Link to="/shipper/my-loads" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentLoads.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No loads posted yet. <Link to="/shipper/post-cargo" className="text-primary hover:underline">Post your first cargo</Link>
              </div>
            ) : (
              recentLoads.map((load) => (
                <div key={load.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {load.pickup_city} → {load.drop_city}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {load.weight} tons • {getTimeAgo(load.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      {load.status === "open" && (
                        <>
                          <Clock className="w-3 h-3 text-accent" />
                          <span className="text-accent">Finding Match</span>
                        </>
                      )}
                      {load.status === "assigned" && (
                        <>
                          <AlertCircle className="w-3 h-3 text-primary" />
                          <span className="text-primary">Assigned</span>
                        </>
                      )}
                      {load.status === "completed" && (
                        <>
                          <CheckCircle className="w-3 h-3 text-secondary" />
                          <span className="text-secondary">Completed</span>
                        </>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/shipper/my-loads">
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

export default ShipperDashboard;
