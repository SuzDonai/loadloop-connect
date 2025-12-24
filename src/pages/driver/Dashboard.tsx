import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Truck, 
  TrendingUp, 
  Leaf, 
  MapPin, 
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  {
    title: "Total Earnings",
    value: "₹45,200",
    change: "+12%",
    icon: TrendingUp,
    color: "primary",
  },
  {
    title: "Trips Completed",
    value: "24",
    change: "+3 this week",
    icon: Truck,
    color: "secondary",
  },
  {
    title: "CO₂ Saved",
    value: "2.4 tons",
    change: "+0.3 tons",
    icon: Leaf,
    color: "secondary",
  },
  {
    title: "Distance Covered",
    value: "1,240 km",
    change: "This month",
    icon: MapPin,
    color: "accent",
  },
];

const recentMatches = [
  {
    id: 1,
    origin: "Pune",
    destination: "Mumbai",
    weight: "16 tons",
    price: "₹18,500",
    status: "pending",
    time: "2 hours ago",
  },
  {
    id: 2,
    origin: "Nagpur",
    destination: "Hyderabad",
    weight: "12 tons",
    price: "₹24,000",
    status: "confirmed",
    time: "Yesterday",
  },
  {
    id: 3,
    origin: "Mumbai",
    destination: "Surat",
    weight: "8 tons",
    price: "₹12,800",
    status: "completed",
    time: "3 days ago",
  },
];

const DriverDashboard = () => {
  return (
    <DashboardLayout userRole="driver" userName="Raj Trucking">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Welcome back, Raj!</h1>
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

        {/* Recent Matches */}
        <div className="bg-card rounded-2xl border border-border shadow-sm">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Recent Matches</h2>
            <Link to="/driver/matches" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentMatches.map((match) => (
              <div key={match.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {match.origin} → {match.destination}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {match.weight} • {match.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{match.price}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {match.status === "pending" && (
                        <>
                          <Clock className="w-3 h-3 text-accent" />
                          <span className="text-accent">Pending</span>
                        </>
                      )}
                      {match.status === "confirmed" && (
                        <>
                          <AlertCircle className="w-3 h-3 text-primary" />
                          <span className="text-primary">Confirmed</span>
                        </>
                      )}
                      {match.status === "completed" && (
                        <>
                          <CheckCircle className="w-3 h-3 text-secondary" />
                          <span className="text-secondary">Completed</span>
                        </>
                      )}
                    </div>
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

export default DriverDashboard;
