import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Briefcase, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useSwipeHireIntegration, GigPayload } from "@/hooks/useSwipeHireIntegration";
import { GigJobCard } from "./GigJobCard";
import { GigJobDialog, GigJobFormData } from "./GigJobDialog";
import { toast } from "sonner";

interface PackageData {
  name: string;
  price: string;
  delivery_time: string;
  deliverables: string[];
}

interface Offer {
  smv: string;
  target_market: string;
  starter_package: PackageData;
  standard_package: PackageData;
  premium_package: PackageData;
}

interface GigJob {
  id: string;
  type: "gig" | "job";
  title: string;
  description: string;
  category: string | null;
  skills: string[];
  price_type: string | null;
  price_min: number | null;
  price_max: number | null;
  currency: string | null;
  location_type: string | null;
  location: string | null;
  source_package: string | null;
  is_published: boolean;
  swipehire_id: string | null;
}

export function GigJobBuilder() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { isConnected, publishGig } = useSwipeHireIntegration();

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [gigsJobs, setGigsJobs] = useState<GigJob[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<GigJobFormData> | undefined>();
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const [offerRes, skillsRes, gigsRes] = await Promise.all([
        supabase.from("offers").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("skill_entries").select("skill").eq("user_id", user.id),
        supabase.from("gigs_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (offerRes.data) {
        setOffer({
          smv: offerRes.data.smv || "",
          target_market: offerRes.data.target_market || "",
          starter_package: offerRes.data.starter_package as unknown as PackageData,
          standard_package: offerRes.data.standard_package as unknown as PackageData,
          premium_package: offerRes.data.premium_package as unknown as PackageData,
        });
      }

      if (skillsRes.data) {
        setSkills(skillsRes.data.map((s) => s.skill));
      }

      if (gigsRes.data) {
        setGigsJobs(gigsRes.data.map((g) => ({
          id: g.id,
          type: g.type as "gig" | "job",
          title: g.title,
          description: g.description,
          category: g.category,
          skills: Array.isArray(g.skills) ? g.skills as string[] : [],
          price_type: g.price_type,
          price_min: g.price_min,
          price_max: g.price_max,
          currency: g.currency,
          location_type: g.location_type,
          location: g.location,
          source_package: g.source_package,
          is_published: g.is_published || false,
          swipehire_id: g.swipehire_id,
        })));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createFromPackage = (packageKey: "starter" | "standard" | "premium") => {
    if (!offer) return;
    const pkg = offer[`${packageKey}_package`];
    if (!pkg) return;

    setEditingItem({
      type: "gig",
      title: `${offer.smv} - ${pkg.name}`,
      description: pkg.deliverables?.join("\n• ") || "",
      skills: skills.slice(0, 5),
      priceType: "fixed",
      priceMin: parseInt(pkg.price?.replace(/[^0-9]/g, "") || "0"),
      priceMax: parseInt(pkg.price?.replace(/[^0-9]/g, "") || "0"),
      category: "webDevelopment",
      locationType: "remote",
      currency: "EUR",
      sourcePackage: packageKey,
    });
    setDialogOpen(true);
  };

  const handleSave = async (data: GigJobFormData) => {
    if (!user?.id) return;

    try {
      const payload = {
        user_id: user.id,
        type: data.type,
        title: data.title,
        description: data.description,
        category: data.category,
        skills: data.skills,
        price_type: data.priceType,
        price_min: data.priceMin,
        price_max: data.priceMax,
        currency: data.currency,
        location_type: data.locationType,
        location: data.location,
        source_package: data.sourcePackage,
      };

      if (data.id) {
        await supabase.from("gigs_jobs").update(payload).eq("id", data.id);
      } else {
        await supabase.from("gigs_jobs").insert(payload);
      }

      toast.success(t.gigs?.savedSuccess || "Saved!");
      loadData();
    } catch (error) {
      console.error("Error saving gig:", error);
      toast.error(t.gigs?.saveError || "Error saving");
    }
  };

  const handleSaveAndPublish = async (data: GigJobFormData) => {
    if (!user?.id || !isConnected) {
      toast.error("Connect to SwipeHire first");
      return;
    }

    try {
      const payload = {
        user_id: user.id,
        type: data.type,
        title: data.title,
        description: data.description,
        category: data.category,
        skills: data.skills,
        price_type: data.priceType,
        price_min: data.priceMin,
        price_max: data.priceMax,
        currency: data.currency,
        location_type: data.locationType,
        location: data.location,
        source_package: data.sourcePackage,
        is_published: true,
        published_at: new Date().toISOString(),
      };

      let gigId = data.id;
      if (data.id) {
        await supabase.from("gigs_jobs").update(payload).eq("id", data.id);
      } else {
        const res = await supabase.from("gigs_jobs").insert(payload).select().single();
        gigId = res.data?.id;
      }

      const gigPayload: GigPayload = {
        external_id: gigId!,
        external_user_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        skills: data.skills,
        price_type: data.priceType === "monthly" ? "hourly" : data.priceType,
        price_amount: data.priceMin,
        currency: data.currency,
        location_type: data.locationType,
      };

      const result = await publishGig(gigPayload);
      
      if (result?.swipehire_id) {
        await supabase.from("gigs_jobs").update({ swipehire_id: result.swipehire_id }).eq("id", gigId);
      }

      toast.success(t.gigs?.publishedSuccess || "Published!");
      loadData();
    } catch (error) {
      console.error("Error publishing gig:", error);
      toast.error(t.gigs?.publishError || "Publish error");
    }
  };

  const handlePublish = async (gig: GigJob) => {
    if (!user?.id || !isConnected) {
      toast.error("Connect to SwipeHire first");
      return;
    }

    setPublishingId(gig.id);
    try {
      const gigPayload: GigPayload = {
        external_id: gig.id,
        external_user_id: user.id,
        title: gig.title,
        description: gig.description,
        category: gig.category || undefined,
        skills: gig.skills,
        price_type: gig.price_type === "monthly" ? "hourly" : (gig.price_type as "fixed" | "hourly"),
        price_amount: gig.price_min || undefined,
        currency: gig.currency || "EUR",
        location_type: gig.location_type as "remote" | "onsite" | "hybrid",
      };

      const result = await publishGig(gigPayload);

      await supabase.from("gigs_jobs").update({
        is_published: true,
        published_at: new Date().toISOString(),
        swipehire_id: result?.swipehire_id || null,
      }).eq("id", gig.id);

      toast.success(t.gigs?.publishedSuccess || "Published!");
      loadData();
    } catch (error) {
      console.error("Error publishing:", error);
      toast.error(t.gigs?.publishError || "Publish error");
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from("gigs_jobs").delete().eq("id", id);
      toast.success(t.gigs?.deletedSuccess || "Deleted!");
      loadData();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleEdit = (gig: GigJob) => {
    setEditingItem({
      id: gig.id,
      type: gig.type,
      title: gig.title,
      description: gig.description,
      category: gig.category || "other",
      skills: gig.skills,
      priceType: (gig.price_type as "fixed" | "hourly" | "monthly") || "fixed",
      priceMin: gig.price_min || 0,
      priceMax: gig.price_max || 0,
      currency: gig.currency || "EUR",
      locationType: (gig.location_type as "remote" | "onsite" | "hybrid") || "remote",
      location: gig.location || undefined,
      sourcePackage: gig.source_package || undefined,
    });
    setDialogOpen(true);
  };

  const gigs = gigsJobs.filter((g) => g.type === "gig");
  const jobs = gigsJobs.filter((g) => g.type === "job");

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {t.gigs?.title || "Gig & Job Builder"}
          </CardTitle>
          <CardDescription>{t.gigs?.subtitle || "Create and publish gigs and jobs to SwipeHire"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {offer && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t.gigs?.fromOffer || "Create from your offer"}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(["starter", "standard", "premium"] as const).map((key) => {
                  const pkg = offer[`${key}_package`];
                  if (!pkg) return null;
                  return (
                    <Card key={key} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => createFromPackage(key)}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">{pkg.name || key}</Badge>
                          <span className="font-bold">{pkg.price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {pkg.deliverables?.slice(0, 2).join(", ")}
                        </p>
                        <Button size="sm" variant="secondary" className="w-full">
                          <Package className="mr-2 h-3 w-3" />
                          {t.gigs?.createFromPackage || "Create Gig"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingItem({ type: "gig", skills: skills.slice(0, 5), locationType: "remote", priceType: "fixed", category: "webDevelopment", currency: "EUR" });
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.gigs?.createGig || "Create Gig"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingItem({ type: "job", skills: skills.slice(0, 5), locationType: "remote", priceType: "monthly", category: "webDevelopment", currency: "EUR" });
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t.gigs?.createJob || "Create Full-time Job"}
            </Button>
          </div>

          <Tabs defaultValue="gigs">
            <TabsList>
              <TabsTrigger value="gigs">
                {t.gigs?.yourGigs || "Your Gigs"} ({gigs.length})
              </TabsTrigger>
              <TabsTrigger value="jobs">
                {t.gigs?.yourJobs || "Your Jobs"} ({jobs.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="gigs" className="mt-4">
              {gigs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t.gigs?.noGigsYet || "No gigs yet. Create your first gig from your offer packages."}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gigs.map((gig) => (
                    <GigJobCard
                      key={gig.id}
                      id={gig.id}
                      type={gig.type}
                      title={gig.title}
                      description={gig.description}
                      skills={gig.skills}
                      priceType={gig.price_type || undefined}
                      priceMin={gig.price_min || undefined}
                      priceMax={gig.price_max || undefined}
                      currency={gig.currency || undefined}
                      locationType={gig.location_type || undefined}
                      isPublished={gig.is_published}
                      onEdit={() => handleEdit(gig)}
                      onDelete={() => handleDelete(gig.id)}
                      onPublish={() => handlePublish(gig)}
                      isPublishing={publishingId === gig.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="jobs" className="mt-4">
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t.gigs?.noJobsYet || "No jobs yet. Create your first job posting."}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <GigJobCard
                      key={job.id}
                      id={job.id}
                      type={job.type}
                      title={job.title}
                      description={job.description}
                      skills={job.skills}
                      priceType={job.price_type || undefined}
                      priceMin={job.price_min || undefined}
                      priceMax={job.price_max || undefined}
                      currency={job.currency || undefined}
                      locationType={job.location_type || undefined}
                      isPublished={job.is_published}
                      onEdit={() => handleEdit(job)}
                      onDelete={() => handleDelete(job.id)}
                      onPublish={() => handlePublish(job)}
                      isPublishing={publishingId === job.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <GigJobDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingItem}
        availableSkills={skills}
        onSave={handleSave}
        onSaveAndPublish={isConnected ? handleSaveAndPublish : undefined}
      />
    </>
  );
}
