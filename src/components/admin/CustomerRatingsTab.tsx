import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Eye, Trash2, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Rating {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  approved: boolean | null;
  products: {
    name: string;
  };
  profiles: {
    full_name: string | null;
    email: string;
  };
}

const CustomerRatingsTab = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    fetchRatings();
  }, [filter]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("product_ratings")
        .select(`
          *,
          products:product_id (
            name
          ),
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("approved", false);
      } else if (filter === "approved") {
        query = query.eq("approved", true);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRatings(data || []);
    } catch (error: any) {
      toast({ title: "Error fetching ratings", variant: "destructive" });
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ratingId: string) => {
    try {
      const { error } = await supabase
        .from("product_ratings")
        .update({ approved: true })
        .eq("id", ratingId);

      if (error) throw error;

      toast({ title: "Rating approved successfully" });
      fetchRatings();
    } catch (error: any) {
      toast({ title: "Error approving rating", variant: "destructive" });
      console.error("Error approving rating:", error);
    }
  };

  const handleReject = async (ratingId: string) => {
    try {
      const { error } = await supabase
        .from("product_ratings")
        .update({ approved: false })
        .eq("id", ratingId);

      if (error) throw error;

      toast({ title: "Rating rejected" });
      fetchRatings();
    } catch (error: any) {
      toast({ title: "Error rejecting rating", variant: "destructive" });
      console.error("Error rejecting rating:", error);
    }
  };

  const handleDelete = async (ratingId: string) => {
    if (!confirm("Are you sure you want to delete this rating?")) return;

    try {
      const { error } = await supabase
        .from("product_ratings")
        .delete()
        .eq("id", ratingId);

      if (error) throw error;

      toast({ title: "Rating deleted successfully" });
      fetchRatings();
    } catch (error: any) {
      toast({ title: "Error deleting rating", variant: "destructive" });
      console.error("Error deleting rating:", error);
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
    return <div className="text-center py-8">Loading ratings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Ratings</h2>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All ({ratings.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Pending ({ratings.filter(r => !r.approved).length})
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
            size="sm"
          >
            Approved ({ratings.filter(r => r.approved).length})
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {ratings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No ratings found</p>
              </CardContent>
            </Card>
          ) : (
            ratings.map((rating) => (
              <Card key={rating.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rating.products?.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          By: {rating.profiles?.full_name || rating.profiles?.email || "Anonymous"}
                        </span>
                        <Badge variant={rating.approved ? "default" : "secondary"}>
                          {rating.approved ? "Approved" : "Pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(rating.rating)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!rating.approved && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(rating.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(rating.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(rating.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {rating.comment && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground italic">
                      "{rating.comment}"
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CustomerRatingsTab;
