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
import ProductRatingsDisplay from "@/components/ProductRatingsDisplay";
import RatingComponent from "@/components/RatingComponent";
import ProductRatingSummary from "@/components/ProductRatingSummary";

import image2 from "@/assets/2.png";
import image4 from "@/assets/4.png";
import image8 from "@/assets/8.png";
import image10 from "@/assets/10.png";

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
            <DialogContent className="w-[90vw] max-w-4xl h-[80vh] p-0 md:max-w-[18rem] md:h-[20vh]">
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

          {/* Mobile: Thumbnails below image */}
          {product.images && product.images.length > 1 && (
            <div className="flex md:hidden gap-3 mt-4 overflow-x-auto pb-2 justify-start">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all",
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

      {/* New section for protein bars */}
      {product.category === 'protein_bars' && (
        <div className="bg-[#5e4338] py-4 w-full">
          <div className="w-full">
            <div className="px-4 mb-12 pt-8 ">
              <h2 className="font-saira font-black text-2xl text-left text-[#b5edce] uppercase">Product description:</h2>
              <p className="font-saira font-semibold text-xl text-white mt-4">
                Each Choconut Bar packs 20g of protein in just 228 calories, made with a blend of whey and pea protein.<br />
                No refined sugar. No preservatives. No chalky chew.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 max-w-none px-4">
              <div className="bg-[#5e4338] border-4 border-white p-8 rounded-lg">
                <h3 className="font-saira font-black text-2xl text-white uppercase mb-4">Inside The Bar</h3>
                <hr className="border-white mb-4" />
                <ul className="text-white font-tomorrow list-disc list-inside space-y-1 md:text-lg">
                  <li>whey protein powder</li>
                  <li>pea protein isolate</li>
                  <li>date syrup</li>
                  <li>peanut butter</li>
                  <li>phool makhana</li>
                  <li>water</li>
                  <li>cocoa butter</li>
                  <li>cocoa powder</li>
                  <li>gum arabic</li>
                </ul>
              </div>
              <div className="bg-[#5e4338] border-4 border-white p-8 rounded-lg">
                <h3 className="font-saira font-black text-2xl text-white uppercase mb-4">Nutrition Info</h3>
                <hr className="border-white mb-4" />
                <table className="w-full text-white font-tomorrow">
                  <thead>
                    <tr className="border-b border-white">
                      <th className="text-left py-2"></th>
                      <th className="text-center py-2">per (60 g)</th>
                      <th className="text-center py-2">(100 g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/30">
                      <td className="py-2">energy (kcal)</td>
                      <td className="text-center py-2">228</td>
                      <td className="text-center py-2">360</td>
                    </tr>
                    <tr className="border-b border-white/30">
                      <td className="py-2">protein (g)</td>
                      <td className="text-center py-2">20</td>
                      <td className="text-center py-2">33.5</td>
                    </tr>
                    <tr className="border-b border-white/30">
                      <td className="py-2">carbohydrates (g)</td>
                      <td className="text-center py-2">25.2</td>
                      <td className="text-center py-2">42.13</td>
                    </tr>
                    <tr className="border-b border-white/30">
                      <td className="py-2 pl-4">total sugars (g)</td>
                      <td className="text-center py-2">6.8</td>
                      <td className="text-center py-2">11.46</td>
                    </tr>
                    <tr className="border-b border-white/30">
                      <td className="py-2 pl-8">added sugars (g)</td>
                      <td className="text-center py-2">0</td>
                      <td className="text-center py-2">0</td>
                    </tr>
                    <tr className="border-b border-white/30">
                      <td className="py-2">fat (g)</td>
                      <td className="text-center py-2">4.1</td>
                      <td className="text-center py-2">6.86</td>
                    </tr>
                    <tr className="border-b border-white/30">
                      <td className="py-2 pl-4">saturated fat (g)</td>
                      <td className="text-center py-2">1.9</td>
                      <td className="text-center py-2">3.33</td>
                    </tr>
                    <tr className="border-b border-white/30">
                      <td className="py-2 pl-4">trans fat (g)</td>
                      <td className="text-center py-2">0</td>
                      <td className="text-center py-2">0</td>
                    </tr>
                    <tr className="border-b border-white/30">
                      <td className="py-2">sodium (mg)</td>
                      <td className="text-center py-2">41.4</td>
                      <td className="text-center py-2">69</td>
                    </tr>
                    <tr>
                      <td className="py-2">cholesterol (mg)</td>
                      <td className="text-center py-2">27.3</td>
                      <td className="text-center py-2">45.5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New section for protein bars benefits */}
      {product.category === 'protein_bars' && (
        <div className="bg-white py-10 w-full mt">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-saira font-black text-3xl md:text-5xl text-[#5e4338] uppercase mb-4">
                Not Just a Regular Real-Ingredient Bar, but a Bar Built Better.
              </h2>
              <p className="font-saira font-semibold text-xl md:text-3xl text-[#b5edce] mb-8">
                Real ingredients. Balanced calories. More protein.
              </p>
            </div>

            <div className="bg-white h-48 md:h-48 w-full flex items-center justify-center gap-8 mb-8">
              <div className="grid grid-cols-2 md:flex md:flex-row gap-8">
                <img src={image2} alt="Image 2" className="h-28 md:h-40 w-auto" />
                <img src={image4} alt="Image 4" className="h-28 md:h-40 w-auto" />
                <img src={image8} alt="Image 8" className="h-28 md:h-40 w-auto" />
                <img src={image10} alt="Image 10" className="h-28 md:h-40 w-auto" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-saira font-black text-xl md:text-3xl text-black uppercase">
                Everything in balance, the way food should be.
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Rating Section */}
      <div className="bg-[#b5edce] w-full py-12 mb-0">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center mb-6 w-full">
              <ProductRatingSummary productId={product.id} />
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#5e4338] hover:bg-[#4a3528] text-white font-saira font-black uppercase px-6 py-3 mt-4">
                    Rate This Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <RatingComponent productId={product.id} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white w-full py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ProductRatingsDisplay productId={product.id} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;
