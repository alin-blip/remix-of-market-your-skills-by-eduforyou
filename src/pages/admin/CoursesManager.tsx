import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Users,
  Star,
  Crown
} from "lucide-react";
import { LessonManagerDialog } from "@/components/admin/LessonManagerDialog";
import { AdminCourseDialog } from "@/components/admin/AdminCourseDialog";

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
  created_at: string | null;
}

export default function CoursesManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("internal");

  // Fetch courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["admin-all-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
    enabled: isAdmin,
  });

  // Fetch course stats
  const { data: courseStats = {} } = useQuery({
    queryKey: ["admin-course-stats"],
    queryFn: async () => {
      const { data: progress } = await supabase
        .from("user_course_progress")
        .select("course_id, user_id");
      
      const { data: reviews } = await supabase
        .from("course_reviews")
        .select("course_id, rating");

      const stats: Record<string, { students: number; avgRating: number }> = {};
      
      if (progress) {
        const studentsByCourse: Record<string, Set<string>> = {};
        progress.forEach(p => {
          if (!studentsByCourse[p.course_id]) {
            studentsByCourse[p.course_id] = new Set();
          }
          studentsByCourse[p.course_id].add(p.user_id);
        });
        
        Object.entries(studentsByCourse).forEach(([courseId, students]) => {
          stats[courseId] = { students: students.size, avgRating: 0 };
        });
      }

      if (reviews) {
        const reviewsByCourse: Record<string, number[]> = {};
        reviews.forEach(r => {
          if (!reviewsByCourse[r.course_id]) {
            reviewsByCourse[r.course_id] = [];
          }
          reviewsByCourse[r.course_id].push(r.rating);
        });

        Object.entries(reviewsByCourse).forEach(([courseId, ratings]) => {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          if (!stats[courseId]) {
            stats[courseId] = { students: 0, avgRating: avg };
          } else {
            stats[courseId].avgRating = avg;
          }
        });
      }

      return stats;
    },
    enabled: isAdmin,
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from("courses")
        .update({ is_published: isPublished })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });
      toast.success("Starea cursului a fost actualizată");
    },
    onError: () => {
      toast.error("Eroare la actualizarea cursului");
    },
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });
      toast.success("Cursul a fost șters");
    },
    onError: () => {
      toast.error("Eroare la ștergerea cursului");
    },
  });

  if (adminLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive">Acces Interzis</h2>
          <p className="text-muted-foreground mt-2">Nu ai permisiuni de administrator.</p>
        </div>
      </MainLayout>
    );
  }

  const internalCourses = courses.filter(c => c.course_type !== "external");
  const externalCourses = courses.filter(c => c.course_type === "external");

  const filterCourses = (courseList: Course[]) => {
    if (!searchQuery) return courseList;
    const query = searchQuery.toLowerCase();
    return courseList.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.provider?.toLowerCase().includes(query)
    );
  };

  const CourseTable = ({ courses: courseList }: { courses: Course[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Curs</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Studenți</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Preț</TableHead>
          <TableHead>Publicat</TableHead>
          <TableHead className="text-right">Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courseList.map((course) => {
          const stats = courseStats[course.id] || { students: 0, avgRating: 0 };
          return (
            <TableRow key={course.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {course.course_type === "external" ? (
                      <ExternalLink className="h-4 w-4 text-primary" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {course.title}
                      {course.requires_pro && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {course.provider || "Internal"} • {course.lessons_count || 0} lecții
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {course.level}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {stats.students}
                </div>
              </TableCell>
              <TableCell>
                {stats.avgRating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {stats.avgRating.toFixed(1)}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {course.price > 0 ? `€${course.price}` : "Gratuit"}
              </TableCell>
              <TableCell>
                <Switch
                  checked={course.is_published || false}
                  onCheckedChange={(checked) =>
                    togglePublishMutation.mutate({ id: course.id, isPublished: checked })
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editează
                    </DropdownMenuItem>
                    {course.course_type !== "external" && (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsLessonDialogOpen(true);
                        }}
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Gestionează Lecții
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Vizualizează
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        if (confirm("Sigur vrei să ștergi acest curs?")) {
                          deleteMutation.mutate(course.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Șterge
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gestionare Cursuri</h1>
              <p className="text-muted-foreground">
                Administrează cursurile și lecțiile platformei
              </p>
            </div>
          </div>
          <Button onClick={() => {
            setSelectedCourse(null);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Adaugă Curs
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Total Cursuri</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Eye className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter(c => c.is_published).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Publicate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <GraduationCap className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{internalCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Cursuri Interne</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <ExternalLink className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{externalCourses.length}</p>
                  <p className="text-sm text-muted-foreground">Cursuri Externe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută cursuri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="internal" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Cursuri Interne ({internalCourses.length})
            </TabsTrigger>
            <TabsTrigger value="external" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Cursuri Externe ({externalCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internal">
            <Card>
              <CardHeader>
                <CardTitle>Cursuri Interne</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : filterCourses(internalCourses).length > 0 ? (
                  <CourseTable courses={filterCourses(internalCourses)} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Nu există cursuri interne
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="external">
            <Card>
              <CardHeader>
                <CardTitle>Cursuri Externe (Pro)</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : filterCourses(externalCourses).length > 0 ? (
                  <CourseTable courses={filterCourses(externalCourses)} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Nu există cursuri externe
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AdminCourseDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          course={selectedCourse}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });
            setIsDialogOpen(false);
          }}
        />

        {selectedCourse && (
          <LessonManagerDialog
            open={isLessonDialogOpen}
            onOpenChange={setIsLessonDialogOpen}
            course={{ id: selectedCourse.id, title: selectedCourse.title }}
          />
        )}
      </div>
    </MainLayout>
  );
}
