import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Heart, ShoppingCart, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [minOrderQuantity, setMinOrderQuantity] = useState(1);
  const [selectedProtein, setSelectedProtein] = useState("15g");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (name) {
      fetchProduct();
      if (user) checkFavorite();
    }
  }, [name, user]);

  useEffect(() => {
    if (product?.min_order_quantity) {
      setMinOrderQuantity(product.min_order_quantity);
      setSelectedQuantity(product.min_order_quantity);
    }
  }, [product]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("name", decodeURIComponent(name!))
      .single();

    if (!error && data) {
      setProduct(data);
    }
    setLoading(false);
  };

  const checkFavorite = async () => {
    if (!user || !product) return;
    const { data } = await supabase
      .from("profiles")
      .select("favorites")
      .eq("id", user.id)
      .single();

    if (data?.favorites) {
      setIsFavorite(data.favorites.includes(product.id));
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
      ? favorites.filter((fav: string) => fav !== product.id)
      : [...favorites, product.id];

    await supabase
      .from("profiles")
      .update({ favorites: newFavorites })
      .eq("id", user.id);

    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? "Removed from favorites" : "Added to favorites" });
  };

  const handleAddToCart = () => {
    if (product.stock < selectedQuantity) {
      toast({ title: "Insufficient stock", variant: "destructive" });
      return;
    }
    const price = selectedProtein === "15g" ? product.price_15g : product.price_20g;
    addItem({
      id: product.id,
      name: product.name,
      price: price,
      stock: product.stock,
      quantity: selectedQuantity,
      protein: selectedProtein,
      image: product.cart_image || (product.images && product.images.length > 0 ? product.images[0] : null),
    });
    setCartQuantity(prev => prev + selectedQuantity);
    toast({ title: "Added to cart" });
  };

  const increaseQuantity = () => {
    setSelectedQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setSelectedQuantity(prev => prev > minOrderQuantity ? prev - 1 : minOrderQuantity);
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setIsImageModalOpen(true);
  };

  const nextModalImage = () => {
    if (product?.images && product.images.length > 1) {
      setModalImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevModalImage = () => {
    if (product?.images && product.images.length > 1) {
      setModalImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };



  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>;
  }

  return (
    <div className="min-h-screen w-full bg-[#b5edce]/30">
      <div className="container mx-auto px-4 py-8">

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative">
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogTrigger asChild>
              <div className="w-full max-w-lg bg-white rounded-lg mb-2 mx-auto flex items-center justify-center overflow-hidden relative aspect-square cursor-pointer">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      onClick={() => openImageModal(currentImageIndex)}
                    />
                    {product.images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border-0 rounded-full p-2 shadow-md"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border-0 rounded-full p-2 shadow-md"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    No image available
                  </div>
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-4xl h-[80vh] p-0">
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {product.images && product.images.length > 0 && (
                  <>
                    <img
                      src={product.images[modalImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                    {product.images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevModalImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border-0 rounded-full p-3 shadow-md"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextModalImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white border-0 rounded-full p-3 shadow-md"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setModalImageIndex(index)}
                              className={cn(
                                "w-3 h-3 rounded-full transition-all",
                                index === modalImageIndex ? "bg-white" : "bg-white/50"
                              )}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>



          {/* Mobile: Thumbnails below image section */}
          {product.images && product.images.length > 1 && (
            <div className="md:hidden flex gap-3 mt-4 overflow-x-auto pb-2 justify-center">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all",
                    index === currentImageIndex ? "border-[#5e4338] ring-2 ring-[#5e4338]/30" : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-saira font-black uppercase text-[#5e4338] text-5xl mb-6">{product.name}</h1>
          <p className="font-poppins font-black uppercase text-[#3b2a20] text-lg mb-4">PROTEIN BAR</p>
          <div className="flex gap-2 mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedProtein("15g")}
              className={cn(
                "flex-1 px-6 py-3 font-poppins font-bold text-sm uppercase border-0",
                selectedProtein === "15g" ? "bg-[#b5edce] text-black" : "bg-white text-black"
              )}
            >
              15g Protein
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedProtein("20g")}
              className={cn(
                "flex-1 px-6 py-3 font-poppins font-bold text-sm uppercase border-0",
                selectedProtein === "20g" ? "bg-[#b5edce] text-black" : "bg-white text-black"
              )}
            >
              20g Protein
            </Button>
          </div>
          <div className="flex items-center gap-4 mb-8">
          <p className="font-montserrat text-4xl font-black text-black">
            ₹{selectedProtein === "15g" ? product.price_15g * selectedQuantity : product.price_20g * selectedQuantity}
          </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseQuantity}
                className="h-8 w-8 rounded-full p-0 active:scale-105 active:shadow-xl transition-all duration-150"
                disabled={selectedQuantity <= minOrderQuantity}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-poppins font-bold text-lg min-w-[2rem] text-center">{selectedQuantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseQuantity}
                className="h-8 w-8 rounded-full p-0 active:scale-105 active:shadow-xl transition-all duration-150"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {minOrderQuantity > 1 && (
                <span className="text-sm text-muted-foreground ml-2">
                  Min: {minOrderQuantity}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 mb-8">
            <Button
              variant="outline"
              onClick={() => setSelectedQuantity(3)}
              className={cn(
                "rounded-lg bg-white text-black border-0 hover:bg-black hover:text-white px-8 py-3 text-lg flex-1 active:scale-105 active:shadow-xl transition-all duration-150 uppercase",
                selectedQuantity === 3 && "bg-white text-black border-2 border-black"
              )}
            >
              3-PACK
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedQuantity(6)}
              className={cn(
                "rounded-lg bg-white text-black border-0 hover:bg-black hover:text-white px-8 py-3 text-lg flex-1 active:scale-105 active:shadow-xl transition-all duration-150 uppercase",
                selectedQuantity === 6 && "bg-white text-black border-2 border-black"
              )}
            >
              6-PACK
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock < selectedQuantity}
              className="flex-1 font-poppins font-black text-white bg-[#5e4338] hover:bg-white hover:text-[#5e4338] py-4 text-lg uppercase active:scale-105 active:shadow-xl transition-all duration-150"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            {cartQuantity >= minOrderQuantity && (
              <Button
                onClick={() => navigate("/cart")}
                className="px-3 py-4 font-poppins font-black text-white bg-[#5e4338] hover:bg-white hover:text-[#5e4338] active:scale-105 active:shadow-xl transition-all duration-150 relative"
              >
                <ShoppingBag className="h-4 w-4" />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {cartQuantity}
                </div>
              </Button>
            )}
            <Button
              variant={isFavorite ? "default" : "outline"}
              onClick={toggleFavorite}
              className={cn(
                "px-3 py-4 font-poppins font-bold active:scale-105 active:shadow-xl transition-all duration-150",
                isFavorite && "bg-red-500 text-white hover:bg-red-600 border-red-500"
              )}
            >
              <Heart className={isFavorite ? "fill-current text-white" : ""} />
            </Button>
          </div>

          {/* PC: Thumbnails below Add to Cart button */}
          {product.images && product.images.length > 1 && (
            <div className="hidden md:flex gap-3 mt-4 overflow-x-auto pb-2 justify-center">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all",
                    index === currentImageIndex ? "border-[#5e4338] ring-2 ring-[#5e4338]/30" : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}


        </div>
      </div>

      </div>
    </div>
  );
};

export default ProductDetail;
