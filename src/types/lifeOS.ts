export type LifeAreaKey = 'business' | 'body' | 'mind' | 'relationships' | 'spirituality' | 'finance' | 'fun';

export interface LifeArea {
  id: string;
  user_id: string;
  area_key: LifeAreaKey;
  is_active: boolean;
  position: number;
  created_at: string;
}

export type GoalType = 'annual' | 'quarterly' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface LifeGoal {
  id: string;
  user_id: string;
  area_key: LifeAreaKey;
  goal_type: GoalType;
  period: string; // '2026', 'Q1-2026', '2026-01'
  title: string;
  description?: string;
  measurable_result?: string;
  target_value?: string;
  current_value?: string;
  parent_goal_id?: string;
  status: GoalStatus;
  progress: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklySprint {
  id: string;
  user_id: string;
  week_key: string; // 'life-os-2026-W02'
  week_goal?: string;
  reflection?: string;
  energy_level?: number; // 1-10
  wins: string[];
  lessons: string[];
  planned_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export type TaskType = 'big' | 'small';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface DailyTask {
  id: string;
  user_id: string;
  sprint_id?: string;
  area_key?: LifeAreaKey;
  day_date: string; // 'YYYY-MM-DD'
  day_of_week: DayOfWeek;
  task_type: TaskType;
  title: string;
  description?: string;
  is_completed: boolean;
  completed_at?: string;
  position: number;
  linked_goal_id?: string;
  created_at: string;
}

export interface LifeOSContext {
  profile: {
    goals: string[];
    values: string[];
    interests: string[];
    study_field?: string;
  };
  skills: Array<{
    skill: string;
    category: string;
    confidence: number;
  }>;
  ikigai?: {
    statements: string[];
    service_angles: string[];
  };
  offers?: {
    smv?: string;
    target_market?: string;
    packages: Array<{ name: string; price: string }>;
  };
}

export interface LifeOSWizardResponse {
  annual_vision?: Record<LifeAreaKey, {
    title: string;
    description: string;
    measurable_result: string;
  }>;
  quarterly_milestones?: Array<{
    area_key: LifeAreaKey;
    title: string;
    measurable_result: string;
  }>;
  monthly_goals?: Array<{
    area_key: LifeAreaKey;
    title: string;
    measurable_result: string;
  }>;
  weekly_sprint?: {
    goal: string;
    days: Record<DayOfWeek, {
      big_task: { title: string; area_key: LifeAreaKey };
      small_tasks: Array<{ title: string; area_key?: LifeAreaKey }>;
    }>;
  };
}

export const LIFE_AREAS: Record<LifeAreaKey, { icon: string; color: string }> = {
  business: { icon: 'Briefcase', color: 'hsl(var(--primary))' },
  body: { icon: 'Heart', color: 'hsl(346, 77%, 50%)' },
  mind: { icon: 'Brain', color: 'hsl(262, 83%, 58%)' },
  relationships: { icon: 'Users', color: 'hsl(24, 95%, 53%)' },
  spirituality: { icon: 'Sparkles', color: 'hsl(192, 91%, 36%)' },
  finance: { icon: 'Wallet', color: 'hsl(142, 71%, 45%)' },
  fun: { icon: 'Gamepad2', color: 'hsl(330, 81%, 60%)' },
};

export const DAYS_OF_WEEK: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const DAY_LABELS: Record<DayOfWeek, { en: string; ro: string }> = {
  MON: { en: 'Monday', ro: 'Luni' },
  TUE: { en: 'Tuesday', ro: 'Marți' },
  WED: { en: 'Wednesday', ro: 'Miercuri' },
  THU: { en: 'Thursday', ro: 'Joi' },
  FRI: { en: 'Friday', ro: 'Vineri' },
  SAT: { en: 'Saturday', ro: 'Sâmbătă' },
  SUN: { en: 'Sunday', ro: 'Duminică' },
};
