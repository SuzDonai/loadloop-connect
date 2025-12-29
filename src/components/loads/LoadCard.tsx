import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Weight, IndianRupee, Truck, Trash2, Eye } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { formatDistanceToNow } from "date-fns";

type Load = Tables<'loads'>;

interface LoadCardProps {
  load: Load;
  variant: "shipper" | "driver";
  onDelete?: (id: string) => void;
  onViewMatches?: (id: string) => void;
  onAccept?: (id: string) => void;
  isAccepting?: boolean;
}

export function LoadCard({
  load,
  variant,
  onDelete,
  onViewMatches,
  onAccept,
  isAccepting,
}: LoadCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{load.id.slice(0, 8)}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(load.created_at), { addSuffix: true })}</span>
          </div>
          <Badge
            variant={load.status === "open" ? "default" : "secondary"}
            className={
              load.status === "open"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            }
          >
            {load.status === "open" ? "Open" : "Assigned"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-primary/30" />
            <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{load.pickup_city}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{load.drop_city}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">{load.weight}</span> tons
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-semibold">
                {(load.price || 0).toLocaleString("en-IN")}
              </span>
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        {variant === "shipper" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewMatches?.(load.id)}
              disabled={load.status === "assigned"}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Matches
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(load.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            className="w-full"
            size="sm"
            disabled={load.status === "assigned" || isAccepting}
            onClick={() => onAccept?.(load.id)}
          >
            {isAccepting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Accepting...
              </>
            ) : load.status === "assigned" ? (
              "Already Assigned"
            ) : (
              <>
                <Truck className="w-4 h-4 mr-2" />
                Accept Load
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
