-- Add length constraints to product text fields to prevent data overflow attacks
-- These constraints protect against excessive data insertion that could cause performance issues

-- Add length constraints for nutrition-related fields (reasonable limits for product data)
ALTER TABLE public.products 
  ADD CONSTRAINT nutrition_length CHECK (char_length(nutrition) <= 500);

ALTER TABLE public.products 
  ADD CONSTRAINT protein_length CHECK (char_length(protein) <= 100);

ALTER TABLE public.products 
  ADD CONSTRAINT sugar_length CHECK (char_length(sugar) <= 100);

ALTER TABLE public.products 
  ADD CONSTRAINT calories_length CHECK (char_length(calories) <= 100);

ALTER TABLE public.products 
  ADD CONSTRAINT weight_length CHECK (char_length(weight) <= 100);

ALTER TABLE public.products 
  ADD CONSTRAINT shelf_life_length CHECK (char_length(shelf_life) <= 200);

ALTER TABLE public.products 
  ADD CONSTRAINT allergens_length CHECK (char_length(allergens) <= 500);

-- Add constraint to prevent zero prices
ALTER TABLE public.products 
  DROP CONSTRAINT IF EXISTS price_positive;
  
ALTER TABLE public.products 
  ADD CONSTRAINT price_positive CHECK (price > 0);

-- Add validation for image array to prevent excessive number of images
ALTER TABLE public.products 
  ADD CONSTRAINT images_array_length CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 10);