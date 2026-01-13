import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Zap,
  Flame,
  Rocket,
  Crown,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  'trophy': Trophy,
  'medal': Medal,
  'award': Award,
  'star': Star,
  'zap': Zap,
  'flame': Flame,
  'rocket': Rocket,
  'crown': Crown,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'check-circle': CheckCircle2,
};

const colorMap: Record<string, string> = {
  'gold': 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white',
  'silver': 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800',
  'bronze': 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
  'blue': 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
  'purple': 'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
  'green': 'bg-gradient-to-br from-green-400 to-green-600 text-white',
  'yellow': 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900',
  'orange': 'bg-gradient-to-br from-orange-400 to-red-500 text-white',
  'red': 'bg-gradient-to-br from-red-400 to-red-600 text-white',
};

interface BadgesDisplayProps {
  showAll?: boolean;
  compact?: boolean;
}

export function BadgesDisplay({ showAll = false, compact = false }: BadgesDisplayProps) {
  const { userPoints, earnedBadges, allBadges, isLoading } = useGamification();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const earnedBadgeIds = earnedBadges.map(eb => eb.badge_id);
  const displayBadges = showAll ? allBadges : allBadges.filter(b => earnedBadgeIds.includes(b.id));

  // Calculate next badge progress
  const getNextBadge = (category: string) => {
    const categoryBadges = allBadges
      .filter(b => b.category === category && !earnedBadgeIds.includes(b.id))
      .sort((a, b) => a.requirement_value - b.requirement_value);
    return categoryBadges[0];
  };

  const nextLearningBadge = getNextBadge('learning');
  const nextCourseBadge = getNextBadge('courses');
  const nextQuizBadge = getNextBadge('quizzes');

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {earnedBadges.slice(0, 5).map((earned, idx) => {
          const badge = earned.badge;
          const IconComponent = iconMap[badge.icon] || Trophy;
          return (
            <motion.div
              key={earned.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${colorMap[badge.color] || colorMap.gold}`}
              title={badge.name}
            >
              <IconComponent className="h-4 w-4" />
            </motion.div>
          );
        })}
        {earnedBadges.length > 5 && (
          <Badge variant="secondary" className="text-xs">
            +{earnedBadges.length - 5}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Badge-uri
          </CardTitle>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="font-bold text-lg">{userPoints?.total_points || 0}</span>
            <span className="text-sm text-muted-foreground">puncte</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{userPoints?.lessons_completed || 0}</div>
            <div className="text-xs text-muted-foreground">Lecții</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{userPoints?.courses_completed || 0}</div>
            <div className="text-xs text-muted-foreground">Cursuri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userPoints?.quizzes_passed || 0}</div>
            <div className="text-xs text-muted-foreground">Quiz-uri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{userPoints?.current_streak || 0}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Flame className="h-3 w-3" /> Serie
            </div>
          </div>
        </div>

        {/* Next badges progress */}
        {(nextLearningBadge || nextCourseBadge || nextQuizBadge) && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-muted-foreground">Următoarele badge-uri</h4>
            
            {nextLearningBadge && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{nextLearningBadge.name}</span>
                  <span className="text-muted-foreground">
                    {userPoints?.lessons_completed || 0} / {nextLearningBadge.requirement_value}
                  </span>
                </div>
                <Progress 
                  value={((userPoints?.lessons_completed || 0) / nextLearningBadge.requirement_value) * 100} 
                  className="h-2" 
                />
              </div>
            )}
            
            {nextCourseBadge && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{nextCourseBadge.name}</span>
                  <span className="text-muted-foreground">
                    {userPoints?.courses_completed || 0} / {nextCourseBadge.requirement_value}
                  </span>
                </div>
                <Progress 
                  value={((userPoints?.courses_completed || 0) / nextCourseBadge.requirement_value) * 100} 
                  className="h-2" 
                />
              </div>
            )}
          </div>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {(showAll ? allBadges : displayBadges).map((badge, idx) => {
            const IconComponent = iconMap[badge.icon] || Trophy;
            const isEarned = earnedBadgeIds.includes(badge.id);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative"
              >
                <div 
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                    isEarned 
                      ? colorMap[badge.color] || colorMap.gold
                      : 'bg-muted/50 text-muted-foreground/40'
                  } ${isEarned ? 'shadow-lg' : ''}`}
                >
                  <IconComponent className={`h-6 w-6 ${isEarned ? '' : 'opacity-40'}`} />
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-muted-foreground">{badge.description}</div>
                    {isEarned && (
                      <div className="text-green-500 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Obținut
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {displayBadges.length === 0 && !showAll && (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nu ai încă niciun badge</p>
            <p className="text-sm">Completează lecții și cursuri pentru a câștiga badge-uri!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
