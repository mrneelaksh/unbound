-- ============================================================
-- UNBOUND — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  age_range text,
  is_minor boolean default false,
  onboarding_completed boolean default false,
  onboarding_step integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- ONBOARDING RESPONSES
-- ============================================================
create table public.onboarding_responses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  q1_age_range text,
  q2_first_exposure text,
  q3_frequency text,
  q4_control_score integer, -- 1-5
  q5_attempts text,
  q6_feelings text[], -- array of feelings
  q7_triggers text[], -- array of triggers
  q8_high_risk_time text,
  q9_life_impact text[], -- array of impacts
  q10_urge_resistance integer, -- 1-10
  q11_motivations text[],
  q12_replacement_habits text[],
  q13_previous_strategies text[],
  q14_support_preference text,
  q15_personal_goal text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.onboarding_responses enable row level security;
create policy "Users can manage own onboarding" on public.onboarding_responses
  for all using (auth.uid() = user_id);

-- ============================================================
-- PATTERN SCORES
-- ============================================================
create table public.pattern_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  control_score integer, -- 0-100
  trigger_load integer,
  night_risk integer,
  habit_strength integer,
  motivation integer,
  recovery_readiness integer,
  computed_at timestamptz default now()
);

alter table public.pattern_scores enable row level security;
create policy "Users can manage own pattern scores" on public.pattern_scores
  for all using (auth.uid() = user_id);

-- ============================================================
-- URGE EVENTS
-- ============================================================
create table public.urge_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  intensity integer not null check (intensity between 1 and 10),
  trigger_type text,
  occurred_at timestamptz default now(),
  intervention_started boolean default false,
  intervention_completed boolean default false,
  intervention_type text, -- 'breathing' | 'exercise' | 'urge_surfing'
  outcome text, -- 'resolved' | 'manageable' | 'still_intense' | 'exited'
  replacement_habit_chosen text,
  duration_seconds integer,
  xp_awarded integer default 0,
  notes text
);

alter table public.urge_events enable row level security;
create policy "Users can manage own urge events" on public.urge_events
  for all using (auth.uid() = user_id);

-- ============================================================
-- HABITS
-- ============================================================
create table public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  icon text,
  category text, -- 'fitness' | 'learning' | 'mindfulness' | 'creative' | 'social' | 'custom'
  target_minutes integer,
  frequency text default 'daily', -- 'daily' | 'weekly' | 'custom'
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.habits enable row level security;
create policy "Users can manage own habits" on public.habits
  for all using (auth.uid() = user_id);

-- ============================================================
-- HABIT COMPLETIONS
-- ============================================================
create table public.habit_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  completed_at timestamptz default now(),
  duration_minutes integer,
  notes text,
  xp_awarded integer default 30
);

alter table public.habit_completions enable row level security;
create policy "Users can manage own habit completions" on public.habit_completions
  for all using (auth.uid() = user_id);

-- ============================================================
-- QUESTS
-- ============================================================
create table public.quests (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text,
  xp_reward integer default 100,
  duration_minutes integer,
  habit_type text,
  is_active boolean default true,
  min_level integer default 1,
  requires_pro boolean default false
);

create table public.quest_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_id uuid references public.quests(id) on delete cascade not null,
  completed_at timestamptz default now(),
  xp_awarded integer
);

alter table public.quest_completions enable row level security;
create policy "Users can manage own quest completions" on public.quest_completions
  for all using (auth.uid() = user_id);

-- ============================================================
-- XP TRANSACTIONS
-- ============================================================
create table public.xp_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  action_type text not null, -- 'intervention' | 'habit' | 'quest' | 'checkin' | 'focus' | 'challenge'
  reference_id uuid, -- ID of urge_event, habit_completion, etc.
  description text,
  created_at timestamptz default now()
);

alter table public.xp_transactions enable row level security;
create policy "Users can view own XP" on public.xp_transactions
  for select using (auth.uid() = user_id);
create policy "Service role can insert XP" on public.xp_transactions
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- USER STATS (denormalized for performance)
-- ============================================================
create table public.user_stats (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  total_xp integer default 0,
  current_level integer default 1,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_checkin_date date,
  total_interventions integer default 0,
  total_habits_completed integer default 0,
  total_quests_completed integer default 0,
  updated_at timestamptz default now()
);

alter table public.user_stats enable row level security;
create policy "Users can view own stats" on public.user_stats
  for select using (auth.uid() = user_id);
create policy "Users can update own stats" on public.user_stats
  for update using (auth.uid() = user_id);
create policy "Users can insert own stats" on public.user_stats
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- BADGES
-- ============================================================
create table public.badges (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  description text,
  category text, -- 'first_step' | 'consistency' | 'focus' | 'resilience' | 'quests' | 'habits' | 'community'
  icon text,
  xp_reward integer default 0,
  unlock_condition jsonb -- flexible unlock logic
);

create table public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_id uuid references public.badges(id) not null,
  unlocked_at timestamptz default now(),
  unique(user_id, badge_id)
);

alter table public.user_badges enable row level security;
create policy "Users can view own badges" on public.user_badges
  for select using (auth.uid() = user_id);

-- ============================================================
-- PROGRESS METRICS (daily snapshots)
-- ============================================================
create table public.progress_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  metric_date date not null,
  urge_count integer default 0,
  interventions_completed integer default 0,
  habits_completed integer default 0,
  quests_completed integer default 0,
  focus_minutes integer default 0,
  sleep_quality integer, -- 1-10 self-reported
  mood_score integer, -- 1-10
  urge_resistance_score numeric(4,2), -- self-reported
  xp_earned integer default 0,
  unique(user_id, metric_date)
);

alter table public.progress_metrics enable row level security;
create policy "Users can manage own metrics" on public.progress_metrics
  for all using (auth.uid() = user_id);

-- ============================================================
-- AI CONVERSATIONS
-- ============================================================
create table public.ai_conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  context_type text, -- 'urge' | 'general' | 'weekly_review'
  created_at timestamptz default now()
);

create table public.ai_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.ai_conversations enable row level security;
create policy "Users can manage own AI conversations" on public.ai_conversations
  for all using (auth.uid() = user_id);

alter table public.ai_messages enable row level security;
create policy "Users can access own AI messages" on public.ai_messages
  for all using (
    exists (
      select 1 from public.ai_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- ============================================================
-- NIGHT SHIELD SETTINGS
-- ============================================================
create table public.night_shield_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  is_enabled boolean default false,
  start_time time default '22:30',
  end_time time default '06:30',
  mode text default 'focus', -- 'focus' | 'sleep' | 'read' | 'music'
  updated_at timestamptz default now()
);

alter table public.night_shield_settings enable row level security;
create policy "Users can manage own night shield" on public.night_shield_settings
  for all using (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'max')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- ============================================================
-- PRIVACY SETTINGS
-- ============================================================
create table public.privacy_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  leaderboard_visible boolean default false,
  show_in_global_challenges boolean default false,
  allow_ai_personalization boolean default true,
  data_retention_days integer default 365,
  updated_at timestamptz default now()
);

alter table public.privacy_settings enable row level security;
create policy "Users can manage own privacy settings" on public.privacy_settings
  for all using (auth.uid() = user_id);

-- ============================================================
-- GLOBAL LEADERBOARD (public — XP only, anonymous)
-- ============================================================
create table public.leaderboard_entries (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  anonymous_name text not null, -- randomly generated, user cannot set real name
  total_xp integer default 0,
  weekly_xp integer default 0,
  current_level integer default 1,
  country_code text,
  updated_at timestamptz default now()
);

-- Leaderboard is readable by all authenticated users (XP only)
alter table public.leaderboard_entries enable row level security;
create policy "Leaderboard is publicly readable" on public.leaderboard_entries
  for select using (
    exists (
      select 1 from public.privacy_settings ps
      where ps.user_id = leaderboard_entries.user_id
      and ps.leaderboard_visible = true
    )
  );
create policy "Users can manage own leaderboard entry" on public.leaderboard_entries
  for all using (auth.uid() = user_id);

-- ============================================================
-- WEEKLY REPORTS
-- ============================================================
create table public.weekly_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start date not null,
  week_end date not null,
  days_checked_in integer default 0,
  total_xp_earned integer default 0,
  urge_count integer default 0,
  prev_week_urge_count integer default 0,
  strongest_trigger text,
  best_replacement_habit text,
  biggest_improvement text,
  next_mission text,
  ai_summary text,
  generated_at timestamptz default now(),
  unique(user_id, week_start)
);

alter table public.weekly_reports enable row level security;
create policy "Users can access own weekly reports" on public.weekly_reports
  for all using (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS (auto-create profile, stats, privacy on signup)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.user_stats (user_id) values (new.id);
  insert into public.privacy_settings (user_id) values (new.id);
  insert into public.night_shield_settings (user_id) values (new.id);
  insert into public.subscriptions (user_id, plan) values (new.id, 'free');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_urge_events_user_id on public.urge_events(user_id);
create index idx_urge_events_occurred_at on public.urge_events(occurred_at desc);
create index idx_habit_completions_user_id on public.habit_completions(user_id);
create index idx_habit_completions_completed_at on public.habit_completions(completed_at desc);
create index idx_progress_metrics_user_date on public.progress_metrics(user_id, metric_date desc);
create index idx_xp_transactions_user_id on public.xp_transactions(user_id);
create index idx_leaderboard_total_xp on public.leaderboard_entries(total_xp desc);
create index idx_leaderboard_weekly_xp on public.leaderboard_entries(weekly_xp desc);

-- ============================================================
-- SEED: Quests
-- ============================================================
insert into public.quests (title, description, category, xp_reward, duration_minutes, habit_type) values
  ('10-Minute Chess Challenge', 'Play chess for 10 minutes', 'focus', 50, 10, 'chess'),
  ('15-Minute Focus Session', 'Deep focus on a single task', 'focus', 40, 15, 'focus'),
  ('5-Minute Walk', 'Step outside and walk', 'fitness', 30, 5, 'fitness'),
  ('Read 5 Pages', 'Open a book and read 5 pages', 'learning', 30, 10, 'reading'),
  ('20 Push-ups', 'Complete 20 push-ups', 'fitness', 40, 5, 'fitness'),
  ('5-Minute Meditation', 'Sit quietly and breathe', 'mindfulness', 50, 5, 'meditation'),
  ('15-Minute Study Session', 'Learn something new', 'learning', 40, 15, 'study'),
  ('10-Minute Music Session', 'Listen or create music mindfully', 'creative', 30, 10, 'music'),
  ('Cold Water Reset', 'Splash cold water on your face', 'fitness', 20, 2, 'fitness'),
  ('Write 3 Lines', 'Journal 3 things you are grateful for', 'mindfulness', 30, 5, 'journaling');

-- ============================================================
-- SEED: Badges
-- ============================================================
insert into public.badges (slug, name, description, category, xp_reward) values
  ('first_step', 'First Step', 'Completed your first check-in', 'first_step', 50),
  ('first_intervention', 'Moment Interrupted', 'Completed your first Urge Mode intervention', 'resilience', 100),
  ('streak_3', '3-Day Consistency', 'Checked in 3 days in a row', 'consistency', 75),
  ('streak_7', 'One Week Strong', 'Checked in 7 days in a row', 'consistency', 200),
  ('streak_30', 'Unstoppable', 'Checked in 30 days in a row', 'consistency', 500),
  ('habit_10', 'Habit Builder', 'Completed 10 habits', 'habits', 150),
  ('quest_10', 'Quest Seeker', 'Completed 10 quests', 'quests', 150),
  ('focus_10', 'Focus Mode', 'Completed 10 focus sessions', 'focus', 200),
  ('intervention_50', 'Resilient Mind', 'Completed 50 healthy actions', 'resilience', 300),
  ('first_report', 'Self-Aware', 'Viewed your first weekly report', 'personal_growth', 50),
  ('night_shield', 'Night Guardian', 'Activated Night Shield 7 nights', 'habits', 100),
  ('level_5', 'Halfway There', 'Reached Level 5: Focus', 'personal_growth', 250),
  ('level_8', 'UNBOUND', 'Reached Level 8: UNBOUND', 'personal_growth', 500),
  ('level_10', 'Ascended', 'Reached Level 10: Ascend', 'personal_growth', 1000);

-- ============================================================
-- WATER TRACKING & HYDRATION MODULE
-- ============================================================
create table public.water_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount_ml integer not null check (amount_ml > 0),
  logged_at timestamptz default now() not null,
  source text default 'quick_add', -- 'quick_add' | 'custom'
  created_at timestamptz default now()
);

alter table public.water_logs enable row level security;
create policy "Users can view own water logs" on public.water_logs
  for select using (auth.uid() = user_id);
create policy "Users can insert own water logs" on public.water_logs
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own water logs" on public.water_logs
  for delete using (auth.uid() = user_id);

create table public.water_goals (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  daily_goal_ml integer default 2500 check (daily_goal_ml between 500 and 10000),
  updated_at timestamptz default now()
);

alter table public.water_goals enable row level security;
create policy "Users can view own water goal" on public.water_goals
  for select using (auth.uid() = user_id);
create policy "Users can upsert own water goal" on public.water_goals
  for all using (auth.uid() = user_id);

create index idx_water_logs_user_date on public.water_logs(user_id, logged_at desc);

-- ============================================================
-- NUTRITION & DAILY FOOD LOG
-- ============================================================
create table public.food_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  serving text,
  calories integer,
  protein_g numeric(6, 1) default 0,
  carbs_g numeric(6, 1) default 0,
  fat_g numeric(6, 1) default 0,
  fiber_g numeric(6, 1) default 0,
  notes text,
  logged_at timestamptz default now() not null,
  created_at timestamptz default now()
);

alter table public.food_logs enable row level security;
create policy "Users can view own food logs" on public.food_logs
  for select using (auth.uid() = user_id);
create policy "Users can insert own food logs" on public.food_logs
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own food logs" on public.food_logs
  for delete using (auth.uid() = user_id);

create index idx_food_logs_user_date on public.food_logs(user_id, logged_at desc);

