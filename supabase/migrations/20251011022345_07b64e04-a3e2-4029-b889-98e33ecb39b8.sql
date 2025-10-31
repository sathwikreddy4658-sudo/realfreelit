-- Create atomic stock increment function to prevent race conditions during order cancellation
CREATE OR REPLACE FUNCTION public.increment_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atomically increment stock
  UPDATE products
  SET stock = stock + quantity
  WHERE id = product_id;
  RETURN TRUE;
END;
$$;