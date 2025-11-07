import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 20; // 20 attempts per minute for shipping checks
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  record.count++;
  return true;
}

interface ShippingRequest {
  pincode: string;
  weight: number; // in grams
  orderValue: number; // in INR
}

interface ShipneerResponse {
  success: boolean;
  delivery_available: boolean;
  cod_available: boolean;
  shipping_cost?: number;
  estimated_delivery?: string;
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the user from the auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const requestData: ShippingRequest = await req.json();
    const { pincode, weight, orderValue } = requestData;

    // Validate input
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid pincode. Must be 6 digits.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof weight !== 'number' || weight <= 0 || weight > 50000) { // Max 50kg
      return new Response(
        JSON.stringify({ error: 'Invalid weight. Must be between 1g and 50kg.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof orderValue !== 'number' || orderValue < 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid order value.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Shipneer API
    const shipneerApiKey = Deno.env.get('SHIPNEER_API_KEY');
    if (!shipneerApiKey) {
      console.error('Shipneer API key not configured');
      return new Response(
        JSON.stringify({ error: 'Shipping service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shipneerPayload = {
      pincode: pincode,
      weight_grams: weight,
      order_value: orderValue,
      // Add any other required fields for Shipneer API
    };

    const shipneerResponse = await fetch('https://api.shipneer.com/v1/check-delivery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${shipneerApiKey}`,
      },
      body: JSON.stringify(shipneerPayload),
    });

    if (!shipneerResponse.ok) {
      console.error(`Shipneer API error: ${shipneerResponse.status} ${shipneerResponse.statusText}`);
      return new Response(
        JSON.stringify({ error: 'Shipping service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const shipneerData: ShipneerResponse = await shipneerResponse.json();

    // Apply business rules
    let shippingCost = shipneerData.shipping_cost || 0;
    let codAvailable = shipneerData.cod_available;

    // Business rule: No shipping cost if order value >= 800 INR
    if (orderValue >= 800) {
      shippingCost = 0;
    }

    // Business rule: COD not available if order value > 1300 INR or API says false
    if (orderValue > 1300 || !codAvailable) {
      codAvailable = false;
    }

    const response = {
      success: true,
      delivery_available: shipneerData.delivery_available,
      cod_available: codAvailable,
      shipping_cost: shippingCost,
      estimated_delivery: shipneerData.estimated_delivery,
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Shipping check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
