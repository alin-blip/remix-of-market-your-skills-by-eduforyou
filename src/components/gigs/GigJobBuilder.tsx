import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, Briefcase, Loader2, Sparkles, Rocket, Zap, Star, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useSwipeHireIntegration, GigPayload, ProfilePayload } from "@/hooks/useSwipeHireIntegration";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User } from "lucide-react";
import { GigJobCard } from "./GigJobCard";
import { GigJobDialog, GigJobFormData } from "./GigJobDialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const { 
    isConnected, 
    publishGig, 
    publishProfile, 
    isProfileSynced, 
    markProfileSynced,
    isServicesSynced,
    markServicesSynced 
  } = useSwipeHireIntegration();
  const [syncingProfile, setSyncingProfile] = useState(false);

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

    const parsePrice = (price: unknown): number => {
      if (typeof price === "number") return price;
      if (typeof price === "string") return parseInt(price.replace(/[^0-9]/g, "") || "0");
      return 0;
    };

    setEditingItem({
      type: "gig",
      title: `${offer.smv} - ${pkg.name}`,
      description: pkg.deliverables?.join("\n• ") || "",
      skills: skills.slice(0, 5),
      priceType: "fixed",
      priceMin: parsePrice(pkg.price),
      priceMax: parsePrice(pkg.price),
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

  const ensureProfileSynced = async (): Promise<boolean> => {
    const profileAlreadySynced = isProfileSynced();
    const servicesAlreadySynced = isServicesSynced();
    
    if (profileAlreadySynced && servicesAlreadySynced) return true;
    if (!user?.id) return false;

    setSyncingProfile(true);
    try {
      const [profileRes, ikigaiRes, offersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("ikigai_results").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("offers").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      if (!profileRes.data) {
        toast.error("Profile not found. Please complete your profile first.");
        return false;
      }

      const profile = profileRes.data;
      const ikigai = ikigaiRes.data;
      const offerData = offersRes.data;

      const services: { service_name: string; price_type: string; price_amount: number }[] = [];
      if (offerData) {
        const packages = [
          { pkg: offerData.starter_package as { name?: string; price?: number | string } | null, tier: "Starter" },
          { pkg: offerData.standard_package as { name?: string; price?: number | string } | null, tier: "Standard" },
          { pkg: offerData.premium_package as { name?: string; price?: number | string } | null, tier: "Premium" },
        ];
        
        packages.forEach(({ pkg, tier }) => {
          if (pkg && pkg.name) {
            const price = typeof pkg.price === "number" ? pkg.price : parseInt(String(pkg.price)) || 0;
            services.push({
              service_name: `${pkg.name} (${tier})`,
              price_type: "fixed",
              price_amount: price,
            });
          }
        });
      }

      const profilePayload: ProfilePayload = {
        profile: {
          full_name: profile.full_name || undefined,
          email: profile.email || undefined,
          bio: ikigai?.ikigai_statements?.[0] || undefined,
          headline: profile.study_field || undefined,
        },
        student_profile: {
          skills: skills,
          field_of_study: profile.study_field || undefined,
        },
        services: services.length > 0 ? services : undefined,
        values: (profile.values as string[] || []).map((v, i) => ({
          value_name: v,
          priority: i + 1,
        })),
      };

      await publishProfile(profilePayload);
      markProfileSynced();
      if (services.length > 0) {
        markServicesSynced();
      }
      toast.success("Profile & services synced to SwipeHire!");
      return true;
    } catch (error) {
      console.error("Error syncing profile:", error);
      toast.error("Failed to sync profile. Cannot publish gig.");
      return false;
    } finally {
      setSyncingProfile(false);
    }
  };

  const handleSaveAndPublish = async (data: GigJobFormData) => {
    if (!user?.id || !isConnected) {
      toast.error("Connect to SwipeHire first");
      return;
    }

    const profileSynced = await ensureProfileSynced();
    if (!profileSynced) return;

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
    
    const profileSynced = await ensureProfileSynced();
    if (!profileSynced) {
      setPublishingId(null);
      return;
    }

    try {
      const gigPayload: GigPayload = {
        external_id: gig.id,
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

  const packageIcons = {
    starter: <Zap className="h-5 w-5" />,
    standard: <Star className="h-5 w-5" />,
    premium: <Rocket className="h-5 w-5" />,
  };

  const packageColors = {
    starter: "from-blue-500 to-cyan-500",
    standard: "from-purple-500 to-pink-500",
    premium: "from-amber-500 to-orange-500",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">{t.common?.loading || "Loading..."}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {t.gigs?.title || "Gig & Job Builder"}
                </h1>
                <p className="text-muted-foreground">
                  {t.gigs?.subtitle || "Create and publish gigs and jobs to SwipeHire"}
                </p>
              </div>
            </motion.div>
            
            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-6 mt-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{gigs.filter(g => g.is_published).length}</span> Published Gigs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{gigs.filter(g => !g.is_published).length}</span> Draft Gigs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{jobs.length}</span> Jobs
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sync Alert */}
        {isConnected && !isProfileSynced() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="flex items-center justify-between">
                <span>{t.gigs?.profileNotSynced || "Your profile hasn't been synced to SwipeHire yet. It will sync automatically on first publish."}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={ensureProfileSynced}
                  disabled={syncingProfile}
                  className="border-amber-500/50 hover:bg-amber-500/10"
                >
                  {syncingProfile ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <User className="mr-2 h-3 w-3" />
                  )}
                  {t.gigs?.syncNow || "Sync Now"}
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Create from Packages */}
        {offer && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t.gigs?.fromOffer || "Create from your offer"}
                </h2>
                <p className="text-sm text-muted-foreground">Quick-start with your pre-defined packages</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["starter", "standard", "premium"] as const).map((key, index) => {
                const pkg = offer[`${key}_package`];
                if (!pkg) return null;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group cursor-pointer"
                    onClick={() => createFromPackage(key)}
                  >
                    <Card className="relative overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-300">
                      <div className={`absolute inset-0 bg-gradient-to-br ${packageColors[key]} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${packageColors[key]} text-white`}>
                            {packageIcons[key]}
                          </div>
                          <Badge variant="outline" className="capitalize font-medium">
                            {pkg.name || key}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="text-2xl font-bold">{pkg.price}</p>
                          <p className="text-sm text-muted-foreground">{pkg.delivery_time}</p>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                          {pkg.deliverables?.slice(0, 2).join(", ")}
                        </p>
                        
                        <Button 
                          size="sm" 
                          className={`w-full bg-gradient-to-r ${packageColors[key]} text-white border-0 opacity-90 group-hover:opacity-100`}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          {t.gigs?.createFromPackage || "Create Gig"}
                          <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-3"
        >
          <Button
            onClick={() => {
              setEditingItem({ type: "gig", skills: skills.slice(0, 5), locationType: "remote", priceType: "fixed", category: "webDevelopment", currency: "EUR" });
              setDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t.gigs?.createGig || "Create Gig"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setEditingItem({ type: "job", skills: skills.slice(0, 5), locationType: "remote", priceType: "monthly", category: "webDevelopment", currency: "EUR" });
              setDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t.gigs?.createJob || "Create Job"}
          </Button>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Tabs defaultValue="gigs" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/50">
              <TabsTrigger value="gigs" className="gap-2 data-[state=active]:bg-background">
                <Sparkles className="h-4 w-4" />
                {t.gigs?.yourGigs || "Your Gigs"}
                {gigs.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {gigs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="jobs" className="gap-2 data-[state=active]:bg-background">
                <Briefcase className="h-4 w-4" />
                {t.gigs?.yourJobs || "Your Jobs"}
                {jobs.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {jobs.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gigs" className="mt-6">
              <AnimatePresence mode="popLayout">
                {gigs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-primary/10 mb-4">
                          <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">{t.gigs?.noGigsYet || "No gigs yet"}</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Create your first gig to start offering your services
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => {
                            setEditingItem({ type: "gig", skills: skills.slice(0, 5), locationType: "remote", priceType: "fixed", category: "webDevelopment", currency: "EUR" });
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {t.gigs?.createGig || "Create Gig"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gigs.map((gig, index) => (
                      <motion.div
                        key={gig.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <GigJobCard
                          {...gig}
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="jobs" className="mt-6">
              <AnimatePresence mode="popLayout">
                {jobs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 rounded-full bg-primary/10 mb-4">
                          <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">{t.gigs?.noJobsYet || "No jobs yet"}</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Create a job posting to find full-time opportunities
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => {
                            setEditingItem({ type: "job", skills: skills.slice(0, 5), locationType: "remote", priceType: "monthly", category: "webDevelopment", currency: "EUR" });
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {t.gigs?.createJob || "Create Job"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <GigJobCard
                          {...job}
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      <GigJobDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(undefined);
        }}
        initialData={editingItem}
        availableSkills={skills}
        onSave={handleSave}
        onSaveAndPublish={isConnected ? handleSaveAndPublish : undefined}
      />
    </>
  );
}
