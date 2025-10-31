-- Add authorization checks to stock management functions
CREATE OR REPLACE FUNCTION public.increment_product_stock(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Require admin role for stock manipulation
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required for stock management';
  END IF;

  -- Validate quantity bounds
  IF quantity <= 0 OR quantity > 10000 THEN
    RAISE EXCEPTION 'Invalid quantity: must be between 1 and 10000';
  END IF;
  
  -- Atomically increment stock
  UPDATE products
  SET stock = stock + quantity
  WHERE id = product_id;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Require admin role for stock manipulation
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required for stock management';
  END IF;

  -- Validate quantity bounds
  IF quantity <= 0 OR quantity > 10000 THEN
    RAISE EXCEPTION 'Invalid quantity: must be between 1 and 10000';
  END IF;
  
  -- Lock the product row and get current stock
  SELECT stock INTO current_stock
  FROM products
  WHERE id = product_id
  FOR UPDATE;
  
  -- Check if sufficient stock is available
  IF current_stock >= quantity THEN
    -- Decrement stock
    UPDATE products
    SET stock = stock - quantity
    WHERE id = product_id;
    RETURN TRUE;
  ELSE
    -- Insufficient stock
    RETURN FALSE;
  END IF;
END;
$function$;

-- Add database constraints for product validation (only if they don't exist)
DO $$ 
BEGIN
  -- Add price constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'price_positive'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT price_positive CHECK (price > 0);
  END IF;

  -- Add stock constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stock_reasonable'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT stock_reasonable CHECK (stock >= 0 AND stock <= 1000000);
  END IF;

  -- Add name length constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'name_length'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT name_length CHECK (char_length(name) > 0 AND char_length(name) <= 200);
  END IF;

  -- Add description length constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'description_length'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT description_length CHECK (description IS NULL OR char_length(description) <= 2000);
  END IF;
END $$;