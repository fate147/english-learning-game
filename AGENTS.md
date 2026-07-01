# 项目设计规范

## 设计系统位置

所有 UI 组件样式基于 `ui-design-system/` 目录：

```
ui-design-system/
├── tokens.css      # 设计 Token（颜色、间距、字体）
├── components.css  # 组件样式
└── README.md       # 使用文档
```

## 必须遵守的规则

### 1. 颜色使用

```css
/* ✓ 正确 - 使用变量 */
color: var(--c-primary);
background: var(--c-bg);

/* ✗ 错误 - 硬编码颜色 */
color: #3b82f6;
background: #ffffff;
```

### 2. 间距使用

```css
/* ✓ 正确 - 使用变量 */
padding: var(--space-4);
margin: var(--space-2) var(--space-4);

/* ✗ 错误 - 硬编码数值 */
padding: 16px;
margin: 8px 16px;
```

### 3. 字体使用

```css
/* ✓ 正确 - 使用变量 */
font-size: var(--font-size-sm);
font-weight: var(--font-weight-medium);

/* ✗ 错误 - 硬编码数值 */
font-size: 14px;
font-weight: 500;
```

### 4. 组件使用

```jsx
// ✓ 正确 - 使用现有组件
import { Button, Card, Input } from './components';

// ✗ 错误 - 自己写样式
<button style={{ background: 'blue' }}>提交</button>
```

### 5. 尺寸变体

```jsx
// ✓ 正确 - 使用类名控制尺寸
<Button variant="primary" size="sm">小按钮</Button>
<Button variant="primary" size="lg">大按钮</Button>

// ✗ 错误 - 自己写尺寸样式
<button style={{ padding: '4px 8px' }}>小按钮</button>
```

## 组件清单

| 组件 | 类名 | 用途 |
|------|------|------|
| Button | `.btn` `.btn-primary` | 按钮 |
| Input | `.input` | 输入框 |
| Card | `.card` | 卡片 |
| Badge | `.badge` | 徽章 |
| Alert | `.alert` | 警告 |
| Tabs | `.tabs` `.tab` | 标签页 |
| Accordion | `.accordion` | 手风琴 |
| Modal | `.modal` | 模态框 |
| Table | `.table` | 表格 |
| Pagination | `.pagination` | 分页 |
| Dropdown | `.dropdown` | 下拉菜单 |
| Progress | `.progress` | 进度条 |
| Toast | `.toast` | 提示 |
| Switch | `.switch` | 开关 |
| Checkbox | `.checkbox` | 复选框 |
| Radio | `.radio` | 单选框 |
| Skeleton | `.skeleton` | 骨架屏 |
| Spinner | `.spinner` | 加载中 |
| QuizResult | `.quiz-result` `.quiz-result-correct` `.quiz-result-wrong` | 答题结果 |
| FillBlank | `.fill-blank` `.fill-blank-slot` `.fill-blank-option` | 填空题 |

## 新组件开发流程

1. 先查看 `ui-design-system/README.md` 是否有现成组件
2. 如果没有，基于 tokens.css 的变量创建新样式
3. 样式必须使用 CSS 变量，不能硬编码
4. 添加到 `components.css` 中
5. 更新 `README.md` 文档

## 主题切换

```css
/* 深色模式 */
[data-theme="dark"] {
  --c-primary: var(--color-primary-400);
  --c-bg: var(--color-gray-800);
}
```

```js
// 切换主题
document.documentElement.dataset.theme = 'dark';
```

## 注意事项

- 所有颜色、间距、字体必须使用 CSS 变量
- 组件圆角统一使用 `--radius-md` (12px)
- 按钮 padding 统一使用 `var(--space-2) var(--space-4)`
- 字体大小统一使用 `var(--font-size-sm)` (14px)
- 不要添加注释，除非用户要求
- 不要添加额外的功能或抽象

---

## 题目生成规则

生成语文、数学、英语题目时，**必须遵守** `src/lib/question-rules.md` 中的规范：

- **难度分级**：concrete → pictorial → abstract → synthesis
- **选项设计**：3 个选项，干扰项必须合理，正确答案随机位置
- **图形规范**：正方形要像正方形，长方形要像长方形
- **数值规范**：单位统一，数值合理，符合年级范围
- **检查清单**：生成后逐项检查质量