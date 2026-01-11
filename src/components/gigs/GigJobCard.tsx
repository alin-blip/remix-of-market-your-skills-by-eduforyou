import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Upload, Globe, MapPin, Building2, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

interface GigJobCardProps {
  id: string;
  type: "gig" | "job";
  title: string;
  description: string;
  skills: string[];
  priceType?: string;
  priceMin?: number;
  priceMax?: number;
  currency?: string;
  locationType?: string;
  isPublished: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
}

export function GigJobCard({
  type,
  title,
  description,
  skills,
  priceType,
  priceMin,
  priceMax,
  currency = "EUR",
  locationType,
  isPublished,
  onEdit,
  onDelete,
  onPublish,
  isPublishing,
}: GigJobCardProps) {
  const { t } = useI18n();

  const formatPrice = () => {
    if (!priceMin && !priceMax) return null;
    
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    });

    if (priceMin && priceMax && priceMin !== priceMax) {
      return `${formatter.format(priceMin)} - ${formatter.format(priceMax)}`;
    }
    return formatter.format(priceMin || priceMax || 0);
  };

  const getPriceTypeLabel = () => {
    switch (priceType) {
      case "fixed": return t.gigs?.priceType?.fixed || "Fixed";
      case "hourly": return t.gigs?.priceType?.hourly || "/hr";
      case "monthly": return t.gigs?.priceType?.monthly || "/mo";
      default: return "";
    }
  };

  const getLocationLabel = () => {
    switch (locationType) {
      case "remote": return t.gigs?.location?.remote || "Remote";
      case "onsite": return t.gigs?.location?.onsite || "On-site";
      case "hybrid": return t.gigs?.location?.hybrid || "Hybrid";
      default: return "";
    }
  };

  const getLocationIcon = () => {
    switch (locationType) {
      case "remote": return <Globe className="h-3.5 w-3.5" />;
      case "onsite": return <Building2 className="h-3.5 w-3.5" />;
      case "hybrid": return <MapPin className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      {/* Status indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isPublished ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} />
      
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={`text-xs font-medium ${type === "gig" ? "border-purple-500/50 text-purple-600 dark:text-purple-400" : "border-blue-500/50 text-blue-600 dark:text-blue-400"}`}
              >
                {type === "gig" ? "Gig" : "Job"}
              </Badge>
              {isPublished ? (
                <Badge className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t.gigs?.published || "Published"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  {t.gigs?.draft || "Draft"}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary" 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-destructive/10 text-destructive hover:text-destructive" 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 3).map((skill, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="text-xs font-normal bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal bg-secondary/50">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Price and Location */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            {formatPrice() && (
              <span className="text-lg font-bold text-primary">
                {formatPrice()}
                {priceType && priceType !== "fixed" && (
                  <span className="text-sm font-normal text-muted-foreground ml-0.5">
                    {getPriceTypeLabel()}
                  </span>
                )}
              </span>
            )}
          </div>
          {locationType && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
              {getLocationIcon()}
              <span>{getLocationLabel()}</span>
            </div>
          )}
        </div>

        {/* Publish Button */}
        {!isPublished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="default"
              size="sm"
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              onClick={(e) => { e.stopPropagation(); onPublish(); }}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {t.gigs?.publish || "Publish to SwipeHire"}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
