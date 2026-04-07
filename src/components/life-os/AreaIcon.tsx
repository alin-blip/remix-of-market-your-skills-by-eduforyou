import { 
  Briefcase, 
  Heart, 
  Brain, 
  Users, 
  Sparkles, 
  Wallet, 
  Gamepad2,
  LucideIcon,
} from 'lucide-react';
import { LifeAreaKey, LIFE_AREAS } from '@/types/lifeOS';
import { cn } from '@/lib/utils';

const AREA_ICONS: Record<LifeAreaKey, LucideIcon> = {
  business: Briefcase,
  body: Heart,
  mind: Brain,
  relationships: Users,
  spirituality: Sparkles,
  finance: Wallet,
  fun: Gamepad2,
};

interface AreaIconProps {
  areaKey: LifeAreaKey | string;
  className?: string;
  showColor?: boolean;
}

export function AreaIcon({ areaKey, className, showColor = true }: AreaIconProps) {
  const Icon = AREA_ICONS[areaKey as LifeAreaKey] || Sparkles;
  const areaConfig = LIFE_AREAS[areaKey as LifeAreaKey];
  
  return (
    <Icon 
      className={cn(className)} 
      style={showColor && areaConfig?.color ? { color: areaConfig.color } : undefined}
    />
  );
}
