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
    name: string | null;
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
          user_id
        `)
        .eq("product_id", productId)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const ratingsWithProfiles = await Promise.all(
        (data || []).map(async (rating) => {
          const { data: profile } = await supabase
            .from("profiles" as any)
            .select("name")
            .eq("id", rating.user_id)
            .single();

          return {
            ...rating,
            profiles: profile ? { name: (profile as any).name } : { name: null }
          };
        })
      );

      setRatings(ratingsWithProfiles);
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
      <h3 className="font-saira font-bold text-xl text-[#5e4338] mb-6">Customer Reviews</h3>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ratings.map((rating) => (
          <Card key={rating.id} className="p-6 bg-[#b5edce]/30 border-2 border-[#3b2a20]/20">
            <div className="space-y-4">
              <div className="flex justify-end">
                {renderStars(rating.rating)}
              </div>

              {rating.comment && (
                <p className="font-saira font-medium text-base text-[#3b2a20] leading-relaxed">
                  "{rating.comment}"
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-[#3b2a20]" />
                  <span className="font-poppins font-bold text-base text-[#3b2a20]">
                    {rating.profiles?.name || "Anonymous"}
                  </span>
                </div>
                <div className="text-sm text-[#3b2a20]/70 font-medium">
                  {new Date(rating.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductRatingsDisplay;
