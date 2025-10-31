-- Drop and recreate create_order_with_items function with comprehensive input validation
DROP FUNCTION IF EXISTS public.create_order_with_items(uuid, numeric, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_user_id uuid, 
  p_total_price numeric, 
  p_address text, 
  p_payment_id text, 
  p_items jsonb
)
RETURNS TABLE(order_id uuid, success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_current_stock INTEGER;
  v_calculated_total NUMERIC := 0;
  v_item_quantity INTEGER;
  v_item_price NUMERIC;
BEGIN
  -- Validate total price range (positive and reasonable)
  IF p_total_price <= 0 OR p_total_price > 10000000 THEN
    RAISE EXCEPTION 'Invalid total price: must be between 0.01 and 10,000,000';
  END IF;
  
  -- Validate address length
  IF LENGTH(TRIM(p_address)) < 10 OR LENGTH(p_address) > 500 THEN
    RAISE EXCEPTION 'Invalid address: must be between 10 and 500 characters';
  END IF;
  
  -- Validate payment_id length if provided
  IF p_payment_id IS NOT NULL AND (LENGTH(p_payment_id) < 5 OR LENGTH(p_payment_id) > 100) THEN
    RAISE EXCEPTION 'Invalid payment ID format';
  END IF;
  
  -- Validate items array is not empty
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item';
  END IF;
  
  -- Validate items array is not too large
  IF jsonb_array_length(p_items) > 100 THEN
    RAISE EXCEPTION 'Order cannot contain more than 100 items';
  END IF;
  
  -- Validate each item and calculate total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Extract and validate quantity
    v_item_quantity := (v_item->>'quantity')::INTEGER;
    IF v_item_quantity <= 0 OR v_item_quantity > 1000 THEN
      RAISE EXCEPTION 'Invalid quantity for %: must be between 1 and 1000', v_item->>'product_name';
    END IF;
    
    -- Extract and validate product price
    v_item_price := (v_item->>'product_price')::NUMERIC;
    IF v_item_price <= 0 OR v_item_price > 1000000 THEN
      RAISE EXCEPTION 'Invalid price for %: must be between 0.01 and 1,000,000', v_item->>'product_name';
    END IF;
    
    -- Validate product_name is not empty
    IF LENGTH(TRIM(v_item->>'product_name')) = 0 OR LENGTH(v_item->>'product_name') > 200 THEN
      RAISE EXCEPTION 'Invalid product name: must be between 1 and 200 characters';
    END IF;
    
    -- Validate product_id is a valid UUID
    IF (v_item->>'product_id') IS NULL OR (v_item->>'product_id')::UUID IS NULL THEN
      RAISE EXCEPTION 'Invalid product ID for %', v_item->>'product_name';
    END IF;
    
    -- Add to calculated total
    v_calculated_total := v_calculated_total + (v_item_price * v_item_quantity);
  END LOOP;
  
  -- Verify submitted total matches calculated total (allow 0.01 variance for rounding)
  IF ABS(p_total_price - v_calculated_total) > 0.01 THEN
    RAISE EXCEPTION 'Total price mismatch: expected %, got %', v_calculated_total, p_total_price;
  END IF;
  
  -- Start transaction (implicit in function)
  
  -- Create the order
  INSERT INTO orders (user_id, total_price, address, payment_id, status)
  VALUES (p_user_id, p_total_price, p_address, p_payment_id, 'pending')
  RETURNING id INTO v_order_id;
  
  -- Create order items and validate stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Check current stock
    SELECT stock INTO v_current_stock
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE; -- Lock the row
    
    -- Validate sufficient stock
    IF v_current_stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'product_name';
    END IF;
    
    -- Insert order item
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      product_price,
      quantity
    )
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      (v_item->>'product_price')::NUMERIC,
      (v_item->>'quantity')::INTEGER
    );
    
    -- Decrement stock
    UPDATE products
    SET stock = stock - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;
  
  -- Return success
  RETURN QUERY SELECT v_order_id, TRUE, NULL::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically
    RETURN QUERY SELECT NULL::UUID, FALSE, SQLERRM;
END;
$function$;