-- Create atomic order creation function
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_total_price NUMERIC,
  p_address TEXT,
  p_payment_id TEXT,
  p_items JSONB
)
RETURNS TABLE(order_id UUID, success BOOLEAN, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_current_stock INTEGER;
BEGIN
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
$$;