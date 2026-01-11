-- Tabel arii de viață ale utilizatorului
CREATE TABLE public.life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  area_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, area_key)
);

-- Tabel obiective (anuale, trimestriale, lunare)
CREATE TABLE public.life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  area_key TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  period TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  measurable_result TEXT,
  target_value TEXT,
  current_value TEXT,
  parent_goal_id UUID REFERENCES public.life_goals(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel sprinturi săptămânale
CREATE TABLE public.weekly_sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_key TEXT NOT NULL,
  week_goal TEXT,
  reflection TEXT,
  energy_level INTEGER,
  wins JSONB DEFAULT '[]',
  lessons JSONB DEFAULT '[]',
  planned_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_key)
);

-- Tabel task-uri zilnice
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sprint_id UUID REFERENCES public.weekly_sprints(id) ON DELETE CASCADE,
  area_key TEXT,
  day_date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  position INTEGER DEFAULT 0,
  linked_goal_id UUID REFERENCES public.life_goals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for life_areas
CREATE POLICY "Users can manage their own life areas"
  ON public.life_areas FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for life_goals
CREATE POLICY "Users can manage their own life goals"
  ON public.life_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_sprints
CREATE POLICY "Users can manage their own weekly sprints"
  ON public.weekly_sprints FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_tasks
CREATE POLICY "Users can manage their own daily tasks"
  ON public.daily_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on life_goals
CREATE TRIGGER update_life_goals_updated_at
  BEFORE UPDATE ON public.life_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on weekly_sprints
CREATE TRIGGER update_weekly_sprints_updated_at
  BEFORE UPDATE ON public.weekly_sprints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();