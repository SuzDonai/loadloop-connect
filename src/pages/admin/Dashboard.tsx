import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Users, 
  Package, 
  Truck, 
  TrendingUp,
  Leaf,
  MapPin,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Active Loads",
    value: "156",
    change: "+8%",
    trend: "up",
    icon: Package,
  },
  {
    title: "Registered Vehicles",
    value: "1,234",
    change: "+5%",
    trend: "up",
    icon: Truck,
  },
  {
    title: "Matches Today",
    value: "89",
    change: "-3%",
    trend: "down",
    icon: MapPin,
  },
  {
    title: "Total Savings",
    value: "₹24.5L",
    change: "+22%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "CO₂ Saved",
    value: "12.4 tons",
    change: "+18%",
    trend: "up",
    icon: Leaf,
  },
];

const recentActivity = [
  { type: "user", action: "New driver registered", name: "Raj Transport", time: "2 min ago" },
  { type: "load", action: "Load posted", name: "ABC Logistics", time: "5 min ago" },
  { type: "match", action: "Match confirmed", route: "Pune → Mumbai", time: "12 min ago" },
  { type: "user", action: "New shipper registered", name: "XYZ Traders", time: "25 min ago" },
  { type: "completed", action: "Trip completed", route: "Delhi → Jaipur", time: "1 hour ago" },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform performance and manage operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-secondary" : "text-destructive"}`}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="font-display font-semibold text-lg">Recent Activity</h2>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === "user" ? "bg-primary" :
                    activity.type === "load" ? "bg-accent" :
                    activity.type === "match" ? "bg-secondary" :
                    "bg-muted-foreground"
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.name || activity.route}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Chart Placeholder */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="font-display font-semibold text-lg mb-6">Platform Growth</h2>
            <div className="h-64 flex items-center justify-center bg-muted/50 rounded-xl">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Analytics charts will appear here</p>
                <p className="text-xs">Connect backend for live data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
