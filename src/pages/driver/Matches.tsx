import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Package, 
  Clock, 
  TrendingDown, 
  Leaf, 
  Star,
  Filter,
  ArrowUpRight
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const mockMatches = [
  {
    id: 1,
    shipper: "ABC Logistics",
    origin: "Pune, Maharashtra",
    destination: "Mumbai, Maharashtra",
    weight: 16,
    vehicleType: "Truck",
    pickupTime: "Tomorrow, 6:00 AM",
    matchScore: 98,
    costSaved: 18500,
    co2Saved: 1.2,
    distance: 150,
    tat: 4.2,
  },
  {
    id: 2,
    shipper: "XYZ Traders",
    origin: "Nagpur, Maharashtra",
    destination: "Hyderabad, Telangana",
    weight: 12,
    vehicleType: "Container",
    pickupTime: "Dec 26, 8:00 AM",
    matchScore: 92,
    costSaved: 24000,
    co2Saved: 2.1,
    distance: 500,
    tat: 8.5,
  },
  {
    id: 3,
    shipper: "Quick Ship",
    origin: "Mumbai, Maharashtra",
    destination: "Surat, Gujarat",
    weight: 8,
    vehicleType: "Mini Truck",
    pickupTime: "Dec 27, 10:00 AM",
    matchScore: 87,
    costSaved: 12800,
    co2Saved: 0.9,
    distance: 280,
    tat: 5.0,
  },
  {
    id: 4,
    shipper: "Farm Fresh",
    origin: "Nashik, Maharashtra",
    destination: "Pune, Maharashtra",
    weight: 20,
    vehicleType: "Refrigerated",
    pickupTime: "Dec 25, 4:00 AM",
    matchScore: 95,
    costSaved: 15200,
    co2Saved: 1.5,
    distance: 210,
    tat: 4.8,
  },
];

const DriverMatches = () => {
  const [matches] = useState(mockMatches);
  const { toast } = useToast();

  const handleAccept = (matchId: number) => {
    toast({
      title: "Match Accepted!",
      description: "The shipper will be notified. Check your dashboard for updates.",
    });
  };

  return (
    <DashboardLayout userRole="driver" userName="Raj Trucking">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Smart Matches</h1>
            <p className="text-muted-foreground">AI-powered load recommendations for your route</p>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Matches Grid */}
        <div className="grid gap-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Route Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-display font-semibold text-lg">{match.shipper}</span>
                          <div className="flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                            <Star className="w-3 h-3" />
                            {match.matchScore}% Match
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-secondary" />
                        <span className="text-sm">{match.origin}</span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-secondary to-primary" />
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm">{match.destination}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {match.weight} tons
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {match.distance} km
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        TAT: {match.tat} hrs
                      </div>
                      <div className="px-2 py-1 bg-muted rounded text-xs">
                        {match.vehicleType}
                      </div>
                    </div>
                  </div>

                  {/* Savings & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-48">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 flex-1">
                      <div className="bg-secondary/10 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-secondary text-xs mb-1">
                          <TrendingDown className="w-3 h-3" />
                          Cost Saved
                        </div>
                        <div className="font-display font-bold text-lg">₹{match.costSaved.toLocaleString()}</div>
                      </div>
                      <div className="bg-secondary/10 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-secondary text-xs mb-1">
                          <Leaf className="w-3 h-3" />
                          CO₂ Saved
                        </div>
                        <div className="font-display font-bold text-lg">{match.co2Saved} tons</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="success" onClick={() => handleAccept(match.id)}>
                        Accept Match
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>

                {/* Pickup Time Banner */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">Pickup:</span>
                  <span className="font-medium">{match.pickupTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverMatches;
