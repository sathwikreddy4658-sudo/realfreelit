import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { sanitizeError } from "@/lib/errorUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Checkout = () => {
  const { items, totalPrice, clearCart, discountedTotal, discountAmount, promoCode } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const handlePayment = async () => {
    if (!user || !profile) return;

    setProcessing(true);

    // Dummy Razorpay integration
    const paymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare order items for atomic creation
    const orderItems = items.map(item => ({
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    // Create order and items atomically using database function
    const { data, error } = await supabase.rpc('create_order_with_items', {
      p_user_id: user.id,
      p_total_price: discountedTotal,
      p_address: profile.address,
      p_payment_id: paymentId,
      p_items: orderItems,
    });

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

    // Track promo code usage if a promo code was applied
    if (promoCode) {
      try {
        // Get promo code id first
        const { data: promoData } = await supabase
          .from("promo_codes")
          .select("id")
          .eq("code", promoCode.code)
          .single();

        if (promoData) {
          await supabase
            .from("promo_code_usage")
            .insert({
              promo_code_id: promoData.id,
              order_id: result.order_id,
              user_id: user.id,
            });
        }
      } catch (error) {
        console.error("Error tracking promo code usage:", error);
        // Don't fail the order for this, just log it
      }
    }

    setProcessing(false);
    clearCart();
    setShowSuccess(true);
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
          <Card className="p-6 mb-4">
            <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
            <p>{profile?.name}</p>
            <p>{profile?.email}</p>
            <p className="mt-2">{profile?.address}</p>
          </Card>

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
              {processing ? "Processing..." : "Pay with Razorpay"}
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
