import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, Tag, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    promoCode,
    applyPromoCode,
    removePromoCode,
    discountAmount,
    discountedTotal
  } = useCart();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    const success = await applyPromoCode(promoInput.trim());
    if (success) {
      setPromoInput("");
    }
    setApplyingPromo(false);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="font-saira font-black text-6xl text-[#3b2a20] mb-4 uppercase">YOUR CART</h1>
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Button onClick={() => navigate("/products")} className="bg-[b5edce] bg-[#b5edce]/55 font-poppins font-bold">
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-saira font-black text-6xl text-[#3b2a20] mb-8 uppercase">YOUR CART</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Link key={`${item.id}-${item.protein}`} to={`/product/${encodeURIComponent(item.name)}`} className="block">
              <Card className="p-4 bg-white hover:bg-[#3b2a20]/30 transition-colors cursor-pointer">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-saira font-black text-lg mb-2 text-[#3b2a20] uppercase">{item.name}</h3>
                    <p className="text-sm font-poppins font-black mb-1 text-black uppercase">Protein: {item.protein}</p>
                    <p className="font-montserrat text-lg font-bold text-primary">₹{item.price}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(item.id, item.protein); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(item.id, item.protein, item.quantity - 1); }}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(item.id, item.protein, item.quantity + 1); }}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div>
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Promo Code Section */}
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="promo-code" className="text-sm font-medium mb-2 block">
                <Tag className="inline mr-2 h-4 w-4" />
                Have a promo code?
              </Label>
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="font-mono font-bold text-green-700">{promoCode.code}</span>
                    <span className="text-sm text-green-600">({promoCode.discount_percentage}% off)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removePromoCode}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="promo-code"
                    placeholder="Enter promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={applyingPromo || !promoInput.trim()}
                    variant="outline"
                    className="font-poppins font-bold"
                  >
                    {applyingPromo ? "Applying..." : "Apply"}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              {promoCode && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoCode.discount_percentage}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{discountedTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
              {!promoCode && (
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {user ? (
                <Button className="w-full font-poppins font-bold" onClick={() => navigate("/checkout")}>
                  Order Now
                </Button>
              ) : (
                <>
                  <Button
                    className="w-full font-poppins font-bold"
                    onClick={() => navigate("/checkout", { state: { isGuest: true } })}
                  >
                    Order Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full font-poppins font-bold"
                    onClick={() => window.location.href = `/auth?returnTo=${encodeURIComponent(window.location.pathname)}`}
                  >
                    Sign In & Order
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
