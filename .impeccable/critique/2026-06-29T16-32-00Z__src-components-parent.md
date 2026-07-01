---
target: Parent management UI redesign
total_score: 25
p0_count: 0
p1_count: 3
p2_count: 2
timestamp: 2026-06-29T16-32-00Z
slug: src-components-parent
---
# 家长管理 UI — Design Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Skeleton, error, empty states all present；active nav highlighted |
| 2 | Match System / Real World | 3 | 中文标签正确；"激励"比"奖励"抽象；相对时间显示合理 |
| 3 | User Control and Freedom | 3 | 返回按钮、孩子切换器、底部导航完善；无可逆操作(undo) |
| 4 | Consistency and Standards | 3 | KPI 卡片模式一致但过度使用；数值/标签方向在两个 panel 间翻转 |
| 5 | Error Prevention | 1 | 删除奖励模板、批量解锁单词均无确认弹窗 |
| 6 | Recognition Rather Than Recall | 4 | 所有功能可见，无隐藏菜单 |
| 7 | Flexibility and Efficiency | 2 | 无快捷键、无批量操作(除全选全不选)、无日期范围选择 |
| 8 | Aesthetic and Minimalist Design | 3 | 干净但 KPI 网格有模板感 |
| 9 | Error Recovery | 2 | 数据加载错误有重试；但写入操作无撤销 |
| 10 | Help and Documentation | 0 | 无帮助、无工具提示、无新手引导 |
| **Total** | | **25/40** | **Acceptable — 需要显著改进** |

## Anti-Patterns Verdict

**AI 生成判断：是，有一定 AI 痕迹**

具体 tells：
- **Hero-metric 模板**：三个 panel（统计/解锁/激励）全部以 4 列 KPI 卡片开头，大数字+小标签+辅助文字。这是最强的一个 AI 特征。
- **相同卡片网格重复**：`grid grid-cols-4 gap-3` 结构在三个 panel 间完全一致，缺乏差异化布局策略。
- **大写追踪小字**：日期缩写使用 `text-[10px] uppercase tracking-wider` 和 KPI 标签 `text-[11px] tracking-wide` — 典型的 AI 眉毛文字。

已排除：无边条纹、渐变文字、毛玻璃、编号章节、奶油背景。

**Deterministic scan**：检测到 1 个 `animate-bounce`（DialoguePractice.jsx:181），属于 bounce easing 反模式。

## Cognitive Load

3项失败 / 8项：
- **单点聚焦**：RewardsPanel 两列（模板+记录）同等权重，用户需决定先看哪边
- **视觉层次**：三个 panel 均以 4 张同等权重的 KPI 卡开头，模糊了每个 panel 的独特身份
- **最小选择**：UnlockPanel 同时呈现 4 张 KPI卡 + 进度条 + 3 个过滤按钮 + 全选按钮 + 6 个手风琴段 + 每个段内的全选 + 10-15 个单词

## What's Working

1. **状态覆盖全面**：每个 panel 都处理了 loading（骨架屏）、empty（EmptyState 按 variant 区分）、error（警告+重试）、边界情况（无孩子、无记录、无科目数据）。这做得很好。
2. **视觉系统干净**：成功避开所有禁止反模式（毛玻璃、渐变文字、奶油背景），坚持卡片+边框风格，间距、字形（tabular-nums、字重层级）一致，颜色锚定 OKLCH 绿色体系。
3. **渐进式披露**：StatsPanel 可展开科目行列 + UnlockPanel 手风琴单元，让家长无需翻页即可钻进详情。

## Priority Issues

### [P1] 删除奖励模板不可逆且无确认
- **Why**：删除按钮 24×24px，单次点击永久删除。误触即丢失整个模板。
- **Fix**：添加确认步骤（原生 confirm 或二次点击），或 5 秒内可撤销的 toast。

### [P1] 批量解锁/锁定单词无确认
- **Why**：一键可解锁/锁定全部 60+ 单词，无撤销方式（只能手动逐个重切）。
- **Fix**：批量操作前弹出确认弹窗，显示具体单词数。10 秒内可撤销 toast。

### [P1] 写入操作无任何反馈（无 toast）
- **Why**：添加模板、兑换、切换单词、批量操作 — 全部静默更新。慢网速下用户不确定操作是否成功。
- **Fix**：添加轻量 toast 通知系统，所有写入操作显示 3 秒确认。

### [P2] KPI 模板过度使用
- **Why**：三个 panel 全部以 4 张相同结构的 KPI 卡开头 → 面板间缺乏区分，重点被稀释。
- **Fix**：差异化布局 — StatsPanel 用单一大数字做主标题，RewardsPanel 把星星余额做成英雄元素，UnlockPanel 合拼进度条和完成率。

### [P2] 全无帮助/文档/新手引导
- **Why**：家长首次打开"家长管理"看到统计/解锁/激励标签，无任何解释 — 违反启发式 #10。
- **Fix**：至少加一个：首次访问的轻量引导浮层、KPI 标签旁的 tooltip 图标、或 header 里的帮助按钮。

## Persona Red Flags

**Alex（效率用户）**：
- 无键盘快捷键
- 无批量导出数据
- 日期范围固定 7 天，不能翻页回溯
- 奖励模板无法拖拽排序

**Sam（无障碍依赖用户）**：
- 奖励模板删除按钮 24×24px < 44px 触摸目标
- WordPreview 仅 hover 触发，无触摸等效
- 底部导航非活跃图标 `opacity-[0.55]` 可能 WCAG AA 对比度不足

## Minor Observations

- UnlockPanel `allFullyUnlocked` 传给 `toggleAll` 的第二个参数，如果 hook 签名不匹配会被静默忽略
- RewardsPanel 和 StatsPanel 的 KpiCard 数值/标签方向不一致
- RewardsPanel "近3天待领取" 标签可能误导（已兑换的记录不等于待领取）
- StatsPanel "学习天数" 显示 `{dayCount}/7` 但用户可能不理解 7 是最大天数
- 错误单词列表缺少词频排序（最高错误词应排最前）

## Questions to Consider

- 如果家长管理的核心目标是"一屏见全貌"，那为什么三个 panel 都强制家长先滚动 4 张 KPI 卡才能看到操作内容？
- 三个 tab 的层级事实上不等（统计每天看、解锁设置一次、激励设置一次），UI 是否应反映这种不对称？
- 4 列 KPI 网格是否有数据支撑是最佳呈现方式？一个带趋势箭头的突出指标是否更高效？
