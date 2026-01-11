import { useState } from 'react';
import { Eye, RefreshCw, Plus, Sparkles, ImageOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import { useLifeAreas, useLifeGoals, useUpdateLifeGoal } from '@/hooks/useLifeOS';
import { LifeAreaKey, LifeGoal, GoalType } from '@/types/lifeOS';
import { AreaIcon } from './AreaIcon';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface VisionCardProps {
  goal: LifeGoal;
  areaName: string;
  onRegenerate: (goal: LifeGoal) => void;
  isGenerating: boolean;
}

function VisionCard({ goal, areaName, onRegenerate, isGenerating }: VisionCardProps) {
  const { t } = useI18n();
  
  return (
    <Card className="overflow-hidden group relative cursor-pointer hover:shadow-lg transition-all">
      <div className="relative aspect-[4/3] bg-muted">
        {goal.vision_image_url ? (
          <img
            src={goal.vision_image_url}
            alt={goal.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="h-8 w-8 animate-pulse text-primary" />
                <span className="text-sm text-muted-foreground">
                  {t.lifeOS?.visionBoard?.generating || 'Generating...'}
                </span>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onRegenerate(goal)}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <ImageOff className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm">
                  {t.lifeOS?.visionBoard?.generateImage || 'Generate Image'}
                </span>
              </Button>
            )}
          </div>
        )}
        
        {/* Overlay with area name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AreaIcon areaKey={goal.area_key} className="h-5 w-5 text-white" />
            <span className="text-white font-semibold text-lg">{areaName}</span>
          </div>
          <p className="text-white/80 text-sm line-clamp-2">{goal.title}</p>
        </div>
        
        {/* Regenerate button on hover */}
        {goal.vision_image_url && !isGenerating && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate(goal);
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

interface GoalCardProps {
  goal: LifeGoal;
  areaName: string;
  areaColor: string;
}

function GoalCard({ goal, areaName, areaColor }: GoalCardProps) {
  const { t } = useI18n();
  
  // Parse goals list from description or title
  const goalsList = goal.description?.split('\n').filter(Boolean) || [goal.title];
  const displayGoals = goalsList.slice(0, 3);
  const moreCount = goalsList.length - 3;
  
  return (
    <Card className={cn("border-l-4")} style={{ borderLeftColor: areaColor }}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AreaIcon areaKey={goal.area_key} className="h-4 w-4" />
            <span className="font-medium" style={{ color: areaColor }}>
              {areaName}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {goal.progress || 0}%
          </Badge>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {displayGoals.map((item, index) => (
            <li key={index} className="text-muted-foreground">
              {item}
            </li>
          ))}
        </ol>
        {moreCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            +{moreCount} {t.lifeOS?.visionBoard?.more || 'more'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function VisionBoard() {
  const { t, locale } = useI18n();
  const { data: areas } = useLifeAreas();
  const { data: annualGoals, refetch: refetchAnnual } = useLifeGoals('annual', new Date().getFullYear().toString());
  const { data: quarterlyGoals } = useLifeGoals('quarterly');
  const { data: monthlyGoals } = useLifeGoals('monthly', format(new Date(), 'yyyy-MM'));
  const updateGoal = useUpdateLifeGoal();
  
  const [generatingAreas, setGeneratingAreas] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<GoalType | 'annual'>('monthly');

  const handleRegenerateImage = async (goal: LifeGoal) => {
    const areaName = t.lifeOS?.areas?.[goal.area_key] || goal.area_key;
    setGeneratingAreas(prev => new Set([...prev, goal.id]));
    
    try {
      const { data, error } = await supabase.functions.invoke('vision-image-generator', {
        body: {
          area_key: goal.area_key,
          area_name: areaName,
          annual_goal: goal.title,
          description: goal.description,
          locale,
        },
      });

      if (error) throw error;
      if (!data?.image_url) throw new Error('No image generated');

      // Update the goal with the new image URL
      await updateGoal.mutateAsync({
        id: goal.id,
        updates: { vision_image_url: data.image_url },
      });

      toast.success(t.lifeOS?.visionBoard?.imageGenerated || 'Vision image generated!');
      refetchAnnual();
    } catch (error) {
      console.error('Error generating vision image:', error);
      toast.error(t.lifeOS?.visionBoard?.imageError || 'Failed to generate image');
    } finally {
      setGeneratingAreas(prev => {
        const next = new Set(prev);
        next.delete(goal.id);
        return next;
      });
    }
  };

  const handleRegenerateAll = async () => {
    if (!annualGoals?.length) return;
    
    for (const goal of annualGoals) {
      await handleRegenerateImage(goal);
    }
  };

  const getAreaColor = (areaKey: LifeAreaKey): string => {
    const colors: Record<LifeAreaKey, string> = {
      business: 'hsl(262, 83%, 58%)',
      body: 'hsl(346, 77%, 50%)',
      mind: 'hsl(262, 83%, 58%)',
      relationships: 'hsl(142, 71%, 45%)',
      spirituality: 'hsl(192, 91%, 36%)',
      finance: 'hsl(142, 71%, 45%)',
      fun: 'hsl(330, 81%, 60%)',
    };
    return colors[areaKey] || 'hsl(var(--primary))';
  };

  const getGoalsForTab = () => {
    switch (activeTab) {
      case 'annual':
        return annualGoals;
      case 'quarterly':
        return quarterlyGoals;
      case 'monthly':
      default:
        return monthlyGoals;
    }
  };

  const currentGoals = getGoalsForTab();
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: locale === 'ro' ? undefined : undefined });

  if (!areas?.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Vision Board Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>{t.lifeOS?.visionBoard?.title || 'Vision Board'}</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRegenerateAll}
              disabled={generatingAreas.size > 0}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <RefreshCw className={cn("h-4 w-4 mr-2", generatingAreas.size > 0 && "animate-spin")} />
              {t.lifeOS?.visionBoard?.regenerateAll || 'Regenerate All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {annualGoals?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {annualGoals.map((goal) => (
                <VisionCard
                  key={goal.id}
                  goal={goal}
                  areaName={t.lifeOS?.areas?.[goal.area_key] || goal.area_key}
                  onRegenerate={handleRegenerateImage}
                  isGenerating={generatingAreas.has(goal.id)}
                />
              ))}
              {/* Add new area card */}
              <Card 
                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors border-dashed"
                onClick={() => {/* Navigate to add area */}}
              >
                <div className="aspect-[4/3] flex items-center justify-center bg-muted/50">
                  <div className="text-center">
                    <Plus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {t.lifeOS?.visionBoard?.addArea || 'Add Area'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t.lifeOS?.noAreasDescription || 'Set up your annual vision to see the board'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GoalType)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {t.lifeOS?.timeframes?.monthly || 'Monthly'}
              </TabsTrigger>
              <TabsTrigger value="quarterly">
                {t.lifeOS?.visionBoard?.ninetyDays || '90 Days'}
              </TabsTrigger>
              <TabsTrigger value="annual">
                {t.lifeOS?.visionBoard?.annual || 'Annual'}
              </TabsTrigger>
            </TabsList>

            <div className="mb-4">
              <h3 className="text-lg font-medium">
                {activeTab === 'monthly' && `${t.lifeOS?.timeframes?.monthly || 'Monthly Goals'} • ${format(new Date(), 'MMMM yyyy')}`}
                {activeTab === 'quarterly' && `${t.lifeOS?.timeframes?.quarterly || 'Quarterly Milestones'}`}
                {activeTab === 'annual' && `${t.lifeOS?.timeframes?.annual || 'Annual Vision'} ${new Date().getFullYear()}`}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentGoals?.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  areaName={t.lifeOS?.areas?.[goal.area_key] || goal.area_key}
                  areaColor={getAreaColor(goal.area_key)}
                />
              ))}
              {!currentGoals?.length && (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  {t.lifeOS?.noAreasDescription || 'No goals set for this period'}
                </p>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}