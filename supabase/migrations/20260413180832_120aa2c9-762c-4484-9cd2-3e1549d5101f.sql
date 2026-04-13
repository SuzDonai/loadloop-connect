
-- Block direct role insertion (roles only created via handle_new_user trigger)
CREATE POLICY "Block direct role insertion"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (false);

-- Block role updates
CREATE POLICY "Block role updates"
ON public.user_roles FOR UPDATE
TO authenticated
USING (false);

-- Block role deletion
CREATE POLICY "Block role deletion"
ON public.user_roles FOR DELETE
TO authenticated
USING (false);
