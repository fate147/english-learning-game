-- 原子星星操作 RPC（解决并发竞争）
-- 在 Supabase SQL Editor 中执行

create or replace function public.add_stars(
  p_user_id uuid,
  p_child_id text,
  p_total_add integer,
  p_available_add integer
) returns jsonb
language plpgsql
security definer
as $func$
declare
  result jsonb;
begin
  if auth.uid() != p_user_id then
    raise exception 'permission denied';
  end if;

  update public.child_profiles
  set
    total_earned_stars = total_earned_stars + p_total_add,
    available_stars = available_stars + p_available_add,
    updated_at = now()
  where user_id = p_user_id and child_id = p_child_id
  returning jsonb_build_object('total_earned_stars', total_earned_stars, 'available_stars', available_stars)
  into result;

  return result;
end;
$func$;

create or replace function public.spend_stars(
  p_user_id uuid,
  p_child_id text,
  p_cost integer
) returns jsonb
language plpgsql
security definer
as $func$
declare
  current_available integer;
  result jsonb;
begin
  if auth.uid() != p_user_id then
    raise exception 'permission denied';
  end if;

  select available_stars into current_available
  from public.child_profiles
  where user_id = p_user_id and child_id = p_child_id
  for update;

  if current_available < p_cost then
    raise exception 'not enough stars';
  end if;

  update public.child_profiles
  set
    available_stars = available_stars - p_cost,
    updated_at = now()
  where user_id = p_user_id and child_id = p_child_id
  returning jsonb_build_object('total_earned_stars', total_earned_stars, 'available_stars', available_stars)
  into result;

  return result;
end;
$func$;
