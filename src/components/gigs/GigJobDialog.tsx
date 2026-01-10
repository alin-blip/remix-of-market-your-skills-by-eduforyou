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
import { Loader2, Sparkles, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
  { value: "webDevelopment", label: "Web Development" },
  { value: "design", label: "Design" },
  { value: "marketing", label: "Marketing" },
  { value: "writing", label: "Writing" },
  { value: "videoEditing", label: "Video Editing" },
  { value: "other", label: "Other" },
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? (t.gigs?.edit || "Edit") : (t.gigs?.createGig || "Create Gig")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gig">{t.gigs?.type?.gig || "Gig (one-time project)"}</SelectItem>
                <SelectItem value="job">{t.gigs?.type?.job || "Full-time Job"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.gigs?.form?.title || "Title"}</Label>
            <Input
              placeholder={t.gigs?.form?.titlePlaceholder || "e.g.: Web Development for Startups"}
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.gigs?.form?.description || "Description"}</Label>
              {onGenerateDescription && (
                <Button type="button" variant="ghost" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                  {t.gigs?.form?.generateWithAI || "Generate with AI"}
                </Button>
              )}
            </div>
            <Textarea
              placeholder={t.gigs?.form?.descriptionPlaceholder || "Describe what you offer..."}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.gigs?.form?.category || "Category"}</Label>
            <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.gigs?.form?.skills || "Skills"}</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)}><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
              />
              <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>Add</Button>
            </div>
            {availableSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {availableSkills.filter((s) => !formData.skills.includes(s)).slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => addSkill(skill)}>+ {skill}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t.gigs?.form?.priceType || "Price Type"}</Label>
              <Select value={formData.priceType} onValueChange={(v) => handleChange("priceType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">{t.gigs?.priceType?.fixed || "Fixed"}</SelectItem>
                  <SelectItem value="hourly">{t.gigs?.priceType?.hourly || "Hourly"}</SelectItem>
                  <SelectItem value="monthly">{t.gigs?.priceType?.monthly || "Monthly"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.gigs?.form?.priceAmount || "Amount"}</Label>
              <Input type="number" value={formData.priceMin || ""} onChange={(e) => handleChange("priceMin", Number(e.target.value))} placeholder="Min" />
            </div>
            <div className="space-y-2">
              <Label>Max</Label>
              <Input type="number" value={formData.priceMax || ""} onChange={(e) => handleChange("priceMax", Number(e.target.value))} placeholder="Max" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.gigs?.form?.locationType || "Location Type"}</Label>
            <Select value={formData.locationType} onValueChange={(v) => handleChange("locationType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">{t.gigs?.location?.remote || "Remote"}</SelectItem>
                <SelectItem value="onsite">{t.gigs?.location?.onsite || "On-site"}</SelectItem>
                <SelectItem value="hybrid">{t.gigs?.location?.hybrid || "Hybrid"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSaving}>{t.gigs?.form?.save || "Save"}</Button>
          {onSaveAndPublish && (
            <Button onClick={() => handleSave(true)} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t.gigs?.form?.saveAndPublish || "Save & Publish"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
