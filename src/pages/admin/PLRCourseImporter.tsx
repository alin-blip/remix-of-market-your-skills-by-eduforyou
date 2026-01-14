import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Upload, Video, FileText, Check, Loader2, GripVertical, Trash2, Plus, Archive, FolderOpen } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

interface LessonData {
  id: string;
  title: string;
  description: string;
  videoFile: File | null;
  videoName: string;
  videoStoragePath?: string; // For ZIP-extracted videos
  duration: number;
  position: number;
  isFree: boolean;
  resources: { name: string; file: File }[];
}

interface CourseFormData {
  title: string;
  description: string;
  price: number;
  currency: string;
  level: string;
  category: string;
  certificate: string;
  thumbnail: File | null;
  thumbnailPreview: string;
  prerequisites: string;
  recommendedFor: string;
  salesHeadline: string;
  salesBullets: string[];
  salesTestimonials: { name: string; text: string }[];
}

const PRICE_OPTIONS = [
  { value: 49, label: '£49 - Entry Level' },
  { value: 69, label: '£69 - Standard' },
  { value: 79, label: '£79 - Premium' },
  { value: 99, label: '£99 - Advanced' },
];

export default function PLRCourseImporter() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingZip, setIsExtractingZip] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [zipProgress, setZipProgress] = useState(0);
  
  const [courseData, setCourseData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: 49,
    currency: 'GBP',
    level: 'beginner',
    category: 'certification',
    certificate: 'Yes',
    thumbnail: null,
    thumbnailPreview: '',
    prerequisites: '',
    recommendedFor: '',
    salesHeadline: '',
    salesBullets: ['', '', ''],
    salesTestimonials: [{ name: '', text: '' }],
  });

  const [lessons, setLessons] = useState<LessonData[]>([
    { id: crypto.randomUUID(), title: '', description: '', videoFile: null, videoName: '', duration: 0, position: 0, isFree: false, resources: [] }
  ]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleVideoUpload = (lessonId: string, file: File) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === lessonId 
        ? { ...lesson, videoFile: file, videoName: file.name }
        : lesson
    ));
  };

  const handleBulkVideoUpload = (files: FileList) => {
    const newLessons: LessonData[] = Array.from(files).map((file, index) => ({
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      description: '',
      videoFile: file,
      videoName: file.name,
      duration: 0,
      position: lessons.length + index,
      isFree: index === 0,
      resources: []
    }));
    
    setLessons(prev => [...prev.filter(l => l.videoFile !== null || l.videoStoragePath || l.title), ...newLessons]);
    toast.success(`${files.length} videouri adăugate!`);
  };

  const handleZipUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      toast.error('Te rog încarcă un fișier ZIP');
      return;
    }

    // Client-side guard (prevents large uploads that crash the backend)
    const MAX_ZIP_MB = 100;
    const MAX_ZIP_BYTES = MAX_ZIP_MB * 1024 * 1024;
    if (file.size > MAX_ZIP_BYTES) {
      toast.error(`ZIP prea mare (max ${MAX_ZIP_MB}MB)`, {
        description: 'Înlătură videourile din arhivă sau încarcă-le individual.',
      });
      return;
    }

    setIsExtractingZip(true);
    setZipProgress(10);
    toast.info('Se extrage arhiva ZIP...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      // Don't send courseId yet - we'll move files after course creation

      setZipProgress(30);

      // Use fetch for multipart/form-data (supabase.functions.invoke may force JSON)
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const functionsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-zip`;

      const res = await fetch(functionsUrl, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken ?? anonKey}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `extract-zip failed (${res.status})`);
      }

      setZipProgress(80);

      if (data.extracted) {
        const { videoPlaceholders, images, thumbnail, courseInfo } = data.extracted;
        
        // Auto-fill course title and description from extracted documents
        if (courseInfo) {
          const updates: Partial<CourseFormData> = {};
          
          if (courseInfo.title && !courseData.title) {
            updates.title = courseInfo.title;
            toast.success(`Titlu detectat: "${courseInfo.title}"`, {
              description: `Extras din: ${courseInfo.extractedFrom}`
            });
          }
          
          if (courseInfo.description && !courseData.description) {
            updates.description = courseInfo.description;
            toast.success('Descriere detectată automat din ZIP');
          }
          
          if (Object.keys(updates).length > 0) {
            setCourseData(prev => ({ ...prev, ...updates }));
          }
        }
        
        // Create lessons from video placeholders (without actual video - user uploads manually)
        if (videoPlaceholders && videoPlaceholders.length > 0) {
          const newLessons: LessonData[] = videoPlaceholders.map((video: { name: string; estimatedSize: number }, index: number) => ({
            id: crypto.randomUUID(),
            title: video.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            description: '',
            videoFile: null,
            videoName: video.name, // Keep original name for reference
            videoStoragePath: undefined, // No path yet - user will upload manually
            duration: Math.max(5, Math.round(video.estimatedSize / 1000000)), // Rough estimate
            position: index,
            isFree: index === 0,
            resources: []
          }));
          
          setLessons(newLessons);
          toast.success(`${videoPlaceholders.length} lecții create din ZIP!`, {
            description: 'Încarcă videourile manual pentru fiecare lecție.'
          });
        }

        // Set thumbnail if found
        if (thumbnail) {
          setCourseData(prev => ({
            ...prev,
            thumbnailPreview: thumbnail
          }));
          toast.success('Thumbnail detectat din ZIP');
        }
      }

      setZipProgress(100);
    } catch (error) {
      console.error('ZIP extraction error:', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      const isWorkerLimit = msg.includes('WORKER_LIMIT') || msg.includes('546') || msg.includes('compute resources');
      const isTooLarge = msg.includes('413') || msg.toLowerCase().includes('too large');

      if (isWorkerLimit || isTooLarge) {
        toast.error('ZIP prea mare pentru procesare pe server', {
          description: 'Încearcă un ZIP mai mic (doar .txt/.pdf + thumbnail) sau încarcă videourile individual.',
        });
      } else {
        toast.error('Eroare la extragerea ZIP-ului');
      }
    } finally {
      setIsExtractingZip(false);
      setZipProgress(0);
    }
  };

  const addLesson = () => {
    setLessons(prev => [...prev, {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      videoFile: null,
      videoName: '',
      duration: 0,
      position: prev.length,
      isFree: false,
      resources: []
    }]);
  };

  const removeLesson = (lessonId: string) => {
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  };

  const updateLesson = (lessonId: string, updates: Partial<LessonData>) => {
    setLessons(prev => prev.map(lesson =>
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    ));
  };

  const addSalesBullet = () => {
    setCourseData(prev => ({
      ...prev,
      salesBullets: [...prev.salesBullets, '']
    }));
  };

  const updateSalesBullet = (index: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      salesBullets: prev.salesBullets.map((b, i) => i === index ? value : b)
    }));
  };

  const handleSubmit = async () => {
    if (!courseData.title) {
      toast.error('Titlul cursului este obligatoriu');
      return;
    }

    const validLessons = lessons.filter(l => l.title && (l.videoFile || l.videoStoragePath));
    if (validLessons.length === 0) {
      toast.error('Adaugă cel puțin o lecție cu video');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Create course
      const slug = generateSlug(courseData.title);
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          price: courseData.price,
          currency: courseData.currency,
          level: courseData.level,
          category: courseData.category,
          certificate: courseData.certificate,
          prerequisites: courseData.prerequisites,
          recommended_for: courseData.recommendedFor,
          slug,
          course_type: 'internal',
          is_published: false,
          lessons_count: validLessons.length,
          duration_minutes: validLessons.reduce((acc, l) => acc + l.duration, 0),
          sales_page_content: {
            headline: courseData.salesHeadline,
            bullets: courseData.salesBullets.filter(b => b),
            testimonials: courseData.salesTestimonials.filter(t => t.name && t.text)
          }
        })
        .select()
        .single();

      if (courseError) throw courseError;
      setUploadProgress(10);

      // Step 2: Upload thumbnail if exists
      if (courseData.thumbnail && course) {
        const thumbPath = `thumbnails/${course.id}/${courseData.thumbnail.name}`;
        const { error: thumbError } = await supabase.storage
          .from('vision-images')
          .upload(thumbPath, courseData.thumbnail);
        
        if (!thumbError) {
          const { data: publicUrl } = supabase.storage
            .from('vision-images')
            .getPublicUrl(thumbPath);
          
          await supabase
            .from('courses')
            .update({ thumbnail_url: publicUrl.publicUrl })
            .eq('id', course.id);
        }
      }
      setUploadProgress(20);

      // Step 3: Upload videos and create lessons
      const totalVideos = validLessons.length;
      for (let i = 0; i < validLessons.length; i++) {
        const lesson = validLessons[i];
        let videoPath = lesson.videoStoragePath || '';
        
        // If lesson has a local file (not from ZIP), upload it
        if (lesson.videoFile && course) {
          videoPath = `${course.id}/${lesson.position}-${lesson.videoFile.name}`;
          const { error: videoError } = await supabase.storage
            .from('course-videos')
            .upload(videoPath, lesson.videoFile);

          if (videoError) {
            console.error('Video upload error:', videoError);
            toast.error(`Eroare la upload video: ${lesson.title}`);
            continue;
          }
        } else if (lesson.videoStoragePath && course) {
          // Video already uploaded from ZIP - move it to the correct course folder
          const newPath = `${course.id}/${lesson.position}-${lesson.videoName}`;
          const { error: moveError } = await supabase.storage
            .from('course-videos')
            .move(lesson.videoStoragePath, newPath);
          
          if (!moveError) {
            videoPath = newPath;
          } else {
            console.error('Video move error:', moveError);
            // Keep original path if move fails
            videoPath = lesson.videoStoragePath;
          }
        }

        // Create lesson record
        if (course && videoPath) {
          const { error: lessonError } = await supabase
            .from('course_lessons')
            .insert({
              course_id: course.id,
              title: lesson.title,
              description: lesson.description,
              video_storage_path: videoPath,
              duration_minutes: lesson.duration || 5,
              position: lesson.position,
              is_free: lesson.isFree,
              resources: lesson.resources.map(r => ({ name: r.name }))
            });

          if (lessonError) {
            console.error('Lesson create error:', lessonError);
          }
        }

        setUploadProgress(20 + ((i + 1) / totalVideos) * 70);
      }

      // Step 4: Create Stripe product and price
      try {
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-course-price', {
          body: {
            courseId: course?.id,
            title: courseData.title,
            description: courseData.description,
            price: courseData.price * 100, // Convert to cents
            currency: courseData.currency.toLowerCase()
          }
        });

        if (stripeError) {
          console.error('Stripe error:', stripeError);
          toast.warning('Cursul creat, dar prețul Stripe trebuie configurat manual');
        } else if (stripeData && course) {
          await supabase
            .from('courses')
            .update({
              stripe_product_id: stripeData.productId,
              stripe_price_id: stripeData.priceId
            })
            .eq('id', course.id);
        }
      } catch (stripeErr) {
        console.error('Stripe integration error:', stripeErr);
      }

      setUploadProgress(100);
      toast.success('Curs creat cu succes!');
      
      setTimeout(() => {
        navigate('/admin/courses');
      }, 1500);

    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Eroare la crearea cursului');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* ZIP Upload Banner - Start rapid */}
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-col items-center text-center">
            {isExtractingZip ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                <p className="font-medium">Se extrage arhiva ZIP...</p>
                <Progress value={zipProgress} className="w-64 mt-3" />
              </>
            ) : (
              <>
                <Archive className="h-10 w-10 text-primary mb-3" />
                <h4 className="font-semibold text-lg">Start rapid cu ZIP</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Încarcă un ZIP pentru a extrage automat titlul, descrierea, thumbnail-ul și videourile.
                </p>
                <label>
                  <Button variant="default" size="lg" asChild>
                    <span>
                      <FolderOpen className="h-5 w-5 mr-2" />
                      Selectează Arhivă ZIP
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".zip,application/zip"
                    onChange={(e) => e.target.files?.[0] && handleZipUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Separator vizual */}
      <div className="flex items-center gap-4">
        <div className="flex-1 border-t" />
        <span className="text-sm text-muted-foreground">sau completează manual</span>
        <div className="flex-1 border-t" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titlu Curs *</Label>
            <Input
              id="title"
              value={courseData.title}
              onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Mastering Social Media Marketing"
            />
          </div>

          <div>
            <Label htmlFor="description">Descriere</Label>
            <Textarea
              id="description"
              value={courseData.description}
              onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descriere detaliată a cursului..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preț</Label>
              <Select
                value={courseData.price.toString()}
                onValueChange={(v) => setCourseData(prev => ({ ...prev, price: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Nivel</Label>
              <Select
                value={courseData.level}
                onValueChange={(v) => setCourseData(prev => ({ ...prev, level: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="category">Categorie</Label>
            <Select
              value={courseData.category}
              onValueChange={(v) => setCourseData(prev => ({ ...prev, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="certification">Certificare</SelectItem>
                <SelectItem value="freelancing">Freelancing</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Thumbnail</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
              {courseData.thumbnailPreview ? (
                <div className="relative">
                  <img 
                    src={courseData.thumbnailPreview} 
                    alt="Preview" 
                    className="max-h-40 mx-auto rounded"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0"
                    onClick={() => setCourseData(prev => ({ ...prev, thumbnail: null, thumbnailPreview: '' }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Click pentru upload</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="prerequisites">Cerințe Preliminare</Label>
            <Textarea
              id="prerequisites"
              value={courseData.prerequisites}
              onChange={(e) => setCourseData(prev => ({ ...prev, prerequisites: e.target.value }))}
              placeholder="Ce ar trebui să știe participanții..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="recommendedFor">Recomandat Pentru</Label>
            <Textarea
              id="recommendedFor"
              value={courseData.recommendedFor}
              onChange={(e) => setCourseData(prev => ({ ...prev, recommendedFor: e.target.value }))}
              placeholder="Freelanceri, antreprenori, marketeri..."
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const hasLessonsFromZip = lessons.some(l => l.videoStoragePath && !l.videoFile);
  
  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Banner simplificat pentru adăugare videouri din ZIP (doar dacă nu s-a extras deja) */}
      {!hasLessonsFromZip && lessons.length <= 1 && !lessons[0]?.videoStoragePath && !lessons[0]?.videoFile && (
        <Card className="border-dashed border border-muted-foreground/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Ai un ZIP cu videouri?</p>
                  <p className="text-xs text-muted-foreground">Extrage automat toate lecțiile</p>
                </div>
              </div>
              <label>
                <Button variant="outline" size="sm" asChild>
                  <span>Încarcă ZIP</span>
                </Button>
                <input
                  type="file"
                  accept=".zip,application/zip"
                  onChange={(e) => e.target.files?.[0] && handleZipUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Module / Lecții</h3>
          <p className="text-sm text-muted-foreground">
            Adaugă lecțiile cursului sau încarcă un ZIP.
          </p>
        </div>
        <div className="flex gap-2">
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload Bulk
              </span>
            </Button>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={(e) => e.target.files && handleBulkVideoUpload(e.target.files)}
              className="hidden"
            />
          </label>
          <Button onClick={addLesson} variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Adaugă Lecție
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <Card key={lesson.id} className="relative">
              <CardContent className="pt-4">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <Badge variant="outline" className="ml-2">
                      {index + 1}
                    </Badge>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Input
                        value={lesson.title}
                        onChange={(e) => updateLesson(lesson.id, { title: e.target.value })}
                        placeholder="Titlu lecție"
                      />
                      <Textarea
                        value={lesson.description}
                        onChange={(e) => updateLesson(lesson.id, { description: e.target.value })}
                        placeholder="Descriere scurtă..."
                        rows={2}
                      />
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={lesson.isFree}
                            onCheckedChange={(checked) => updateLesson(lesson.id, { isFree: checked })}
                          />
                          <Label className="text-sm">Preview Gratuit</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Durată:</Label>
                          <Input
                            type="number"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(lesson.id, { duration: parseInt(e.target.value) || 0 })}
                            className="w-20"
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground">min</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center h-full flex flex-col justify-center">
                        {lesson.videoFile || lesson.videoStoragePath ? (
                          <div className="flex items-center justify-center gap-2">
                            <Video className="h-5 w-5 text-green-500" />
                            <span className="text-sm truncate max-w-[200px]">{lesson.videoName}</span>
                            {lesson.videoFile && (
                              <Badge variant="secondary">
                                {(lesson.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                              </Badge>
                            )}
                            {lesson.videoStoragePath && !lesson.videoFile && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Din ZIP
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <Video className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">Upload video</p>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => e.target.files?.[0] && handleVideoUpload(lesson.id, e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLesson(lesson.id)}
                    disabled={lessons.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Pagină de Vânzare</h3>
        <p className="text-sm text-muted-foreground">
          Conținut pentru pagina de prezentare a cursului
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="salesHeadline">Headline Principal</Label>
          <Input
            id="salesHeadline"
            value={courseData.salesHeadline}
            onChange={(e) => setCourseData(prev => ({ ...prev, salesHeadline: e.target.value }))}
            placeholder="Transform Your Career with Expert Marketing Skills"
          />
        </div>

        <div>
          <Label>Beneficii (Bullet Points)</Label>
          <div className="space-y-2 mt-2">
            {courseData.salesBullets.map((bullet, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-primary mt-2">✓</span>
                <Input
                  value={bullet}
                  onChange={(e) => updateSalesBullet(index, e.target.value)}
                  placeholder={`Beneficiu ${index + 1}...`}
                />
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addSalesBullet}>
              <Plus className="h-4 w-4 mr-2" />
              Adaugă Beneficiu
            </Button>
          </div>
        </div>

        <div>
          <Label>Testimoniale</Label>
          <div className="space-y-4 mt-2">
            {courseData.salesTestimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-4 space-y-2">
                  <Input
                    value={testimonial.name}
                    onChange={(e) => {
                      const newTestimonials = [...courseData.salesTestimonials];
                      newTestimonials[index].name = e.target.value;
                      setCourseData(prev => ({ ...prev, salesTestimonials: newTestimonials }));
                    }}
                    placeholder="Nume persoană"
                  />
                  <Textarea
                    value={testimonial.text}
                    onChange={(e) => {
                      const newTestimonials = [...courseData.salesTestimonials];
                      newTestimonials[index].text = e.target.value;
                      setCourseData(prev => ({ ...prev, salesTestimonials: newTestimonials }));
                    }}
                    placeholder="Ce spune despre curs..."
                    rows={2}
                  />
                </CardContent>
              </Card>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCourseData(prev => ({
                ...prev,
                salesTestimonials: [...prev.salesTestimonials, { name: '', text: '' }]
              }))}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adaugă Testimonial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Review Final</h3>
        <p className="text-sm text-muted-foreground">
          Verifică datele înainte de publicare
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informații Curs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Titlu:</span>
              <span className="font-medium">{courseData.title || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preț:</span>
              <span className="font-medium">£{courseData.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nivel:</span>
              <Badge variant="secondary">{courseData.level}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Categorie:</span>
              <Badge variant="outline">{courseData.category}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lecții ({lessons.filter(l => l.videoFile).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-1 text-sm">
                {lessons.filter(l => l.videoFile).map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="truncate">{lesson.title || `Lecția ${index + 1}`}</span>
                    {lesson.isFree && <Badge variant="secondary" className="text-xs">Free</Badge>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {isSubmitting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Upload în progres...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Cursuri
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Import Curs PLR</CardTitle>
            <CardDescription>
              Adaugă rapid un curs nou cu toate modulele și videourile
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      step === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step < currentStep ? <Check className="h-5 w-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Labels */}
            <div className="flex justify-center gap-8 mb-8 text-sm">
              <span className={currentStep === 1 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Info Curs
              </span>
              <span className={currentStep === 2 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Lecții & Video
              </span>
              <span className={currentStep === 3 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Sales Page
              </span>
              <span className={currentStep === 4 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                Review
              </span>
            </div>

            {/* Step Content */}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi
              </Button>

              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}>
                  Continuă
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Se uploadează...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Creează Cursul
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
