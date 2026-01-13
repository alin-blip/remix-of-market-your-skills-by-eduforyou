import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Clock, 
  Lock, 
  Award,
  Globe,
  BookOpen
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface ExternalCourse {
  id: string;
  title: string;
  description: string;
  provider: string;
  external_url: string;
  level: string;
  duration_minutes: number;
  certificate: string;
  language: string;
  tags: string[];
  recommended_for: string;
  prerequisites?: string;
  requires_pro: boolean;
}

interface ExternalCourseCardProps {
  course: ExternalCourse;
  index?: number;
}

const providerColors: Record<string, { bg: string; text: string }> = {
  'Google': { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  'Microsoft': { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
  'AWS': { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  'Coursera': { bg: 'bg-blue-600/10', text: 'text-blue-600' },
  'DeepLearning.AI': { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  'fast.ai': { bg: 'bg-pink-500/10', text: 'text-pink-500' },
  'Harvard': { bg: 'bg-red-600/10', text: 'text-red-600' },
  'freeCodeCamp': { bg: 'bg-green-600/10', text: 'text-green-600' },
  'GitHub': { bg: 'bg-gray-700/10', text: 'text-gray-700' },
  'TryHackMe': { bg: 'bg-red-500/10', text: 'text-red-500' },
  'Hack The Box': { bg: 'bg-green-500/10', text: 'text-green-500' },
  'HubSpot': { bg: 'bg-orange-400/10', text: 'text-orange-400' },
  'OpenAI': { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  'TensorFlow': { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  'Codecademy': { bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
  'MDN': { bg: 'bg-slate-600/10', text: 'text-slate-600' },
};

const levelColors: Record<string, { bg: string; text: string }> = {
  beginner: { bg: 'bg-green-500/10', text: 'text-green-500' },
  intermediate: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  advanced: { bg: 'bg-red-500/10', text: 'text-red-500' },
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  if (hours >= 100) return `${hours}+ ore`;
  if (hours === 0) return `${minutes} min`;
  return `${hours}h`;
};

export function ExternalCourseCard({ course, index = 0 }: ExternalCourseCardProps) {
  const { plan } = useSubscription();
  const navigate = useNavigate();
  
  const hasAccess = !course.requires_pro || plan === 'pro' || plan === 'founder';
  const providerStyle = providerColors[course.provider] || { bg: 'bg-primary/10', text: 'text-primary' };
  const levelStyle = levelColors[course.level] || { bg: 'bg-muted', text: 'text-muted-foreground' };

  const handleClick = () => {
    if (!hasAccess) {
      navigate('/pricing');
      return;
    }
    window.open(course.external_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-all group relative overflow-hidden">
        {/* PRO Badge */}
        {course.requires_pro && !hasAccess && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
              <Lock className="h-3 w-3" />
              PRO
            </Badge>
          </div>
        )}

        {/* Provider Header */}
        <div className={`px-4 py-3 ${providerStyle.bg} border-b`}>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`${providerStyle.text} border-current/30`}>
              {course.provider}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              {course.language}
            </div>
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col p-4">
          {/* Level & Duration */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={`${levelStyle.bg} ${levelStyle.text} border-0 text-xs capitalize`}>
              {course.level}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(course.duration_minutes)}
            </span>
            {course.certificate === 'Yes' && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-0 text-xs gap-1">
                <Award className="h-3 w-3" />
                Certificat
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-3">
            {course.description}
          </p>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {course.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs py-0 px-2">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <BookOpen className="h-3 w-3" />
              Cerințe: {course.prerequisites}
            </div>
          )}

          {/* Action Button */}
          <Button 
            className="w-full gap-2" 
            variant={hasAccess ? "secondary" : "default"}
            onClick={handleClick}
          >
            {hasAccess ? (
              <>
                <ExternalLink className="h-4 w-4" />
                Accesează Cursul
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Upgrade la Pro
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
