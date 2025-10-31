-- Fix 1: Secure the product-images storage bucket
-- Make bucket private and add RLS policies
UPDATE storage.buckets
SET public = false
WHERE name = 'product-images';

-- Allow anyone to read product images (for product display)
CREATE POLICY "public_read_product_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only admins can upload
CREATE POLICY "admin_upload_product_images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can update
CREATE POLICY "admin_update_product_images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Only admins can delete
CREATE POLICY "admin_delete_product_images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: Deny anonymous access to profiles table
CREATE POLICY "deny_anonymous_profiles_access" 
ON profiles 
FOR SELECT 
TO anon 
USING (false);

-- Fix 3: Deny manual profile creation (only trigger should create)
CREATE POLICY "deny_manual_profile_creation"
ON profiles FOR INSERT
WITH CHECK (false);

-- Fix 4: Deny anonymous access to user_roles table
CREATE POLICY "deny_anonymous_user_roles_access"
ON user_roles FOR SELECT
TO anon
USING (false);

-- Fix 5: Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix 6: Add non-negative stock constraint
ALTER TABLE products
ADD CONSTRAINT stock_non_negative
CHECK (stock >= 0);

-- Add price positive constraint
ALTER TABLE products
ADD CONSTRAINT price_positive
CHECK (price > 0);