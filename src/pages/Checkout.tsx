import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { sanitizeError } from "@/lib/errorUtils";
import { guestCheckoutSchema } from "@/lib/validation";
import { initiatePhonePePayment, storePaymentDetails } from "@/lib/phonepe";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Checkout = () => {
  const { items, totalPrice, clearCart, discountedTotal, discountAmount, promoCode } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Guest checkout state
  const isGuestCheckout = location.state?.isGuest || false;
  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [guestErrors, setGuestErrors] = useState<any>({});

  useEffect(() => {
    if (!isGuestCheckout) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          navigate("/auth");
          return;
        }
        setUser(session.user);
        fetchProfile(session.user.id);
      });
    }
  }, [isGuestCheckout]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles" as any)
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handlePayment = async () => {
    if (isGuestCheckout) {
      // Validate guest data
      const validationResult = guestCheckoutSchema.safeParse(guestData);
      if (!validationResult.success) {
        const errors: any = {};
        validationResult.error.errors.forEach(err => {
          errors[err.path[0]] = err.message;
        });
        setGuestErrors(errors);
        return;
      }
      setGuestErrors({});
    } else if (!user || !profile) {
      return;
    }

    setProcessing(true);

    // Prepare order items for atomic creation
    const orderItems = items.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    let orderParams: any;

    if (isGuestCheckout) {
      // Create guest order
      orderParams = {
        p_customer_name: guestData.name,
        p_customer_email: guestData.email,
        p_customer_phone: guestData.phone,
        p_total_price: discountedTotal,
        p_address: guestData.address,
        p_payment_id: null, // Will be updated after payment
        p_items: orderItems,
      };
    } else {
      // Create authenticated user order
      orderParams = {
        p_user_id: user.id,
        p_total_price: discountedTotal,
        p_address: profile.address,
        p_payment_id: null, // Will be updated after payment
        p_items: orderItems,
      };
    }

    // Create order and items atomically using database function
    const { data, error } = await (supabase.rpc as any)('create_order_with_items', orderParams);

    if (error || !data || data.length === 0) {
      toast({
        title: "Order creation failed",
        description: sanitizeError(error || new Error("Unknown error")),
        variant: "destructive"
      });
      setProcessing(false);
      return;
    }

    const result = data[0];

    if (!result.success) {
      toast({
        title: "Order failed",
        description: result.error_message?.includes("Insufficient stock")
          ? "Some items in your cart are no longer available. Please update your cart."
          : sanitizeError(new Error(result.error_message || "Order creation failed")),
        variant: "destructive"
      });
      setProcessing(false);
      return;
    }

    const orderId = result.order_id;

    // Track promo code usage if a promo code was applied (only for authenticated users)
    if (promoCode && !isGuestCheckout) {
      try {
        // Get promo code id first
        const { data: promoData } = await supabase
          .from("promo_codes")
          .select("id")
          .eq("code", promoCode.code)
          .single();

        if (promoData) {
          await (supabase
            .from as any)("promo_code_usage")
            .insert({
              promo_code_id: promoData.id,
              order_id: orderId,
              user_id: user.id,
            });
        }
      } catch (error) {
        console.error("Error tracking promo code usage:", error);
        // Don't fail the order for this, just log it
      }
    }

    // Generate unique transaction ID
    const merchantTransactionId = `MT${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Initiate PhonePe payment
    const paymentOptions = {
      amount: Math.round(discountedTotal * 100), // Convert to paisa
      merchantTransactionId,
      merchantUserId: isGuestCheckout ? guestData.email : user.id,
      redirectUrl: `${window.location.origin}/payment/callback?transactionId=${merchantTransactionId}&order=${orderId}`,
      callbackUrl: `${window.location.origin}/api/payment/callback`,
      mobileNumber: isGuestCheckout ? guestData.phone : undefined,
      deviceContext: {
        deviceOS: navigator.platform.includes('Mac') ? 'MAC' : 'WINDOWS'
      }
    };

    const paymentResponse = await initiatePhonePePayment(paymentOptions);

    if (paymentResponse.success && paymentResponse.data?.instrumentResponse?.redirectInfo?.url) {
      // Store payment details
      await storePaymentDetails(orderId, {
        merchantTransactionId,
        amount: paymentOptions.amount,
        status: 'INITIATED'
      });

      // Redirect to PhonePe payment page
      window.location.href = paymentResponse.data.instrumentResponse.redirectInfo.url;
    } else {
      toast({
        title: "Payment initiation failed",
        description: paymentResponse.message || "Unable to initiate payment. Please try again.",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate("/products");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isGuestCheckout ? (
            <Card className="p-6 mb-4">
              <h2 className="text-xl font-bold mb-4">Guest Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="guest-name">Full Name</Label>
                  <Input
                    id="guest-name"
                    value={guestData.name}
                    onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                    className={guestErrors.name ? "border-red-500" : ""}
                  />
                  {guestErrors.name && <p className="text-red-500 text-sm mt-1">{guestErrors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="guest-email">Email</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                    className={guestErrors.email ? "border-red-500" : ""}
                  />
                  {guestErrors.email && <p className="text-red-500 text-sm mt-1">{guestErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="guest-phone">Phone Number</Label>
                  <Input
                    id="guest-phone"
                    value={guestData.phone}
                    onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                    className={guestErrors.phone ? "border-red-500" : ""}
                  />
                  {guestErrors.phone && <p className="text-red-500 text-sm mt-1">{guestErrors.phone}</p>}
                </div>
                <div>
                  <Label htmlFor="guest-address">Delivery Address</Label>
                  <textarea
                    id="guest-address"
                    value={guestData.address}
                    onChange={(e) => setGuestData({ ...guestData, address: e.target.value })}
                    className={`w-full p-2 border rounded-md ${guestErrors.address ? "border-red-500" : "border-gray-300"}`}
                    rows={3}
                  />
                  {guestErrors.address && <p className="text-red-500 text-sm mt-1">{guestErrors.address}</p>}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 mb-4">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <p>{profile?.name}</p>
              <p>{profile?.email}</p>
              <p className="mt-2">{profile?.address}</p>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Payment Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>
              {promoCode && discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({promoCode.discount_percentage}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{discountedTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full font-poppins font-bold"
              onClick={handlePayment}
              disabled={processing}
            >
              {processing ? "Processing..." : "Go to Payment"}
            </Button>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Placed Successfully!</DialogTitle>
          </DialogHeader>
          <p>Your order has been placed and is being processed.</p>
          <Button onClick={() => navigate("/orders")} className="font-poppins font-bold">View Orders</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
