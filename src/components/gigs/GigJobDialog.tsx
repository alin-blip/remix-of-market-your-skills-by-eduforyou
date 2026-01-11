import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, X, Briefcase, Zap, Globe, Building2, MapPin, DollarSign, Tag, FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GigJobFormData {
  id?: string;
  type: "gig" | "job";
  title: string;
  description: string;
  category: string;
  skills: string[];
  priceType: "fixed" | "hourly" | "monthly";
  priceMin: number;
  priceMax: number;
  currency: string;
  locationType: "remote" | "onsite" | "hybrid";
  location?: string;
  sourcePackage?: string;
  platform?: string;
}

interface GigJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<GigJobFormData>;
  availableSkills?: string[];
  onSave: (data: GigJobFormData) => Promise<void>;
  onSaveAndPublish?: (data: GigJobFormData) => Promise<void>;
  onGenerateDescription?: (data: Partial<GigJobFormData>) => Promise<string>;
  isGenerating?: boolean;
}

const categories = [
  { value: "webDevelopment", label: "Web Development", icon: "💻" },
  { value: "design", label: "Design", icon: "🎨" },
  { value: "marketing", label: "Marketing", icon: "📈" },
  { value: "writing", label: "Writing", icon: "✍️" },
  { value: "videoEditing", label: "Video Editing", icon: "🎬" },
  { value: "other", label: "Other", icon: "📦" },
];

const platforms = [
  { value: "swipehire", label: "SwipeHire", icon: "🚀", color: "bg-primary" },
  { value: "fiverr", label: "Fiverr", icon: "🟢", color: "bg-green-500" },
  { value: "upwork", label: "Upwork", icon: "🟩", color: "bg-emerald-500" },
  { value: "freelancer", label: "Freelancer.com", icon: "🔵", color: "bg-blue-500" },
];

export function GigJobDialog({
  open,
  onOpenChange,
  initialData,
  availableSkills = [],
  onSave,
  onSaveAndPublish,
  onGenerateDescription,
  isGenerating,
}: GigJobDialogProps) {
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPlatform, setIsGeneratingPlatform] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  
  const [formData, setFormData] = useState<GigJobFormData>({
    type: "gig",
    title: "",
    description: "",
    category: "webDevelopment",
    skills: [],
    priceType: "fixed",
    priceMin: 0,
    priceMax: 0,
    currency: "EUR",
    locationType: "remote",
    platform: "swipehire",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (field: keyof GigJobFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      handleChange("skills", [...formData.skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    handleChange("skills", formData.skills.filter((s) => s !== skill));
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      if (publish && onSaveAndPublish) {
        await onSaveAndPublish(formData);
      } else {
        await onSave(formData);
      }
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (onGenerateDescription) {
      const description = await onGenerateDescription(formData);
      handleChange("description", description);
    }
  };

  const handleGenerateForPlatform = async () => {
    if (!formData.title || !formData.platform) {
      toast.error("Adaugă un titlu mai întâi");
      return;
    }

    setIsGeneratingPlatform(true);
    try {
      const { data, error } = await supabase.functions.invoke('gig-platform-generator', {
        body: {
          platform: formData.platform,
          title: formData.title,
          category: formData.category,
          skills: formData.skills,
          priceMin: formData.priceMin,
          priceMax: formData.priceMax,
          priceType: formData.priceType,
        },
      });

      if (error) throw error;

      if (data?.optimizedTitle) {
        handleChange("title", data.optimizedTitle);
      }
      if (data?.optimizedDescription) {
        handleChange("description", data.optimizedDescription);
      }
      if (data?.suggestedPrice) {
        handleChange("priceMin", data.suggestedPrice.min || formData.priceMin);
        handleChange("priceMax", data.suggestedPrice.max || formData.priceMax);
      }

      toast.success(`Gig optimizat pentru ${platforms.find(p => p.value === formData.platform)?.label}!`);
    } catch (error) {
      console.error('Platform generation error:', error);
      toast.error("Eroare la generarea conținutului");
    } finally {
      setIsGeneratingPlatform(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b px-6 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={`p-2 rounded-lg ${formData.type === "gig" ? "bg-purple-500/20" : "bg-blue-500/20"}`}>
                {formData.type === "gig" ? (
                  <Zap className="h-5 w-5 text-purple-500" />
                ) : (
                  <Briefcase className="h-5 w-5 text-blue-500" />
                )}
              </div>
              {initialData?.id ? (t.gigs?.edit || "Edit") : (t.gigs?.createGig || "Create")} {formData.type === "gig" ? "Gig" : "Job"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Platform Selector - NEW */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Platformă țintă
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <motion.button
                  key={platform.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChange("platform", platform.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.platform === platform.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span className={`text-xs font-medium ${formData.platform === platform.value ? "" : "text-muted-foreground"}`}>
                    {platform.label}
                  </span>
                </motion.button>
              ))}
            </div>
            
            {/* AI Generate for Platform Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateForPlatform}
              disabled={isGeneratingPlatform || !formData.title}
              className="w-full gap-2 border-dashed"
            >
              {isGeneratingPlatform ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generează conținut optimizat pentru {platforms.find(p => p.value === formData.platform)?.label}
            </Button>
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "gig", label: t.gigs?.type?.gig || "Gig (one-time project)", icon: Zap, color: "purple" },
                { value: "job", label: t.gigs?.type?.job || "Full-time Job", icon: Briefcase, color: "blue" },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChange("type", option.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    formData.type === option.value
                      ? `border-${option.color}-500 bg-${option.color}-500/10`
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <option.icon className={`h-5 w-5 ${formData.type === option.value ? `text-${option.color}-500` : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${formData.type === option.value ? "" : "text-muted-foreground"}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {t.gigs?.form?.title || "Title"}
            </Label>
            <Input
              placeholder={t.gigs?.form?.titlePlaceholder || "e.g.: Web Development for Startups"}
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="h-11"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {t.gigs?.form?.description || "Description"}
              </Label>
              {onGenerateDescription && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  {isGenerating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                  {t.gigs?.form?.generateWithAI || "Generate with AI"}
                </Button>
              )}
            </div>
            <Textarea
              placeholder={t.gigs?.form?.descriptionPlaceholder || "Describe what you offer..."}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {t.gigs?.form?.category || "Category"}
            </Label>
            <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              {t.gigs?.form?.skills || "Skills"}
            </Label>
            
            <AnimatePresence>
              {formData.skills.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {formData.skills.map((skill) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
                        {skill}
                        <button 
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <Input
                placeholder="Add skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                className="h-10"
              />
              <Button type="button" variant="secondary" onClick={() => addSkill(skillInput)} className="shrink-0">
                Add
              </Button>
            </div>

            {availableSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {availableSkills.filter((s) => !formData.skills.includes(s)).slice(0, 6).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors" 
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Section */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/30 border">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Pricing
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t.gigs?.form?.priceType || "Type"}</Label>
                <Select value={formData.priceType} onValueChange={(v) => handleChange("priceType", v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">{t.gigs?.priceType?.fixed || "Fixed"}</SelectItem>
                    <SelectItem value="hourly">{t.gigs?.priceType?.hourly || "Hourly"}</SelectItem>
                    <SelectItem value="monthly">{t.gigs?.priceType?.monthly || "Monthly"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Min</Label>
                <Input 
                  type="number" 
                  value={formData.priceMin || ""} 
                  onChange={(e) => handleChange("priceMin", Number(e.target.value))} 
                  placeholder="0"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Max</Label>
                <Input 
                  type="number" 
                  value={formData.priceMax || ""} 
                  onChange={(e) => handleChange("priceMax", Number(e.target.value))} 
                  placeholder="0"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {t.gigs?.form?.locationType || "Location Type"}
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "remote", label: t.gigs?.location?.remote || "Remote", icon: Globe },
                { value: "onsite", label: t.gigs?.location?.onsite || "On-site", icon: Building2 },
                { value: "hybrid", label: t.gigs?.location?.hybrid || "Hybrid", icon: MapPin },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleChange("locationType", option.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.locationType === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <option.icon className={`h-5 w-5 ${formData.locationType === option.value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${formData.locationType === option.value ? "" : "text-muted-foreground"}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="sticky bottom-0 bg-background border-t px-6 py-4 gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSaving}>
            {t.gigs?.form?.save || "Save Draft"}
          </Button>
          {onSaveAndPublish && (
            <Button onClick={() => handleSave(true)} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t.gigs?.form?.saveAndPublish || "Save & Publish"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}