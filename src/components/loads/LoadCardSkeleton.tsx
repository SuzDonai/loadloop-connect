import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadCardSkeleton() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="w-0.5 h-8" />
            <Skeleton className="w-3 h-3 rounded-full" />
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </CardFooter>
    </Card>
  );
}
