import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (id) {
      fetchProduct();
      if (user) checkFavorite();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setProduct(data);
    }
    setLoading(false);
  };

  const checkFavorite = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("favorites")
      .eq("id", user.id)
      .single();

    if (data?.favorites) {
      setIsFavorite(data.favorites.includes(id));
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({ title: "Please sign in to add favorites" });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("favorites")
      .eq("id", user.id)
      .single();

    const favorites = profile?.favorites || [];

    // Check favorites limit before adding
    if (!isFavorite && favorites.length >= 100) {
      toast({
        title: "Maximum 100 favorites allowed",
        variant: "destructive"
      });
      return;
    }

    const newFavorites = isFavorite
      ? favorites.filter((fav: string) => fav !== id)
      : [...favorites, id];

    await supabase
      .from("profiles")
      .update({ favorites: newFavorites })
      .eq("id", user.id);

    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? "Removed from favorites" : "Added to favorites" });
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
    toast({ title: "Added to cart" });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate("/products")} className="mb-4 font-poppins font-bold">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-muted rounded-lg mb-4" />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-bold text-primary mb-4">₹{product.price}</p>

          <Card className="p-4 mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Stock: {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
            </p>
            <p className="mb-4">{product.description}</p>

            <div className="space-y-2 text-sm">
              <p><strong>Nutrition:</strong> {product.nutrition}</p>
              {product.protein && <p><strong>Protein:</strong> {product.protein}</p>}
              {product.sugar && <p><strong>Sugar:</strong> {product.sugar}</p>}
              {product.calories && <p><strong>Calories:</strong> {product.calories}</p>}
              {product.weight && <p><strong>Weight:</strong> {product.weight}</p>}
              {product.shelf_life && <p><strong>Shelf Life:</strong> {product.shelf_life}</p>}
              {product.allergens && <p><strong>Allergens:</strong> {product.allergens}</p>}
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 font-poppins font-bold"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button
              variant={isFavorite ? "default" : "outline"}
              onClick={toggleFavorite}
              className="font-poppins font-bold"
            >
              <Heart className={isFavorite ? "fill-current" : ""} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
