import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  ArrowLeft,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Star,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  GraduationCap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ro } from "date-fns/locale";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const CourseAnalytics = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [timeRange, setTimeRange] = useState("30");

  // Fetch all courses
  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all progress records
  const { data: progressData = [] } = useQuery({
    queryKey: ["admin-progress", timeRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(timeRange));
      const { data, error } = await supabase
        .from("user_course_progress")
        .select("*")
        .gte("created_at", startDate.toISOString());
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*, courses(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all purchases
  const { data: purchases = [] } = useQuery({
    queryKey: ["admin-purchases", timeRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(timeRange));
      const { data, error } = await supabase
        .from("course_purchases")
        .select("*, courses(title)")
        .gte("purchased_at", startDate.toISOString());
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch unique users with progress
  const { data: uniqueStudents = 0 } = useQuery({
    queryKey: ["admin-unique-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_course_progress")
        .select("user_id");
      if (error) throw error;
      return new Set(data.map(d => d.user_id)).size;
    },
    enabled: isAdmin,
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

  // Calculate stats
  const completedCourses = progressData.filter(p => p.progress_percent === 100).length;
  const avgProgress = progressData.length > 0
    ? progressData.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / progressData.length
    : 0;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const totalRevenue = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Progress by course chart data
  const progressByCourse = courses.map(course => {
    const courseProgress = progressData.filter(p => p.course_id === course.id);
    const avgCourseProgress = courseProgress.length > 0
      ? courseProgress.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / courseProgress.length
      : 0;
    return {
      name: course.title.length > 20 ? course.title.slice(0, 20) + "..." : course.title,
      progress: Math.round(avgCourseProgress),
      students: courseProgress.length,
    };
  });

  // Daily activity chart data
  const days = parseInt(timeRange);
  const dailyActivity = eachDayOfInterval({
    start: subDays(new Date(), days),
    end: new Date(),
  }).map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayProgress = progressData.filter(
      p => format(new Date(p.created_at || ""), "yyyy-MM-dd") === dayStr
    );
    return {
      date: format(day, "d MMM", { locale: ro }),
      activitati: dayProgress.length,
    };
  });

  // Rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} stele`,
    count: reviews.filter(r => r.rating === rating).length,
  }));

  // Course popularity pie chart
  const coursePopularity = courses.slice(0, 5).map((course, index) => ({
    name: course.title.length > 15 ? course.title.slice(0, 15) + "..." : course.title,
    value: progressData.filter(p => p.course_id === course.id).length,
    color: COLORS[index % COLORS.length],
  })).filter(c => c.value > 0);

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
              <h1 className="text-2xl font-bold">Analytics Cursuri</h1>
              <p className="text-muted-foreground">
                Vizualizează performanța și engagement-ul studenților
              </p>
            </div>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Ultimele 7 zile</SelectItem>
              <SelectItem value="30">Ultimele 30 zile</SelectItem>
              <SelectItem value="90">Ultimele 90 zile</SelectItem>
              <SelectItem value="365">Ultimul an</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueStudents}</p>
                  <p className="text-sm text-muted-foreground">Studenți Activi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Award className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedCourses}</p>
                  <p className="text-sm text-muted-foreground">Cursuri Completate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Rating Mediu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgProgress.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Progres Mediu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activitate
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Cursuri
            </TabsTrigger>
            <TabsTrigger value="ratings" className="gap-2">
              <Star className="h-4 w-4" />
              Recenzii
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Daily Activity Line Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activitate Zilnică</CardTitle>
                  <CardDescription>
                    Numărul de interacțiuni cu cursurile pe zi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="activitati"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Course Popularity Pie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popularitate Cursuri</CardTitle>
                  <CardDescription>
                    Top 5 cursuri după numărul de studenți
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {coursePopularity.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={coursePopularity}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            {coursePopularity.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPie>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Nu există date suficiente
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            {/* Progress by Course Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progres per Curs</CardTitle>
                <CardDescription>
                  Media progresului și numărul de studenți per curs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressByCourse} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={150} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => [
                          name === "progress" ? `${value}%` : value,
                          name === "progress" ? "Progres Mediu" : "Studenți",
                        ]}
                      />
                      <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Course Details Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalii Cursuri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courses.map((course) => {
                    const courseProgress = progressData.filter(p => p.course_id === course.id);
                    const avgCourseProgress = courseProgress.length > 0
                      ? courseProgress.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / courseProgress.length
                      : 0;
                    const courseReviews = reviews.filter(r => r.course_id === course.id);
                    const courseRating = courseReviews.length > 0
                      ? courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length
                      : 0;

                    return (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {courseProgress.length} studenți • {courseReviews.length} recenzii
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-lg font-bold">{avgCourseProgress.toFixed(0)}%</p>
                            <p className="text-xs text-muted-foreground">Progres</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold">{courseRating.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Rating</p>
                          </div>
                          <Badge variant={course.is_published ? "default" : "secondary"}>
                            {course.is_published ? "Publicat" : "Draft"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuție Rating-uri</CardTitle>
                  <CardDescription>
                    Numărul de recenzii per nivel de rating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingDistribution}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recenzii Recente</CardTitle>
                  <CardDescription>
                    Ultimele recenzii primite
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {reviews.slice(0, 10).map((review: any) => (
                      <div key={review.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{review.courses?.title}</p>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {review.comment}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(review.created_at), "d MMM yyyy", { locale: ro })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nu există recenzii încă
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CourseAnalytics;
