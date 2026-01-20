-- Fix profiles table: Add a permissive policy requiring authentication
-- The existing restrictive policy (auth.uid() = id) will further filter to only own profile
CREATE POLICY "Require authentication for profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix loads table: Add a permissive policy requiring authentication  
-- The existing restrictive policies will further filter based on role/ownership
CREATE POLICY "Require authentication for loads"
ON public.loads
FOR SELECT
TO authenticated
USING (true);