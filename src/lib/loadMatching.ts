export interface Load {
  id: string;
  pickup_lat: number | null;
  pickup_lon: number | null;
  delivery_lat?: number | null;
  delivery_lon?: number | null;
  price: number | null;
  weight: number;
  status: string;
  pickup_city: string;
  drop_city: string;
  distance_km?: number | null;
  vehicle_type: string;
  pickup_date: string;
  pickup_time: string;
  description?: string | null;
  created_at: string;
}

export interface ScoredLoad extends Load {
  score: number;
  distanceFromDriver: number;
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function rankLoads(
  loads: Load[],
  driverLat: number,
  driverLon: number
): ScoredLoad[] {
  const maxPrice = Math.max(...loads.map(l => l.price ?? 0), 1);

  return loads
    .map((load) => {
      const pickupLat = load.pickup_lat ?? 0;
      const pickupLon = load.pickup_lon ?? 0;

      const distanceFromDriver =
        pickupLat && pickupLon
          ? haversineDistance(driverLat, driverLon, pickupLat, pickupLon)
          : 9999;

      // Distance score: closer = higher (max 40 points)
      const distScore = Math.max(0, 40 - distanceFromDriver * 0.4);

      // Price score: higher price = better (max 30 points)
      const priceScore = ((load.price ?? 0) / maxPrice) * 30;

      // Recency score: newer = better (max 15 points)
      const ageHours = (Date.now() - new Date(load.created_at).getTime()) / 3600000;
      const recencyScore = Math.max(0, 15 - ageHours * 0.5);

      // Route efficiency: if distance_km exists, prefer shorter pickups relative to route (max 15 points)
      let efficiencyScore = 7.5;
      if (load.distance_km && load.distance_km > 0) {
        const ratio = distanceFromDriver / load.distance_km;
        efficiencyScore = Math.max(0, 15 - ratio * 15);
      }

      const score = Math.round(distScore + priceScore + recencyScore + efficiencyScore);

      return { ...load, score, distanceFromDriver: Math.round(distanceFromDriver) };
    })
    .sort((a, b) => b.score - a.score);
}
