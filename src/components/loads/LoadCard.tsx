import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Weight, IndianRupee, Truck, Trash2, Eye, Route, Navigation } from "lucide-react";
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
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center pt-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-0.5 flex-1 min-h-[2rem] bg-gradient-to-b from-primary to-primary/30" />
            <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
          </div>
          <div className="flex-1 space-y-3">
            <button
              type="button"
              onClick={() => {
                const q =
                  load.pickup_lat && load.pickup_lon
                    ? `${load.pickup_lat},${load.pickup_lon}`
                    : encodeURIComponent(load.pickup_address || load.pickup_city);
                window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
              }}
              className="w-full text-left group/loc"
              title="Open pickup in Google Maps"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium group-hover/loc:text-primary transition-colors">
                  {load.pickup_city}
                </span>
              </div>
              {load.pickup_address && (
                <p className="text-xs text-muted-foreground ml-6 mt-0.5 line-clamp-2">
                  {load.pickup_address}
                </p>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const q =
                  load.delivery_lat && load.delivery_lon
                    ? `${load.delivery_lat},${load.delivery_lon}`
                    : encodeURIComponent(load.delivery_address || load.drop_city);
                window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
              }}
              className="w-full text-left group/loc"
              title="Open drop in Google Maps"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium group-hover/loc:text-primary transition-colors">
                  {load.drop_city}
                </span>
              </div>
              {load.delivery_address && (
                <p className="text-xs text-muted-foreground ml-6 mt-0.5 line-clamp-2">
                  {load.delivery_address}
                </p>
              )}
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
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
          {load.distance_km && (
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold">{load.distance_km}</span> km
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0 flex-wrap">
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
          <>
            <Button
              className="flex-1"
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const origin =
                  load.pickup_lat && load.pickup_lon
                    ? `${load.pickup_lat},${load.pickup_lon}`
                    : encodeURIComponent(load.pickup_address || load.pickup_city);
                const destination =
                  load.delivery_lat && load.delivery_lon
                    ? `${load.delivery_lat},${load.delivery_lon}`
                    : encodeURIComponent(load.delivery_address || load.drop_city);
                window.open(
                  `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
                  "_blank"
                );
              }}
              title="Open directions in Google Maps"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Directions
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
