
-- Add missing columns to loads table
ALTER TABLE public.loads
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS cargo_type TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS required_truck_type TEXT,
ADD COLUMN IF NOT EXISTS min_capacity FLOAT8,
ADD COLUMN IF NOT EXISTS pickup_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivery_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_loads_status ON public.loads(status);
CREATE INDEX IF NOT EXISTS idx_loads_pickup_coords ON public.loads(pickup_lat, pickup_lon);
CREATE INDEX IF NOT EXISTS idx_loads_shipper_id ON public.loads(shipper_id);
CREATE INDEX IF NOT EXISTS idx_loads_assigned_driver_id ON public.loads(assigned_driver_id);
