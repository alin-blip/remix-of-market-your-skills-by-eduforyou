import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Package, Trash2, Edit, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

interface Bundle {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  original_price: number;
  bundle_price: number;
  currency: string;
  is_published: boolean;
  created_at: string;
}

interface BundleCourse {
  id: string;
  bundle_id: string;
  course_id: string;
  position: number;
  courses?: {
    id: string;
    title: string;
    price: number;
  };
}

export default function BundlesManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bundle_price: 0,
    currency: 'GBP',
  });

  // Fetch bundles
  const { data: bundles, isLoading: bundlesLoading } = useQuery({
    queryKey: ['admin-bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_bundles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Bundle[];
    },
  });

  // Fetch all courses for selection
  const { data: courses } = useQuery({
    queryKey: ['admin-courses-for-bundles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, price, currency')
        .eq('course_type', 'internal')
        .order('title');
      if (error) throw error;
      return data;
    },
  });

  // Fetch bundle courses
  const { data: bundleCourses } = useQuery({
    queryKey: ['bundle-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bundle_courses')
        .select(`
          id,
          bundle_id,
          course_id,
          position,
          courses (id, title, price)
        `);
      if (error) throw error;
      return data as BundleCourse[];
    },
  });

  // Create/Update bundle mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { bundle: Partial<Bundle>; courseIds: string[] }) => {
      const selectedCoursePrices = courses?.filter(c => data.courseIds.includes(c.id)) || [];
      const originalPrice = selectedCoursePrices.reduce((sum, c) => sum + (c.price || 0), 0);

      if (editingBundle) {
        // Update existing bundle
        const { error: bundleError } = await supabase
          .from('course_bundles')
          .update({
            ...data.bundle,
            original_price: originalPrice,
          })
          .eq('id', editingBundle.id);
        if (bundleError) throw bundleError;

        // Delete existing bundle courses
        await supabase.from('bundle_courses').delete().eq('bundle_id', editingBundle.id);

        // Insert new bundle courses
        if (data.courseIds.length > 0) {
          const { error: coursesError } = await supabase.from('bundle_courses').insert(
            data.courseIds.map((courseId, index) => ({
              bundle_id: editingBundle.id,
              course_id: courseId,
              position: index,
            }))
          );
          if (coursesError) throw coursesError;
        }

        return editingBundle.id;
      } else {
        // Create new bundle
        const { data: newBundle, error: bundleError } = await supabase
          .from('course_bundles')
          .insert({
            title: data.bundle.title || '',
            description: data.bundle.description,
            bundle_price: data.bundle.bundle_price || 0,
            currency: data.bundle.currency || 'GBP',
            original_price: originalPrice,
          })
          .select()
          .single();
        if (bundleError) throw bundleError;

        // Insert bundle courses
        if (data.courseIds.length > 0) {
          const { error: coursesError } = await supabase.from('bundle_courses').insert(
            data.courseIds.map((courseId, index) => ({
              bundle_id: newBundle.id,
              course_id: courseId,
              position: index,
            }))
          );
          if (coursesError) throw coursesError;
        }

        return newBundle.id;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bundles'] });
      queryClient.invalidateQueries({ queryKey: ['bundle-courses'] });
      toast.success(editingBundle ? 'Bundle actualizat!' : 'Bundle creat!');
      resetForm();
    },
    onError: (error) => {
      console.error('Error saving bundle:', error);
      toast.error('Eroare la salvare');
    },
  });

  // Delete bundle mutation
  const deleteMutation = useMutation({
    mutationFn: async (bundleId: string) => {
      const { error } = await supabase.from('course_bundles').delete().eq('id', bundleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bundles'] });
      toast.success('Bundle șters!');
    },
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ bundleId, isPublished }: { bundleId: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from('course_bundles')
        .update({ is_published: isPublished })
        .eq('id', bundleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bundles'] });
    },
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', bundle_price: 0, currency: 'GBP' });
    setSelectedCourses([]);
    setEditingBundle(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormData({
      title: bundle.title,
      description: bundle.description || '',
      bundle_price: bundle.bundle_price,
      currency: bundle.currency,
    });
    const bundleCourseIds = bundleCourses
      ?.filter(bc => bc.bundle_id === bundle.id)
      .map(bc => bc.course_id) || [];
    setSelectedCourses(bundleCourseIds);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('Titlul este obligatoriu');
      return;
    }
    if (selectedCourses.length === 0) {
      toast.error('Selectează cel puțin un curs');
      return;
    }

    saveMutation.mutate({
      bundle: formData,
      courseIds: selectedCourses,
    });
  };

  const getBundleCoursesCount = (bundleId: string) => {
    return bundleCourses?.filter(bc => bc.bundle_id === bundleId).length || 0;
  };

  const calculateSavings = (original: number, bundle: number) => {
    const savings = original - bundle;
    const percent = Math.round((savings / original) * 100);
    return { savings, percent };
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bundles Manager</h1>
            <p className="text-muted-foreground">Creează și gestionează pachete de cursuri cu discount</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Bundle Nou
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingBundle ? 'Editează Bundle' : 'Creează Bundle Nou'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Titlu Bundle</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Complete Marketing Bundle"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descriere</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descriere pachet..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bundlePrice">Preț Bundle (£)</Label>
                    <Input
                      id="bundlePrice"
                      type="number"
                      value={formData.bundle_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, bundle_price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Preț Original</Label>
                    <div className="mt-2 font-medium text-muted-foreground">
                      £{courses?.filter(c => selectedCourses.includes(c.id)).reduce((sum, c) => sum + (c.price || 0), 0) || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Selectează Cursuri</Label>
                  <ScrollArea className="h-60 mt-2 border rounded-lg p-4">
                    <div className="space-y-3">
                      {courses?.map((course) => (
                        <div key={course.id} className="flex items-center gap-3">
                          <Checkbox
                            id={course.id}
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCourses(prev => [...prev, course.id]);
                              } else {
                                setSelectedCourses(prev => prev.filter(id => id !== course.id));
                              }
                            }}
                          />
                          <label htmlFor={course.id} className="flex-1 text-sm cursor-pointer">
                            {course.title}
                          </label>
                          <Badge variant="outline">£{course.price}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedCourses.length} cursuri selectate
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetForm}>Anulează</Button>
                  <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingBundle ? 'Salvează' : 'Creează'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {bundlesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : bundles?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Niciun bundle creat</h3>
              <p className="text-muted-foreground mb-4">Creează primul bundle de cursuri pentru a oferi discount clienților</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Creează Bundle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles?.map((bundle) => {
              const { savings, percent } = calculateSavings(bundle.original_price, bundle.bundle_price);
              return (
                <Card key={bundle.id} className={!bundle.is_published ? 'opacity-70' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{bundle.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {getBundleCoursesCount(bundle.id)} cursuri incluse
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={bundle.is_published}
                          onCheckedChange={(checked) => 
                            togglePublishMutation.mutate({ bundleId: bundle.id, isPublished: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold">£{bundle.bundle_price}</span>
                        <span className="text-lg text-muted-foreground line-through">£{bundle.original_price}</span>
                        <Badge variant="secondary" className="ml-auto">
                          -{percent}%
                        </Badge>
                      </div>
                      <p className="text-sm text-green-600">
                        Economisești £{savings}
                      </p>
                      {bundle.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {bundle.description}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(bundle)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Editează
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Sigur vrei să ștergi acest bundle?')) {
                              deleteMutation.mutate(bundle.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
