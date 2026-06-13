-- =====================================================
-- 多科迁移：加 subject + grade 列
-- 运行方式：Supabase Dashboard → SQL Editor → 粘贴运行
-- =====================================================

-- 1. game_sessions — 加 subject 和 grade（PK 不变）
alter table public.game_sessions
  add column if not exists subject text not null default 'english';
alter table public.game_sessions
  add column if not exists grade integer not null default 3;

-- 2. word_progress — 加列 + 主键扩展为 (user_id, child_id, subject, grade, word_id)
alter table public.word_progress
  add column if not exists subject text not null default 'english';
alter table public.word_progress
  add column if not exists grade integer not null default 3;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'word_progress_pkey' and connamespace = 'public'::regnamespace
  ) then
    alter table public.word_progress drop constraint word_progress_pkey;
  end if;
end $$;

alter table public.word_progress
  add primary key (user_id, child_id, subject, grade, word_id);

-- 3. learning_app_state — 加列 + 主键扩展为 (user_id, child_id, subject, grade)
alter table public.learning_app_state
  add column if not exists subject text not null default 'english';
alter table public.learning_app_state
  add column if not exists grade integer not null default 3;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'learning_app_state_pkey' and connamespace = 'public'::regnamespace
  ) then
    alter table public.learning_app_state drop constraint learning_app_state_pkey;
  end if;
end $$;

alter table public.learning_app_state
  add primary key (user_id, child_id, subject, grade);
