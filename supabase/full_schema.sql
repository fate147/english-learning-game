-- =====================================================
-- 英语学习游戏 — 完整 Supabase 建表脚本
-- 适用：全新 Supabase 项目
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴运行
-- =====================================================

-- =====================================================
-- 1. child_profiles — 孩子档案
-- =====================================================
create table if not exists public.child_profiles (
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id text not null,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  avatar text,
  total_earned_stars integer not null default 0,
  available_stars integer not null default 0,
  parent_password text,
  is_archived boolean not null default false,
  primary key (user_id, child_id)
);

-- =====================================================
-- 2. learning_app_state — 学习状态
-- =====================================================
create table if not exists public.learning_app_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id text not null,
  subject text not null default 'english',
  grade integer not null default 3,
  unlocked_words text[] default '{}',
  today_counts jsonb default '{}',
  updated_at timestamptz default now(),
  primary key (user_id, child_id, subject, grade)
);

-- =====================================================
-- 3. word_progress — 单词进度
-- =====================================================
create table if not exists public.word_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id text not null,
  subject text not null default 'english',
  grade integer not null default 3,
  word_id text not null,
  level integer default 0,
  next_review timestamptz,
  correct_count integer default 0,
  wrong_count integer default 0,
  last_seen timestamptz,
  review_candidate boolean default false,
  updated_at timestamptz default now(),
  primary key (user_id, child_id, subject, grade, word_id)
);

-- =====================================================
-- 4. game_sessions — 游戏记录
-- client_session_id 有 UNIQUE 约束，去重
-- =====================================================
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id text not null,
  client_session_id text unique not null,
  played_on date not null,
  character text default 'default',
  subject text not null default 'english',
  grade integer not null default 3,
  correct_count integer default 0,
  wrong_count integer default 0,
  results jsonb default '[]',
  created_at timestamptz default now()
);

-- =====================================================
-- 5. reward_templates — 奖励模板
-- =====================================================
create table if not exists public.reward_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id text not null,
  name text not null,
  cost integer not null default 10,
  icon text default '🎁',
  created_at timestamptz default now()
);

-- =====================================================
-- 6. reward_records — 奖励兑换记录
-- =====================================================
create table if not exists public.reward_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id text not null,
  template_id uuid references public.reward_templates(id) on delete set null,
  name text not null,
  cost integer not null,
  created_at timestamptz default now()
);

-- =====================================================
-- 7. 启用 RLS（Row Level Security）
-- =====================================================
alter table public.child_profiles enable row level security;
alter table public.learning_app_state enable row level security;
alter table public.word_progress enable row level security;
alter table public.game_sessions enable row level security;
alter table public.reward_templates enable row level security;
alter table public.reward_records enable row level security;

-- =====================================================
-- 8. RLS 策略 — 每个表三策略（select/insert/update）
-- =====================================================
do $$
declare
  tables text[] := array['child_profiles', 'learning_app_state', 'word_progress', 'game_sessions', 'reward_templates', 'reward_records'];
  t text;
begin
  foreach t in array tables
  loop
    execute format('
      create policy "users_select_own_%s" on public.%I
        for select using (user_id = auth.uid());
      create policy "users_insert_own_%s" on public.%I
        for insert with check (user_id = auth.uid());
      create policy "users_update_own_%s" on public.%I
        for update using (user_id = auth.uid());
    ', t, t, t, t, t, t);
  end loop;
end $$;

-- 额外加 delete 策略
create policy if not exists "users_delete_own_child_profiles" on public.child_profiles
  for delete using (user_id = auth.uid());
create policy if not exists "users_delete_own_reward_templates" on public.reward_templates
  for delete using (user_id = auth.uid());
create policy if not exists "users_delete_own_reward_records" on public.reward_records
  for delete using (user_id = auth.uid());
