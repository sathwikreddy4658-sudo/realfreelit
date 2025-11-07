import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
  };
}

interface ProductRatingsDisplayProps {
  productId: string;
}

const ProductRatingsDisplay = ({ productId }: ProductRatingsDisplayProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedRatings();
  }, [productId]);

  const fetchApprovedRatings = async () => {
    try {
      const { data, error } = await supabase
        .from("product_ratings")
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles:user_id (
            full_name
          )
        `)
        .eq("product_id", productId)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRatings(data || []);
    } catch (error: any) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading ratings...</div>;
  }

  if (ratings.length === 0) {
    return null; // Don't show anything if no approved ratings
  }

  return (
    <div className="mt-8">
      <h3 className="font-saira font-bold text-xl text-[#5e4338] mb-4">Customer Reviews</h3>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {ratings.map((rating) => (
            <Card key={rating.id} className="flex-shrink-0 w-80 p-4 bg-white border-2 border-[#5e4338]/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-[#5e4338]" />
                    <span className="font-medium text-sm text-[#5e4338]">
                      {rating.profiles?.full_name || "Anonymous"}
                    </span>
                  </div>
                  {renderStars(rating.rating)}
                </div>

                {rating.comment && (
                  <p className="text-sm text-gray-700 italic">
                    "{rating.comment}"
                  </p>
                )}

                <div className="text-xs text-muted-foreground">
                  {new Date(rating.created_at).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductRatingsDisplay;
