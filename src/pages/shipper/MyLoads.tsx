import { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadCard } from "@/components/loads/LoadCard";
import { LoadCardSkeleton } from "@/components/loads/LoadCardSkeleton";
import { MatchingRidesModal } from "@/components/loads/MatchingRidesModal";
import { toast } from "sonner";
import { Search, Package, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";

type Load = Tables<'loads'>;

export default function MyLoads() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropSearch, setDropSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "assigned">(
    "all"
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [matchingLoadId, setMatchingLoadId] = useState<string | null>(null);

  const { data: loads = [], isLoading } = useQuery({
    queryKey: ['shipper-loads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('shipper_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const filteredLoads = useMemo(() => {
    return loads.filter((load) => {
      const matchesPickup = load.pickup_city
        .toLowerCase()
        .includes(pickupSearch.toLowerCase());
      const matchesDrop = load.drop_city
        .toLowerCase()
        .includes(dropSearch.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || load.status === statusFilter;

      return matchesPickup && matchesDrop && matchesStatus;
    });
  }, [loads, pickupSearch, dropSearch, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['shipper-loads', user?.id] });
      toast.success("Load deleted successfully");
    } catch (error) {
      toast.error("Failed to delete load");
    } finally {
      setDeleteId(null);
    }
  };

  const handleViewMatches = (id: string) => {
    setMatchingLoadId(id);
  };

  const handleDriverAssigned = (loadId: string, driverId: string) => {
    queryClient.invalidateQueries({ queryKey: ['shipper-loads', user?.id] });
  };

  const selectedLoad = matchingLoadId
    ? loads.find((l) => l.id === matchingLoadId) || null
    : null;

  return (
    <DashboardLayout userRole="shipper" userName={profile?.name || "Shipper"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Posted Loads</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your posted loads
            </p>
          </div>
          <Button onClick={() => navigate("/shipper/post-cargo")}>
            <Plus className="w-4 h-4 mr-2" />
            Post New Load
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Search className="w-4 h-4" />
            Search & Filter
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
            <Select
              value={statusFilter}
              onValueChange={(value: "all" | "open" | "assigned") =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setPickupSearch("");
                setDropSearch("");
                setStatusFilter("all");
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
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No loads found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              {loads.length === 0
                ? "You haven't posted any loads yet. Click the button above to post your first load."
                : "No loads match your current filters. Try adjusting your search criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLoads.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                variant="shipper"
                onDelete={(id) => setDeleteId(id)}
                onViewMatches={handleViewMatches}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {!isLoading && loads.length > 0 && (
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4 border-t">
            <span>
              Total: <strong className="text-foreground">{loads.length}</strong>{" "}
              loads
            </span>
            <span>
              Open:{" "}
              <strong className="text-emerald-600">
                {loads.filter((l) => l.status === "open").length}
              </strong>
            </span>
            <span>
              Assigned:{" "}
              <strong className="text-amber-600">
                {loads.filter((l) => l.status === "assigned").length}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Load?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              load and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Matching Rides Modal */}
      <MatchingRidesModal
        open={!!matchingLoadId}
        onOpenChange={(open) => !open && setMatchingLoadId(null)}
        load={selectedLoad}
        onAssign={handleDriverAssigned}
      />
    </DashboardLayout>
  );
}
