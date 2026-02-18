
-- Add missing columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS truck_type TEXT,
ADD COLUMN IF NOT EXISTS truck_capacity FLOAT8;

-- Add lat/lon and address columns to loads
ALTER TABLE loads
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS pickup_lat FLOAT8,
ADD COLUMN IF NOT EXISTS pickup_lon FLOAT8,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT,
ADD COLUMN IF NOT EXISTS delivery_lat FLOAT8,
ADD COLUMN IF NOT EXISTS delivery_lon FLOAT8,
ADD COLUMN IF NOT EXISTS distance_km FLOAT8;
