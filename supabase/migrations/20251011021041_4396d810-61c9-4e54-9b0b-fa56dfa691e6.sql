-- Create atomic stock decrement function to prevent race conditions
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
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
$$;