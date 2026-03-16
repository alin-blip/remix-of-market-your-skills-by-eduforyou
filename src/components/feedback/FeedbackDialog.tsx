import { useState, useRef, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement, reload?: boolean) => void;
    };
  }
}

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepKey: string;
  trustpilotDomain?: string;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  stepKey,
}: FeedbackDialogProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trustpilotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted && rating >= 4 && trustpilotRef.current) {
      window.Trustpilot?.loadFromElement(trustpilotRef.current, true);
    }
  }, [submitted, rating]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setIsSubmitting(true);

    try {
      await supabase.from('step_feedback' as any).upsert(
        {
          user_id: user.id,
          step_key: stepKey,
          rating,
          comment: comment.trim() || null,
        },
        { onConflict: 'user_id,step_key' }
      );
      setSubmitted(true);
    } catch (error) {
      console.error('Feedback save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setRating(0);
      setHoveredStar(0);
      setComment('');
      setSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {submitted ? t.feedback.thankYouTitle : t.feedback.title}
          </DialogTitle>
          <DialogDescription>
            {submitted
              ? rating >= 4
                ? t.feedback.positiveThankYou
                : t.feedback.thankYouDescription
              : t.feedback.subtitle}
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-5 py-2">
            {/* Star Rating */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">{t.feedback.rateExperience}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 transition-colors"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredStar || rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted stroke-muted-foreground/30'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-foreground"
                >
                  {rating <= 2
                    ? t.feedback.ratingLabels.low
                    : rating === 3
                      ? t.feedback.ratingLabels.medium
                      : rating === 4
                        ? t.feedback.ratingLabels.good
                        : t.feedback.ratingLabels.excellent}
                </motion.p>
              )}
            </div>

            {/* Comment */}
            <Textarea
              placeholder={t.feedback.commentPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={handleClose}>
                {t.feedback.skip}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                {t.feedback.submit}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto"
            >
              <Star className="h-8 w-8 text-primary fill-primary" />
            </motion.div>

            {rating >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground">
                  {t.feedback.trustpilotCta}
                </p>
                <div
                  ref={trustpilotRef}
                  className="trustpilot-widget"
                  data-locale="en-US"
                  data-template-id="56278e9abfbbba0bdcd568bc"
                  data-businessunit-id="699bfe8fbda6d8a0b0a5321b"
                  data-token="83ff2916-ac91-476e-96bb-a00662874438"
                  data-style-height="52px"
                  data-style-width="100%"
                >
                  <a href="https://www.trustpilot.com/review/skillmarket.ro" target="_blank" rel="noopener noreferrer">
                    Trustpilot
                  </a>
                </div>
              </motion.div>
            )}

            <Button variant="ghost" onClick={handleClose} className="mt-2">
              {t.feedback.close}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
