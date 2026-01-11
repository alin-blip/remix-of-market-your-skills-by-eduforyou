import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useI18n } from '@/lib/i18n';
import { useUpdateLifeGoal } from '@/hooks/useLifeOS';
import { LifeGoal } from '@/types/lifeOS';
import { AreaIcon } from './AreaIcon';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface GoalEditDialogProps {
  goal: LifeGoal | null;
  areaName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function GoalEditDialog({ goal, areaName, open, onOpenChange, onSaved }: GoalEditDialogProps) {
  const { t } = useI18n();
  const updateGoal = useUpdateLifeGoal();
  
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [progress, setProgress] = useState(goal?.progress || 0);
  const [measurableResult, setMeasurableResult] = useState(goal?.measurable_result || '');
  const [targetValue, setTargetValue] = useState(goal?.target_value || '');
  const [currentValue, setCurrentValue] = useState(goal?.current_value || '');

  // Reset form when goal changes
  useState(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setProgress(goal.progress || 0);
      setMeasurableResult(goal.measurable_result || '');
      setTargetValue(goal.target_value || '');
      setCurrentValue(goal.current_value || '');
    }
  });

  const handleSave = async () => {
    if (!goal) return;

    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        updates: {
          title,
          description,
          progress,
          measurable_result: measurableResult,
          target_value: targetValue,
          current_value: currentValue,
        },
      });

      toast.success(t.lifeOS?.goalSaved || 'Goal saved successfully!');
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error(t.lifeOS?.goalSaveError || 'Failed to save goal');
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AreaIcon areaKey={goal.area_key} className="h-5 w-5" />
            <span>{areaName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Vision Image Preview */}
          {goal.vision_image_url && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={goal.vision_image_url}
                alt={goal.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t.lifeOS?.goalTitle || 'Goal Title'}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.lifeOS?.goalTitlePlaceholder || 'What do you want to achieve?'}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.lifeOS?.goalDescription || 'Description'}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.lifeOS?.goalDescriptionPlaceholder || 'Describe your goal in detail...'}
              rows={3}
            />
          </div>

          {/* Measurable Result */}
          <div className="space-y-2">
            <Label htmlFor="measurableResult">{t.lifeOS?.measurableResult || 'Measurable Result'}</Label>
            <Input
              id="measurableResult"
              value={measurableResult}
              onChange={(e) => setMeasurableResult(e.target.value)}
              placeholder={t.lifeOS?.measurableResultPlaceholder || 'How will you measure success?'}
            />
          </div>

          {/* Target & Current Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">{t.lifeOS?.targetValue || 'Target'}</Label>
              <Input
                id="targetValue"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g., 100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentValue">{t.lifeOS?.currentValue || 'Current'}</Label>
              <Input
                id="currentValue"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="e.g., 25"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t.lifeOS?.progress || 'Progress'}</Label>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common?.cancel || 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={updateGoal.isPending}>
            {updateGoal.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t.common?.save || 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
