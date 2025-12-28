-- Create loads table for storing cargo posts
CREATE TABLE public.loads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shipper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_city TEXT NOT NULL,
  drop_city TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  volume NUMERIC,
  vehicle_type TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed')),
  assigned_driver_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;

-- Shippers can view their own loads
CREATE POLICY "Shippers can view their own loads"
ON public.loads
FOR SELECT
USING (auth.uid() = shipper_id);

-- Shippers can create loads
CREATE POLICY "Shippers can create loads"
ON public.loads
FOR INSERT
WITH CHECK (auth.uid() = shipper_id);

-- Shippers can update their own loads
CREATE POLICY "Shippers can update their own loads"
ON public.loads
FOR UPDATE
USING (auth.uid() = shipper_id);

-- Shippers can delete their own loads
CREATE POLICY "Shippers can delete their own loads"
ON public.loads
FOR DELETE
USING (auth.uid() = shipper_id);

-- Drivers can view open loads
CREATE POLICY "Drivers can view open loads"
ON public.loads
FOR SELECT
USING (status = 'open');

-- Drivers can view loads assigned to them
CREATE POLICY "Drivers can view assigned loads"
ON public.loads
FOR SELECT
USING (auth.uid() = assigned_driver_id);

-- Drivers can update loads to accept them (assign themselves)
CREATE POLICY "Drivers can accept open loads"
ON public.loads
FOR UPDATE
USING (status = 'open' OR auth.uid() = assigned_driver_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_loads_updated_at
BEFORE UPDATE ON public.loads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();