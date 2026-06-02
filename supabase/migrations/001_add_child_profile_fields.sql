-- 新增 child_profiles 字段
alter table public.child_profiles
  add column if not exists avatar text,
  add column if not exists total_earned_stars integer not null default 0,
  add column if not exists available_stars integer not null default 0,
  add column if not exists parent_password text,
  add column if not exists is_archived boolean not null default false;
