import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/lib/i18n';
import { Loader2, PoundSterling, Tag } from 'lucide-react';

interface Course {
  id?: string;
  title: string;
  description: string;
  platform: string;
  duration_minutes: number;
  level: string;
  price: number;
  lessons_count: number;
  thumbnail_url?: string;
  video_url?: string;
  is_published?: boolean;
  category?: string;
  course_type?: string;
  certificate?: string;
  recommended_for?: string;
}

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSave: (course: Omit<Course, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

export function CourseDialog({ open, onOpenChange, course, onSave, isLoading }: CourseDialogProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    title: '',
    description: '',
    platform: 'general',
    duration_minutes: 60,
    level: 'beginner',
    price: 0,
    lessons_count: 1,
    thumbnail_url: '',
    video_url: '',
    is_published: false,
    category: 'skills',
    course_type: 'internal',
    certificate: 'No',
    recommended_for: '',
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        platform: course.platform,
        duration_minutes: course.duration_minutes,
        level: course.level,
        price: course.price,
        lessons_count: course.lessons_count,
        thumbnail_url: course.thumbnail_url || '',
        video_url: course.video_url || '',
        is_published: course.is_published || false,
        category: course.category || 'skills',
        course_type: course.course_type || 'internal',
        certificate: course.certificate || 'No',
        recommended_for: course.recommended_for || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        platform: 'general',
        duration_minutes: 60,
        level: 'beginner',
        price: 0,
        lessons_count: 1,
        thumbnail_url: '',
        video_url: '',
        is_published: false,
        category: 'skills',
        course_type: 'internal',
        certificate: 'No',
        recommended_for: '',
      });
    }
  }, [course, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  // Auto-set category to certification if certificate is Yes
  useEffect(() => {
    if (formData.certificate === 'Yes' || formData.certificate === 'Badges') {
      if (formData.category !== 'certification') {
        setFormData(prev => ({ ...prev, category: 'certification' }));
      }
    }
  }, [formData.certificate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {course ? 'Editează Cursul' : 'Adaugă Curs Nou'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titlu</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categorie
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skills">🛠️ Skills</SelectItem>
                  <SelectItem value="improvement">🧠 Improvement</SelectItem>
                  <SelectItem value="certification">🏆 Certificare</SelectItem>
                  <SelectItem value="partner">🌐 Partner/Pro</SelectItem>
                  <SelectItem value="general">📚 General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_type">Tip Curs</Label>
              <Select
                value={formData.course_type}
                onValueChange={(value) => setFormData({ ...formData, course_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Intern (PLR/Propriu)</SelectItem>
                  <SelectItem value="external">Extern (Partner)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preț (£)</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="pl-9"
                  placeholder="0 pentru gratuit"
                />
              </div>
              <p className="text-xs text-muted-foreground">0 = Gratuit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nivel</Label>
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
              <Label htmlFor="platform">Platformă</Label>
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
              <Label htmlFor="duration">Durată (minute)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lessons_count">Număr de lecții</Label>
              <Input
                id="lessons_count"
                type="number"
                min="1"
                value={formData.lessons_count}
                onChange={(e) => setFormData({ ...formData, lessons_count: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate">Certificat</Label>
              <Select
                value={formData.certificate}
                onValueChange={(value) => setFormData({ ...formData, certificate: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">Nu</SelectItem>
                  <SelectItem value="Yes">Da - Certificat</SelectItem>
                  <SelectItem value="Badges">Da - Badges</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommended_for">Recomandat Pentru</Label>
            <Select
              value={formData.recommended_for || ''}
              onValueChange={(value) => setFormData({ ...formData, recommended_for: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nespecificat</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="productivity">Productivitate</SelectItem>
                <SelectItem value="mindset">Mindset</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="communication">Comunicare</SelectItem>
                <SelectItem value="computing">Computing & AI</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">URL Video (opțional)</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
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
      </DialogContent>
    </Dialog>
  );
}
