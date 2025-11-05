import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = products;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.nutrition.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryClick = (category: string) => {
    setCategoryFilter(category);
    // Auto-scroll logic for mobile
    if (categoriesRef.current) {
      const container = categoriesRef.current;
      const buttons = container.querySelectorAll('button');
      const clickedButton = Array.from(buttons).find(btn => btn.textContent?.toLowerCase().replace(' ', '_') === category || (category === 'all' && btn.textContent === 'All Categories'));
      if (clickedButton) {
        const buttonRect = clickedButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const buttonLeft = buttonRect.left - containerRect.left;
        const buttonRight = buttonLeft + buttonRect.width;
        const containerWidth = containerRect.width;

        // If button is near left or right edge, scroll to center it
        if (buttonLeft < 50 || buttonRight > containerWidth - 50) {
          const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonRect.width / 2);
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#b5edce]/50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-6">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-96"
        />

        <div
          ref={categoriesRef}
          className="flex gap-2 overflow-x-auto pb-2 md:justify-start md:overflow-x-visible"
        >
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            onClick={() => handleCategoryClick("all")}
            className={`whitespace-nowrap rounded-lg font-poppins font-bold bg-white text-[#3b2a20] border-white hover:bg-[#5e4338] hover:text-white ${categoryFilter === "all" ? "bg-[#5e4338] text-white" : ""}`}
          >
            All Categories
          </Button>
          <Button
            variant={categoryFilter === "protein_bars" ? "default" : "outline"}
            onClick={() => handleCategoryClick("protein_bars")}
            className={`whitespace-nowrap rounded-lg font-poppins font-bold bg-white text-[#3b2a20] border-white hover:bg-[#5e4338] hover:text-white ${categoryFilter === "protein_bars" ? "bg-[#5e4338] text-white" : ""}`}
          >
            Protein Bars
          </Button>

        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="font-saira font-black text-6xl text-[#3b2a20]/30">NO PRODUCTS HERE YET!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/product/${encodeURIComponent(product.name)}`)}
            >
              <div className="w-48 h-48 bg-muted rounded-lg mb-4 overflow-hidden mx-auto">
                {product.products_page_image ? (
                  <img
                    src={product.products_page_image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="font-saira font-black text-lg mb-2 text-[#3b2a20] uppercase">{product.name}</h3>
              <p className="font-montserrat text-xl font-bold text-primary">
                {product.price ? `₹${product.price}` : `₹${product.price_15g} - ₹${product.price_20g}`}
              </p>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default Products;
