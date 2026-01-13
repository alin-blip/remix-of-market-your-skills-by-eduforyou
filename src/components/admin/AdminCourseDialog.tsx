import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, BookOpen, ExternalLink } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string | null;
  level: string;
  platform: string;
  price: number;
  duration_minutes: number | null;
  is_published: boolean;
  course_type: string | null;
  provider: string | null;
  external_url: string | null;
  requires_pro: boolean | null;
  lessons_count: number | null;
}

interface AdminCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onSuccess: () => void;
}

export function AdminCourseDialog({ open, onOpenChange, course, onSuccess }: AdminCourseDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [courseType, setCourseType] = useState<'internal' | 'external'>('internal');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'general',
    duration_minutes: 60,
    level: 'beginner',
    price: 0,
    lessons_count: 1,
    video_url: '',
    is_published: false,
    // External course fields
    provider: '',
    external_url: '',
    requires_pro: true,
    certificate: 'No',
    language: 'EN',
    recommended_for: '',
    prerequisites: '',
  });

  useEffect(() => {
    if (course) {
      setCourseType(course.course_type === 'external' ? 'external' : 'internal');
      setFormData({
        title: course.title || '',
        description: course.description || '',
        platform: course.platform || 'general',
        duration_minutes: course.duration_minutes || 60,
        level: course.level || 'beginner',
        price: course.price || 0,
        lessons_count: course.lessons_count || 1,
        video_url: '',
        is_published: course.is_published || false,
        provider: course.provider || '',
        external_url: course.external_url || '',
        requires_pro: course.requires_pro ?? true,
        certificate: 'No',
        language: 'EN',
        recommended_for: '',
        prerequisites: '',
      });
    } else {
      setCourseType('internal');
      setFormData({
        title: '',
        description: '',
        platform: 'general',
        duration_minutes: 60,
        level: 'beginner',
        price: 0,
        lessons_count: 1,
        video_url: '',
        is_published: false,
        provider: '',
        external_url: '',
        requires_pro: true,
        certificate: 'No',
        language: 'EN',
        recommended_for: '',
        prerequisites: '',
      });
    }
  }, [course, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        platform: formData.platform,
        duration_minutes: formData.duration_minutes,
        level: formData.level,
        price: formData.price,
        lessons_count: formData.lessons_count,
        is_published: formData.is_published,
        course_type: courseType,
        provider: courseType === 'external' ? formData.provider : null,
        external_url: courseType === 'external' ? formData.external_url : null,
        requires_pro: courseType === 'external' ? formData.requires_pro : false,
        certificate: courseType === 'external' ? formData.certificate : null,
        language: formData.language,
        recommended_for: courseType === 'external' ? formData.recommended_for : null,
        prerequisites: formData.prerequisites,
      };

      if (course) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', course.id);
        if (error) throw error;
        toast.success('Cursul a fost actualizat!');
      } else {
        const { error } = await supabase.from('courses').insert(courseData);
        if (error) throw error;
        toast.success('Cursul a fost creat!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Eroare la salvarea cursului');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {course ? 'Editează Cursul' : 'Adaugă Curs Nou'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={courseType} onValueChange={(v) => setCourseType(v as 'internal' | 'external')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internal" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Curs Intern
            </TabsTrigger>
            <TabsTrigger value="external" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Curs Extern
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="title">Titlu *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Numele cursului"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descriere</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrierea cursului"
                rows={3}
              />
            </div>

            <TabsContent value="internal" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preț (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0 pentru gratuit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nivel</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Începător</SelectItem>
                      <SelectItem value="intermediate">Intermediar</SelectItem>
                      <SelectItem value="advanced">Avansat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platformă</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="fiverr">Fiverr</SelectItem>
                      <SelectItem value="upwork">Upwork</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Durată (minute)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="external" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider *</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value) => setFormData({ ...formData, provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Microsoft">Microsoft</SelectItem>
                      <SelectItem value="AWS">AWS</SelectItem>
                      <SelectItem value="Coursera">Coursera</SelectItem>
                      <SelectItem value="DeepLearning.AI">DeepLearning.AI</SelectItem>
                      <SelectItem value="fast.ai">fast.ai</SelectItem>
                      <SelectItem value="Harvard">Harvard</SelectItem>
                      <SelectItem value="freeCodeCamp">freeCodeCamp</SelectItem>
                      <SelectItem value="GitHub">GitHub</SelectItem>
                      <SelectItem value="TryHackMe">TryHackMe</SelectItem>
                      <SelectItem value="Hack The Box">Hack The Box</SelectItem>
                      <SelectItem value="HubSpot">HubSpot</SelectItem>
                      <SelectItem value="TensorFlow">TensorFlow</SelectItem>
                      <SelectItem value="Codecademy">Codecademy</SelectItem>
                      <SelectItem value="MDN">MDN</SelectItem>
                      <SelectItem value="OpenAI">OpenAI</SelectItem>
                      <SelectItem value="Other">Altul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nivel</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Începător</SelectItem>
                      <SelectItem value="intermediate">Intermediar</SelectItem>
                      <SelectItem value="advanced">Avansat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL Curs Extern *</Label>
                <Input
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  placeholder="https://example.com/course"
                  required={courseType === 'external'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Durată estimată</Label>
                  <Input
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    placeholder="ex: 40 ore"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recomandat pentru</Label>
                  <Select
                    value={formData.recommended_for}
                    onValueChange={(value) => setFormData({ ...formData, recommended_for: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectează categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computing">Computing & AI</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="business">Business & Marketing</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="tourism">Tourism</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Certificat</Label>
                  <Select
                    value={formData.certificate}
                    onValueChange={(value) => setFormData({ ...formData, certificate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Da</SelectItem>
                      <SelectItem value="No">Nu</SelectItem>
                      <SelectItem value="Optional">Opțional (plătit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Limbă</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EN">Engleză</SelectItem>
                      <SelectItem value="RO">Română</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cerințe preliminare</Label>
                <Input
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  placeholder="ex: Python basics, math basics"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={formData.requires_pro}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_pro: checked })}
                />
                <Label>Necesită Plan Pro</Label>
              </div>
            </TabsContent>

            {/* Common bottom section */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Publicat</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Anulează
                </Button>
                <Button type="submit" disabled={isLoading || !formData.title}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {course ? 'Salvează' : 'Adaugă'}
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
