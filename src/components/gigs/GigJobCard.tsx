import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Upload, Globe, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
      case "hourly": return t.gigs?.priceType?.hourly || "Hourly";
      case "monthly": return t.gigs?.priceType?.monthly || "Monthly";
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
      case "remote": return <Globe className="h-3 w-3" />;
      case "onsite":
      case "hybrid": return <MapPin className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {type === "gig" ? "Gig" : "Job"}
              </Badge>
              {isPublished ? (
                <Badge variant="default" className="text-xs bg-green-600">
                  {t.gigs?.published || "Published"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {t.gigs?.draft || "Draft"}
                </Badge>
              )}
            </div>
            <CardTitle className="text-base truncate">{title}</CardTitle>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 4).map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {formatPrice() && (
              <span className="font-medium">
                {formatPrice()}
                {priceType && <span className="text-muted-foreground ml-1">({getPriceTypeLabel()})</span>}
              </span>
            )}
          </div>
          {locationType && (
            <div className="flex items-center gap-1 text-muted-foreground">
              {getLocationIcon()}
              <span>{getLocationLabel()}</span>
            </div>
          )}
        </div>

        {!isPublished && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onPublish}
            disabled={isPublishing}
          >
            <Upload className="mr-2 h-4 w-4" />
            {t.gigs?.publish || "Publish to SwipeHire"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
