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
  cargo_type?: string | null;
  dimensions?: string | null;
  currency?: string | null;
  required_truck_type?: string | null;
  min_capacity?: number | null;
  is_featured?: boolean | null;
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

      // 85% weight on proximity (closer = higher, +10 to avoid division by zero near 0)
      const distanceScore = (100 / (distanceFromDriver + 10)) * 0.85;

      // 15% weight on price, normalized to max price in list
      const priceScore = (((load.price ?? 0) / maxPrice) * 100) * 0.15;

      let score = distanceScore + priceScore;

      // Distance penalty
      if (distanceFromDriver > 500) {
        score *= 0.5;
      } else if (distanceFromDriver > 200) {
        score *= 0.7;
      }

      return { ...load, score: Math.round(score), distanceFromDriver: Math.round(distanceFromDriver) };
    })
    .sort((a, b) => b.score - a.score);
}
