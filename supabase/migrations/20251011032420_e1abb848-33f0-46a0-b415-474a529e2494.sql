-- Add RLS policy to allow users to update only their own pending orders
CREATE POLICY "Users can cancel their own pending orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- Add positive stock constraint to products table
ALTER TABLE public.products 
ADD CONSTRAINT positive_stock CHECK (stock >= 0);

-- Update increment_product_stock with quantity validation
CREATE OR REPLACE FUNCTION public.increment_product_stock(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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

-- Update decrement_product_stock with quantity validation
CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_stock INTEGER;
BEGIN
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