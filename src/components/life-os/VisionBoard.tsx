import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, RefreshCw, Plus, Sparkles, ImageOff, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useLifeAreas, useLifeGoals } from '@/hooks/useLifeOS';
import { LifeAreaKey, LifeGoal, GoalType } from '@/types/lifeOS';
import { AreaIcon } from './AreaIcon';
import { GoalEditDialog } from './GoalEditDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface VisionCardProps {
  goal: LifeGoal;
  areaName: string;
  onRegenerate: (goal: LifeGoal) => void;
  onEdit: (goal: LifeGoal) => void;
  isGenerating: boolean;
}

interface SortableVisionCardProps extends VisionCardProps {
  id: string;
}

function SortableVisionCard({ id, goal, areaName, onRegenerate, onEdit, isGenerating }: SortableVisionCardProps) {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card 
        className="overflow-hidden group relative cursor-pointer hover:shadow-lg transition-all"
        onClick={() => onEdit(goal)}
      >
        {/* Header with category and goal above image */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-1">
            <AreaIcon areaKey={goal.area_key} className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{areaName}</span>
            {goal.progress !== null && goal.progress !== undefined && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {goal.progress}%
              </Badge>
            )}
          </div>
          <p className="text-sm text-foreground line-clamp-2">{goal.title}</p>
        </div>

        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute top-2 right-2 z-10 p-1 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

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
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate(goal);
                  }}
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
          
          {/* Regenerate button on hover */}
          {goal.vision_image_url && !isGenerating && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
    </div>
  );
}

// Simple VisionCard for compact mode (no drag-drop)
function VisionCard({ goal, areaName, onRegenerate, onEdit, isGenerating }: VisionCardProps) {
  const { t } = useI18n();
  
  return (
    <Card 
      className="overflow-hidden group relative cursor-pointer hover:shadow-lg transition-all"
      onClick={() => onEdit(goal)}
    >
      {/* Header with category and goal above image */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-1">
          <AreaIcon areaKey={goal.area_key} className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{areaName}</span>
          {goal.progress !== null && goal.progress !== undefined && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {goal.progress}%
            </Badge>
          )}
        </div>
        <p className="text-sm text-foreground line-clamp-2">{goal.title}</p>
      </div>

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
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate(goal);
                }}
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
        
        {goal.vision_image_url && !isGenerating && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
  onEdit: (goal: LifeGoal) => void;
}

function GoalCard({ goal, areaName, areaColor, onEdit }: GoalCardProps) {
  const { t } = useI18n();
  
  // Parse goals list from description or title
  const goalsList = goal.description?.split('\n').filter(Boolean) || [goal.title];
  const displayGoals = goalsList.slice(0, 3);
  const moreCount = goalsList.length - 3;
  
  return (
    <Card 
      className={cn("border-l-4 cursor-pointer hover:shadow-md transition-all")} 
      style={{ borderLeftColor: areaColor }}
      onClick={() => onEdit(goal)}
    >
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

interface CollapsibleGoalsSectionProps {
  title: string;
  goals: LifeGoal[];
  getAreaName: (key: LifeAreaKey) => string;
  getAreaColor: (key: LifeAreaKey) => string;
  onEdit: (goal: LifeGoal) => void;
  emptyMessage: string;
}

function CollapsibleGoalsSection({ 
  title, 
  goals, 
  getAreaName, 
  getAreaColor, 
  onEdit, 
  emptyMessage 
}: CollapsibleGoalsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate progress
  const totalProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0);
  const averageProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {goals.length}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Progress value={averageProgress} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{averageProgress}%</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  areaName={getAreaName(goal.area_key)}
                  areaColor={getAreaColor(goal.area_key)}
                  onEdit={onEdit}
                />
              ))}
              {!goals.length && (
                <p className="col-span-full text-center text-muted-foreground py-4">
                  {emptyMessage}
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface VisionBoardProps {
  compact?: boolean;
}

export function VisionBoard({ compact = false }: VisionBoardProps) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: areas } = useLifeAreas();
  const { data: annualGoals, refetch: refetchAnnual } = useLifeGoals('annual', new Date().getFullYear().toString());
  const { data: quarterlyGoals } = useLifeGoals('quarterly');
  const { data: monthlyGoals } = useLifeGoals('monthly', format(new Date(), 'yyyy-MM'));
  
  const [generatingAreas, setGeneratingAreas] = useState<Set<string>>(new Set());
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [orderedGoals, setOrderedGoals] = useState<LifeGoal[]>([]);

  // Get unique areas and their first annual goal (one card per category)
  const uniqueAreaGoals = annualGoals?.reduce((acc, goal) => {
    if (!acc.find(g => g.area_key === goal.area_key)) {
      acc.push(goal);
    }
    return acc;
  }, [] as LifeGoal[]) || [];

  // Sync orderedGoals with uniqueAreaGoals
  useState(() => {
    if (uniqueAreaGoals.length > 0 && orderedGoals.length === 0) {
      setOrderedGoals(uniqueAreaGoals);
    }
  });

  // Update ordered goals when uniqueAreaGoals changes
  if (uniqueAreaGoals.length !== orderedGoals.length || 
      uniqueAreaGoals.some((g, i) => orderedGoals[i]?.id !== g.id)) {
    if (uniqueAreaGoals.length > 0) {
      setOrderedGoals(uniqueAreaGoals);
    }
  }

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedGoals((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRegenerateImage = async (goal: LifeGoal) => {
    if (!user) return;
    
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
          user_id: user.id,
          goal_id: goal.id,
        },
      });

      if (error) throw error;
      if (!data?.image_url) throw new Error('No image generated');

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

  const handleEditGoal = (goal: LifeGoal) => {
    setEditingGoal(goal);
    setEditDialogOpen(true);
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

  if (!areas?.length) {
    return null;
  }

  // Compact version for main Dashboard
  if (compact) {
    return (
      <>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>{t.lifeOS?.visionBoard?.title || 'Vision Board'}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {uniqueAreaGoals.length ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {uniqueAreaGoals.slice(0, 4).map((goal) => (
                  <VisionCard
                    key={goal.id}
                    goal={goal}
                    areaName={t.lifeOS?.areas?.[goal.area_key] || goal.area_key}
                    onRegenerate={handleRegenerateImage}
                    onEdit={handleEditGoal}
                    isGenerating={generatingAreas.has(goal.id)}
                  />
                ))}
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

        <GoalEditDialog
          goal={editingGoal}
          areaName={editingGoal ? (t.lifeOS?.areas?.[editingGoal.area_key] || editingGoal.area_key) : ''}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSaved={refetchAnnual}
        />
      </>
    );
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
          {orderedGoals.length ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedGoals.map(g => g.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orderedGoals.map((goal) => (
                    <SortableVisionCard
                      key={goal.id}
                      id={goal.id}
                      goal={goal}
                      areaName={t.lifeOS?.areas?.[goal.area_key] || goal.area_key}
                      onRegenerate={handleRegenerateImage}
                      onEdit={handleEditGoal}
                      isGenerating={generatingAreas.has(goal.id)}
                    />
                  ))}
                  {/* Add new area card */}
                  <Card 
                    className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors border-dashed"
                    onClick={() => navigate('/life-os/setup')}
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
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t.lifeOS?.noAreasDescription || 'Set up your annual vision to see the board'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collapsible Goals Sections */}
      <div className="space-y-3">
        {/* Monthly Goals */}
        <CollapsibleGoalsSection
          title={`${t.lifeOS?.timeframes?.monthly || 'Monthly Goals'} • ${format(new Date(), 'MMMM yyyy')}`}
          goals={monthlyGoals || []}
          getAreaName={(key) => t.lifeOS?.areas?.[key] || key}
          getAreaColor={getAreaColor}
          onEdit={handleEditGoal}
          emptyMessage={t.lifeOS?.noAreasDescription || 'No goals set for this period'}
        />

        {/* 90 Days / Quarterly Goals */}
        <CollapsibleGoalsSection
          title={t.lifeOS?.visionBoard?.ninetyDays || '90 Days'}
          goals={quarterlyGoals || []}
          getAreaName={(key) => t.lifeOS?.areas?.[key] || key}
          getAreaColor={getAreaColor}
          onEdit={handleEditGoal}
          emptyMessage={t.lifeOS?.noAreasDescription || 'No goals set for this period'}
        />

        {/* Annual Goals */}
        <CollapsibleGoalsSection
          title={`${t.lifeOS?.visionBoard?.annual || 'Annual'} ${new Date().getFullYear()}`}
          goals={annualGoals || []}
          getAreaName={(key) => t.lifeOS?.areas?.[key] || key}
          getAreaColor={getAreaColor}
          onEdit={handleEditGoal}
          emptyMessage={t.lifeOS?.noAreasDescription || 'No goals set for this period'}
        />
      </div>

      <GoalEditDialog
        goal={editingGoal}
        areaName={editingGoal ? (t.lifeOS?.areas?.[editingGoal.area_key] || editingGoal.area_key) : ''}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSaved={refetchAnnual}
      />
    </div>
  );
}
