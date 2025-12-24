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

const stats = [
  {
    title: "Total Savings",
    value: "₹1,24,500",
    change: "+18%",
    icon: TrendingDown,
    color: "primary",
  },
  {
    title: "Active Loads",
    value: "8",
    change: "3 matched",
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
    value: "42",
    change: "This month",
    icon: Truck,
    color: "secondary",
  },
];

const recentLoads = [
  {
    id: 1,
    origin: "Delhi",
    destination: "Jaipur",
    weight: "20 tons",
    status: "matched",
    carrier: "Swift Transport",
    time: "1 hour ago",
  },
  {
    id: 2,
    origin: "Chennai",
    destination: "Bangalore",
    weight: "15 tons",
    status: "available",
    carrier: null,
    time: "3 hours ago",
  },
  {
    id: 3,
    origin: "Kolkata",
    destination: "Patna",
    weight: "10 tons",
    status: "completed",
    carrier: "Express Cargo",
    time: "Yesterday",
  },
];

const ShipperDashboard = () => {
  return (
    <DashboardLayout userRole="shipper" userName="ABC Logistics">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, ABC Logistics!</h1>
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
            <Link to="/shipper/loads" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentLoads.map((load) => (
              <div key={load.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {load.origin} → {load.destination}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {load.weight} • {load.carrier || "Finding carrier..."} • {load.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    {load.status === "available" && (
                      <>
                        <Clock className="w-3 h-3 text-accent" />
                        <span className="text-accent">Finding Match</span>
                      </>
                    )}
                    {load.status === "matched" && (
                      <>
                        <AlertCircle className="w-3 h-3 text-primary" />
                        <span className="text-primary">Matched</span>
                      </>
                    )}
                    {load.status === "completed" && (
                      <>
                        <CheckCircle className="w-3 h-3 text-secondary" />
                        <span className="text-secondary">Completed</span>
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipperDashboard;
