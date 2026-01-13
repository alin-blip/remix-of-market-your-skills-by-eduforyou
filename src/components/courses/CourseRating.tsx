import { useState } from "react";
import { Star, Send, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CourseRatingProps {
  courseId: string;
  hasAccess: boolean;
}

interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

const StarRating = ({
  rating,
  onRate,
  interactive = false,
  size = "md",
}: {
  rating: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={cn(
            "transition-colors",
            interactive && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
};

export const CourseRating = ({ courseId, hasAccess }: CourseRatingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Fetch reviews for this course
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["course-reviews", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Review[];
    },
  });

  // Check if user already has a review
  const userReview = reviews.find((r) => r.user_id === user?.id);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      if (!user) throw new Error("Not authenticated");

      if (editingReviewId) {
        const { error } = await supabase
          .from("course_reviews")
          .update({ rating, comment: comment || null })
          .eq("id", editingReviewId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("course_reviews")
          .insert({
            course_id: courseId,
            user_id: user.id,
            rating,
            comment: comment || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-reviews", courseId] });
      toast({
        title: editingReviewId ? "Review actualizat" : "Review adăugat",
        description: "Mulțumim pentru feedback!",
      });
      setNewRating(0);
      setNewComment("");
      setIsEditing(false);
      setEditingReviewId(null);
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu am putut salva review-ul",
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("course_reviews")
        .delete()
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-reviews", courseId] });
      toast({
        title: "Review șters",
        description: "Review-ul a fost eliminat",
      });
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu am putut șterge review-ul",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (newRating === 0) {
      toast({
        title: "Selectează un rating",
        description: "Te rugăm să selectezi numărul de stele",
        variant: "destructive",
      });
      return;
    }
    submitReview.mutate({ rating: newRating, comment: newComment });
  };

  const handleEdit = (review: Review) => {
    setNewRating(review.rating);
    setNewComment(review.comment || "");
    setEditingReviewId(review.id);
    setIsEditing(true);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recenzii & Rating</span>
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(averageRating)} size="sm" />
            <span className="text-lg font-bold">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({reviews.length} recenzii)
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Review Form */}
        {hasAccess && user && (!userReview || isEditing) && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium">
              {isEditing ? "Editează recenzia" : "Lasă o recenzie"}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rating:</span>
              <StarRating
                rating={newRating}
                onRate={setNewRating}
                interactive
                size="lg"
              />
            </div>
            <Textarea
              placeholder="Scrie un comentariu (opțional)..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitReview.isPending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {submitReview.isPending ? "Se salvează..." : "Trimite"}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingReviewId(null);
                    setNewRating(0);
                    setNewComment("");
                  }}
                >
                  Anulează
                </Button>
              )}
            </div>
          </div>
        )}

        {/* User's existing review prompt */}
        {hasAccess && user && userReview && !isEditing && (
          <div className="p-3 bg-primary/5 rounded-lg text-sm text-muted-foreground">
            Ai lăsat deja o recenzie pentru acest curs. O poți edita sau șterge din lista de mai jos.
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Se încarcă recenziile...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nu există recenzii încă. Fii primul care lasă o recenzie!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={cn(
                  "flex gap-4 p-4 rounded-lg border",
                  review.user_id === user?.id && "bg-primary/5 border-primary/20"
                )}
              >
                <Avatar>
                  <AvatarFallback>
                    {getInitials(
                      review.profiles?.full_name || null,
                      review.profiles?.email || null
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {review.profiles?.full_name || "Anonim"}
                      </span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "d MMM yyyy", {
                          locale: ro,
                        })}
                      </span>
                      {review.user_id === user?.id && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(review)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteReview.mutate(review.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseRating;
