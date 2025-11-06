import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string;
  protein: string;
}

interface PromoCode {
  code: string;
  discount_percentage: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string, protein: string) => void;
  updateQuantity: (id: string, protein: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  promoCode: PromoCode | null;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  discountAmount: number;
  discountedTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [promoCode, setPromoCode] = useState<PromoCode | null>(() => {
    const saved = localStorage.getItem("promoCode");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("promoCode", JSON.stringify(promoCode));
  }, [promoCode]);

  const addItem = (item: Omit<CartItem, "quantity" | "protein"> & { quantity?: number; protein?: string }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.protein === (item.protein || "15g"));
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.protein === (item.protein || "15g")
            ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), item.stock) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1, protein: item.protein || "15g" }];
    });
  };

  const removeItem = (id: string, protein: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.protein === protein)));
  };

  const updateQuantity = (id: string, protein: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id && i.protein === protein ? { ...i, quantity: Math.min(Math.max(1, quantity), i.stock) } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode(null);
  };

  const applyPromoCode = async (code: string): Promise<boolean> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const userId = user?.id;

      // For authenticated users, check usage limits
      if (userId) {
        const { data: canUse, error: checkError } = await supabase.rpc('can_use_promo_code', {
          promo_code_text: code.toUpperCase(),
          user_id: userId
        });

        if (checkError || !canUse) {
          toast.error("Invalid promo code or usage limit exceeded");
          return false;
        }
      }

      // Get the promo code details (for both authenticated and guest users)
      const { data, error } = await supabase
        .from("promo_codes")
        .select("code, discount_percentage")
        .eq("code", code.toUpperCase())
        .eq("active", true)
        .single();

      if (error || !data) {
        toast.error("Invalid promo code");
        return false;
      }

      setPromoCode(data);
      toast.success(`Promo code ${data.code} applied! ${data.discount_percentage}% discount`);
      return true;
    } catch (error) {
      console.error("Error applying promo code:", error);
      toast.error("Failed to apply promo code");
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode(null);
    toast.success("Promo code removed");
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = promoCode ? (totalPrice * promoCode.discount_percentage) / 100 : 0;
  const discountedTotal = totalPrice - discountAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        promoCode,
        applyPromoCode,
        removePromoCode,
        discountAmount,
        discountedTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
