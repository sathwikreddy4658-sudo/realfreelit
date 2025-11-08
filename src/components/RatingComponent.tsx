import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface RatingComponentProps {
  productId: string;
}

const RatingComponent = ({ productId }: RatingComponentProps) => {
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingRating, setExistingRating] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && productId) {
      fetchExistingRating();
    }
  }, [user, productId]);

  const fetchExistingRating = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("product_ratings")
      .select("*")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setExistingRating(data);
      setRating(data.rating);
      setComment(data.comment || "");
    }
  };

  const handleSubmitRating = async () => {
    if (!user) {
      toast({ title: "Please sign in to rate this product", variant: "destructive" });
      return;
    }

    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const ratingData = {
        product_id: productId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
        approved: false, // New ratings need admin approval
      };

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from("product_ratings")
          .update(ratingData)
          .eq("id", existingRating.id);

        if (error) throw error;

        toast({ title: "Rating updated successfully!" });
      } else {
        // Insert new rating
        const { error } = await supabase
          .from("product_ratings")
          .insert([ratingData]);

        if (error) throw error;

        toast({ title: "Rating submitted successfully!" });
      }

      // Refresh existing rating data
      await fetchExistingRating();
    } catch (error: any) {
      toast({ title: "Error submitting rating", variant: "destructive" });
      console.error("Rating submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 bg-white border-2 border-[#5e4338]/20">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-[#5e4338] mb-4" />
          <Button
            onClick={() => {
              const currentUrl = window.location.href;
              window.location.href = `/auth?redirectTo=${encodeURIComponent(currentUrl)}`;
            }}
            className="bg-[#5e4338] hover:bg-[#4a3428] text-white mb-2"
          >
            Sign In To Write A Review
          </Button>
          <p className="text-muted-foreground text-sm">Please sign in to leave a rating and comment.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-2 border-[#5e4338]/20">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-saira font-bold text-xl text-[#5e4338] mb-2">
            {existingRating ? "Update Your Rating" : "Rate This Product"}
          </h3>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoverRating || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <div>
          <Textarea
            placeholder="Share your thoughts about this product (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="text-right text-sm text-muted-foreground mt-1">
            {comment.length}/500
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmitRating}
            disabled={loading || rating === 0}
            className="bg-[#5e4338] hover:bg-[#4a3428] text-white px-8 py-2"
          >
            {loading ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
          </Button>
        </div>

        {existingRating && (
          <div className="text-center text-sm text-muted-foreground">
            Status: {existingRating.approved ? "Approved" : "Pending Approval"}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RatingComponent;
