-- 修复 RLS 策略 — 每个表写明确的策略，不依赖 do 循环

-- ===== child_profiles =====
drop policy if exists "users_select_own_child_profiles" on public.child_profiles;
drop policy if exists "users_insert_own_child_profiles" on public.child_profiles;
drop policy if exists "users_update_own_child_profiles" on public.child_profiles;

create policy "users_select_own_child_profiles" on public.child_profiles
  for select using (user_id = auth.uid());
create policy "users_insert_own_child_profiles" on public.child_profiles
  for insert with check (user_id = auth.uid());
create policy "users_update_own_child_profiles" on public.child_profiles
  for update using (user_id = auth.uid());

-- ===== learning_app_state =====
drop policy if exists "users_select_own_learning_app_state" on public.learning_app_state;
drop policy if exists "users_insert_own_learning_app_state" on public.learning_app_state;
drop policy if exists "users_update_own_learning_app_state" on public.learning_app_state;

create policy "users_select_own_learning_app_state" on public.learning_app_state
  for select using (user_id = auth.uid());
create policy "users_insert_own_learning_app_state" on public.learning_app_state
  for insert with check (user_id = auth.uid());
create policy "users_update_own_learning_app_state" on public.learning_app_state
  for update using (user_id = auth.uid());

-- ===== word_progress =====
drop policy if exists "users_select_own_word_progress" on public.word_progress;
drop policy if exists "users_insert_own_word_progress" on public.word_progress;
drop policy if exists "users_update_own_word_progress" on public.word_progress;

create policy "users_select_own_word_progress" on public.word_progress
  for select using (user_id = auth.uid());
create policy "users_insert_own_word_progress" on public.word_progress
  for insert with check (user_id = auth.uid());
create policy "users_update_own_word_progress" on public.word_progress
  for update using (user_id = auth.uid());

-- ===== game_sessions =====
drop policy if exists "users_select_own_game_sessions" on public.game_sessions;
drop policy if exists "users_insert_own_game_sessions" on public.game_sessions;
drop policy if exists "users_update_own_game_sessions" on public.game_sessions;

create policy "users_select_own_game_sessions" on public.game_sessions
  for select using (user_id = auth.uid());
create policy "users_insert_own_game_sessions" on public.game_sessions
  for insert with check (user_id = auth.uid());
create policy "users_update_own_game_sessions" on public.game_sessions
  for update using (user_id = auth.uid());

-- ===== reward_templates =====
drop policy if exists "users_select_own_reward_templates" on public.reward_templates;
drop policy if exists "users_insert_own_reward_templates" on public.reward_templates;
drop policy if exists "users_update_own_reward_templates" on public.reward_templates;

create policy "users_select_own_reward_templates" on public.reward_templates
  for select using (user_id = auth.uid());
create policy "users_insert_own_reward_templates" on public.reward_templates
  for insert with check (user_id = auth.uid());
create policy "users_update_own_reward_templates" on public.reward_templates
  for update using (user_id = auth.uid());

-- ===== reward_records =====
drop policy if exists "users_select_own_reward_records" on public.reward_records;
drop policy if exists "users_insert_own_reward_records" on public.reward_records;
drop policy if exists "users_update_own_reward_records" on public.reward_records;

create policy "users_select_own_reward_records" on public.reward_records
  for select using (user_id = auth.uid());
create policy "users_insert_own_reward_records" on public.reward_records
  for insert with check (user_id = auth.uid());
create policy "users_update_own_reward_records" on public.reward_records
  for update using (user_id = auth.uid());
