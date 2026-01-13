import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  Star, 
  BookOpen,
  Target,
  TrendingUp,
  Zap,
  ChevronRight,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseRecommendation {
  course_id: string;
  reason: string;
  match_score: number;
  skills_developed: string[];
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    provider: string | null;
    tags: string[];
    course_type: string;
    requires_pro: boolean;
  };
}

interface RecommendationsResponse {
  recommendations: CourseRecommendation[];
  summary: string;
}

export function CourseRecommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (!user) {
      toast.error('Trebuie să fii autentificat');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: response, error: fnError } = await supabase.functions.invoke(
        'course-recommendations',
        {}
      );

      if (fnError) {
        throw fnError;
      }

      if (response.error) {
        throw new Error(response.error);
      }

      setData(response);
      toast.success('Recomandări generate cu succes!');
    } catch (err) {
      console.error('Recommendations error:', err);
      const message = err instanceof Error ? err.message : 'Eroare la generarea recomandărilor';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (recommendation: CourseRecommendation) => {
    if (recommendation.course.course_type === 'external') {
      // For external courses, we'd need to fetch the URL
      toast.info('Deschide cursul din lista principală');
    } else {
      navigate(`/courses/${recommendation.course_id}`);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-blue-500';
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
      intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return colors[level] || colors.beginner;
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 via-background to-blue-500/5 border-purple-500/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Recomandări Personalizate</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cursuri selectate pe baza skill-urilor tale
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecommendations}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {data ? 'Regenerează' : 'Generează'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!data && !loading && !error && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Descoperă cursurile perfecte pentru tine</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              AI-ul nostru analizează skill-urile, interesele și obiectivele tale pentru a-ți recomanda cursurile cele mai relevante.
            </p>
            <Button onClick={fetchRecommendations} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generează Recomandări
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <RefreshCw className="h-5 w-5 animate-spin text-purple-500" />
              <div>
                <p className="font-medium">Analizăm profilul tău...</p>
                <p className="text-sm text-muted-foreground">
                  Căutăm cele mai potrivite cursuri pentru skill-urile tale
                </p>
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchRecommendations}>
              Încearcă din nou
            </Button>
          </div>
        )}

        {data && (
          <AnimatePresence>
            <div className="space-y-4">
              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"
              >
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                  <p className="text-sm">{data.summary}</p>
                </div>
              </motion.div>

              {/* Recommendations */}
              <div className="grid gap-3">
                {data.recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.course_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleCourseClick(rec)}
                    className="group p-4 border rounded-lg hover:border-purple-500/30 hover:bg-muted/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold truncate">{rec.course.title}</h4>
                          {rec.course.provider && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              {rec.course.provider}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {rec.reason}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getLevelBadge(rec.course.level)}>
                            {rec.course.level}
                          </Badge>
                          
                          {rec.skills_developed.slice(0, 3).map((skill) => (
                            <Badge 
                              key={skill} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${getMatchScoreColor(rec.match_score)}`}>
                            {rec.match_score}%
                          </span>
                          <TrendingUp className={`h-4 w-4 ${getMatchScoreColor(rec.match_score)}`} />
                        </div>
                        <Progress 
                          value={rec.match_score} 
                          className="w-16 h-1.5"
                        />
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {data.recommendations.length === 0 && (
                <div className="text-center py-6">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Nu am găsit recomandări. Completează-ți profilul pentru sugestii mai bune!
                  </p>
                </div>
              )}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
