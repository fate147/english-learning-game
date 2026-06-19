-- =====================================================
-- 完整修复：给所有表加 subject + grade 列
-- 运行方式：Supabase Dashboard → SQL Editor → 粘贴运行
-- =====================================================

-- ===== game_sessions =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'subject'
  ) THEN
    ALTER TABLE public.game_sessions ADD COLUMN subject text NOT NULL DEFAULT 'english';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_sessions' AND column_name = 'grade'
  ) THEN
    ALTER TABLE public.game_sessions ADD COLUMN grade integer NOT NULL DEFAULT 3;
  END IF;
END $$;

-- ===== word_progress =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'word_progress' AND column_name = 'subject'
  ) THEN
    ALTER TABLE public.word_progress ADD COLUMN subject text NOT NULL DEFAULT 'english';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'word_progress' AND column_name = 'grade'
  ) THEN
    ALTER TABLE public.word_progress ADD COLUMN grade integer NOT NULL DEFAULT 3;
  END IF;
END $$;

-- 重建 word_progress 主键（确保包含 subject + grade）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'word_progress_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE public.word_progress DROP CONSTRAINT word_progress_pkey;
  END IF;
END $$;

ALTER TABLE public.word_progress
  ADD PRIMARY KEY (user_id, child_id, subject, grade, word_id);

-- ===== learning_app_state =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'learning_app_state' AND column_name = 'subject'
  ) THEN
    ALTER TABLE public.learning_app_state ADD COLUMN subject text NOT NULL DEFAULT 'english';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'learning_app_state' AND column_name = 'grade'
  ) THEN
    ALTER TABLE public.learning_app_state ADD COLUMN grade integer NOT NULL DEFAULT 3;
  END IF;
END $$;

-- 重建 learning_app_state 主键
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'learning_app_state_pkey' AND connamespace = 'public'::regnamespace
  ) THEN
    ALTER TABLE public.learning_app_state DROP CONSTRAINT learning_app_state_pkey;
  END IF;
END $$;

ALTER TABLE public.learning_app_state
  ADD PRIMARY KEY (user_id, child_id, subject, grade);

-- ===== 验证 =====
SELECT 'game_sessions' AS tbl, column_name, data_type
  FROM information_schema.columns WHERE table_name = 'game_sessions' AND column_name IN ('subject','grade')
UNION ALL
SELECT 'word_progress', column_name, data_type
  FROM information_schema.columns WHERE table_name = 'word_progress' AND column_name IN ('subject','grade')
UNION ALL
SELECT 'learning_app_state', column_name, data_type
  FROM information_schema.columns WHERE table_name = 'learning_app_state' AND column_name IN ('subject','grade');
