-- Create internal functions that can be called by triggers
-- These use SECURITY INVOKER so they run with the privileges of the trigger (not the user)
CREATE OR REPLACE FUNCTION internal_decrement_product_stock(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION internal_increment_product_stock(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
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
$$;

-- Create trigger function to handle stock decrement when order items are created
CREATE OR REPLACE FUNCTION handle_order_item_stock_decrement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Decrement stock when order item is created
  IF NOT internal_decrement_product_stock(NEW.product_id, NEW.quantity) THEN
    RAISE EXCEPTION 'Insufficient stock for product';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger function to handle stock increment when order is cancelled
CREATE OR REPLACE FUNCTION handle_order_cancellation_stock_increment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  item RECORD;
BEGIN
  -- Only process if order status changed to cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Restore stock for all items in the cancelled order
    FOR item IN 
      SELECT product_id, quantity 
      FROM order_items 
      WHERE order_id = NEW.id
    LOOP
      PERFORM internal_increment_product_stock(item.product_id, item.quantity);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS order_item_stock_decrement ON order_items;
CREATE TRIGGER order_item_stock_decrement
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_item_stock_decrement();

DROP TRIGGER IF EXISTS order_cancellation_stock_increment ON orders;
CREATE TRIGGER order_cancellation_stock_increment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_cancellation_stock_increment();

-- Keep the public RPC functions for admin-only manual adjustments (already have admin checks)
-- These are now only for manual stock adjustments by admins, not for automated order flow