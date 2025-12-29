import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadCard } from "@/components/loads/LoadCard";
import { LoadCardSkeleton } from "@/components/loads/LoadCardSkeleton";
import { toast } from "sonner";
import { Search, Truck, IndianRupee } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function FindLoads() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropSearch, setDropSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [confirmAcceptId, setConfirmAcceptId] = useState<string | null>(null);

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['open-loads'],
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

  const filteredLoads = useMemo(() => {
    return loads.filter((load) => {
      const matchesPickup = load.pickup_city
        .toLowerCase()
        .includes(pickupSearch.toLowerCase());
      const matchesDrop = load.drop_city
        .toLowerCase()
        .includes(dropSearch.toLowerCase());
      const matchesPrice = minPrice
        ? (load.price || 0) >= parseInt(minPrice)
        : true;

      return matchesPickup && matchesDrop && matchesPrice;
    });
  }, [loads, pickupSearch, dropSearch, minPrice]);

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
      
      queryClient.invalidateQueries({ queryKey: ['open-loads'] });
      toast.success("Load accepted successfully!", {
        description: "You can view this load in your assigned loads.",
      });
    } catch (error) {
      toast.error("Failed to accept load. It may already be assigned.");
    } finally {
      setAcceptingId(null);
    }
  };

  // Calculate potential earnings
  const totalPotentialEarnings = useMemo(() => {
    return filteredLoads.reduce((sum, load) => sum + (load.price || 0), 0);
  }, [filteredLoads]);

  return (
    <DashboardLayout userRole="driver" userName={profile?.name || "Driver"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Available Loads</h1>
            <p className="text-muted-foreground mt-1">
              Find and accept loads for shipping
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Loads</p>
                <p className="text-2xl font-bold">{filteredLoads.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Potential Earnings
                </p>
                <p className="text-2xl font-bold">
                  ₹{totalPotentialEarnings.toLocaleString("en-IN")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Search className="w-4 h-4" />
            Search Loads
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Pickup city..."
              value={pickupSearch}
              onChange={(e) => setPickupSearch(e.target.value)}
              className="bg-background"
            />
            <Input
              placeholder="Drop city..."
              value={dropSearch}
              onChange={(e) => setDropSearch(e.target.value)}
              className="bg-background"
            />
            <Input
              type="number"
              placeholder="Minimum price (₹)..."
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-background"
            />
            <Button
              variant="outline"
              onClick={() => {
                setPickupSearch("");
                setDropSearch("");
                setMinPrice("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <LoadCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredLoads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Truck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No available loads</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              {loads.length === 0
                ? "There are no open loads at the moment. Check back later for new opportunities."
                : "No loads match your current filters. Try adjusting your search criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoads.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                variant="driver"
                onAccept={(id) => setConfirmAcceptId(id)}
                isAccepting={acceptingId === load.id}
              />
            ))}
          </div>
        )}
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
}
