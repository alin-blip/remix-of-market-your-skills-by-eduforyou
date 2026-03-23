import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Cpu, 
  TrendingUp, 
  Code,
  ArrowRight,
  BookOpen,
  Clock,
  Lock
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  coursesCount?: number;
  totalDuration?: number;
}

interface LearningPathCardProps {
  path: LearningPath;
  index?: number;
  onClick?: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  shield: Shield,
  cpu: Cpu,
  'trending-up': TrendingUp,
  code: Code,
  book: BookOpen,
};

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  red: { 
    bg: 'bg-red-500/5', 
    border: 'border-red-500/30 hover:border-red-500/50', 
    text: 'text-red-500',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-500'
  },
  blue: { 
    bg: 'bg-blue-500/5', 
    border: 'border-blue-500/30 hover:border-blue-500/50', 
    text: 'text-blue-500',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  },
  green: { 
    bg: 'bg-green-500/5', 
    border: 'border-green-500/30 hover:border-green-500/50', 
    text: 'text-green-500',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500'
  },
  purple: { 
    bg: 'bg-purple-500/5', 
    border: 'border-purple-500/30 hover:border-purple-500/50', 
    text: 'text-purple-500',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
  },
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  if (hours >= 100) return `${hours}+ ore`;
  return `${hours}h`;
};

export function LearningPathCard({ path, index = 0, onClick }: LearningPathCardProps) {
  const { plan } = useSubscription();
  const navigate = useNavigate();
  
  const hasAccess = plan === 'pro' || plan === 'eduforyou';
  const colorStyle = colorMap[path.color] || colorMap.blue;
  const IconComponent = iconMap[path.icon] || BookOpen;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (!hasAccess) {
      navigate('/pricing');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg ${colorStyle.bg} ${colorStyle.border}`}
        onClick={handleClick}
      >
        <CardContent className="py-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`h-14 w-14 rounded-xl ${colorStyle.iconBg} flex items-center justify-center shrink-0`}>
              <IconComponent className="h-7 w-7 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{path.title}</h3>
                {!hasAccess && (
                  <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-xs gap-1">
                    <Lock className="h-3 w-3" />
                    PRO
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {path.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {path.coursesCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {path.coursesCount} cursuri
                  </span>
                )}
                {path.totalDuration !== undefined && path.totalDuration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(path.totalDuration)}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className={`h-5 w-5 shrink-0 ${colorStyle.text}`} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
