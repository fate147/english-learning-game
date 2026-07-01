# UI 设计系统

## 快速开始

### 1. 复制文件到新项目

```
your-project/
├── src/
│   └── styles/
│       ├── tokens.css      # 设计 Token
│       └── components.css  # 组件样式
```

### 2. 在 main.tsx 中引入

```tsx
import './styles/tokens.css';
import './styles/components.css';
```

### 3. 使用组件

```tsx
import { Button, Card, Input } from './components';

function App() {
  return (
    <Card>
      <Input label="用户名" placeholder="请输入" />
      <Button variant="primary">提交</Button>
    </Card>
  );
}
```

---

## 设计规范

### 颜色系统

| 类别 | 变量 | 用途 |
|------|------|------|
| 主色 | `--c-primary` | 主要操作、链接、选中状态 |
| 成功 | `--c-success` | 成功状态、确认操作 |
| 危险 | `--c-danger` | 错误、删除、警告 |
| 警告 | `--c-warning` | 注意事项、待处理 |
| 背景 | `--c-bg` | 页面背景 |
| 文本 | `--c-text` | 主要文字 |
| 边框 | `--c-border` | 分割线、边框 |

### 间距系统

基于 4px 网格：

| 变量 | 值 | 用途 |
|------|-----|------|
| `--space-1` | 4px | 极小间距 |
| `--space-2` | 8px | 小间距 |
| `--space-3` | 12px | 内边距 |
| `--space-4` | 16px | 标准间距 |
| `--space-6` | 24px | 大间距 |
| `--space-8` | 32px | 区块间距 |

### 字体系统

| 变量 | 值 | 用途 |
|------|-----|------|
| `--font-size-xs` | 12px | 辅助文字 |
| `--font-size-sm` | 14px | 次要文字、标签 |
| `--font-size-base` | 16px | 正文 |
| `--font-size-lg` | 18px | 小标题 |
| `--font-size-xl` | 24px | 标题 |

---

## 组件清单

### 按钮 (Button)

```tsx
<button className="btn btn-primary">主要</button>
<button className="btn btn-outline">轮廓</button>
<button className="btn btn-primary btn-sm">小按钮</button>
```

变体：`primary` `secondary` `success` `danger` `warning` `outline` `ghost`
尺寸：`sm` 默认 `lg`

### 输入框 (Input)

```tsx
<div className="input-group">
  <label className="input-label">用户名</label>
  <input className="input" placeholder="请输入" />
</div>
```

变体：默认 `input-error` `input-success` `textarea`

### 卡片 (Card)

```tsx
<div className="card">
  <div className="card-header">
    <div className="card-title">标题</div>
  </div>
  <div className="card-content">内容</div>
</div>
```

### 徽章 (Badge)

```tsx
<span className="badge badge-primary">主要</span>
<span className="badge badge-success">成功</span>
```

### 警告 (Alert)

```tsx
<div className="alert alert-info">信息提示</div>
<div className="alert alert-success">成功提示</div>
```

### 标签页 (Tabs)

```tsx
<div className="tabs">
  <button className="tab active">标签一</button>
  <button className="tab">标签二</button>
</div>
```

### 手风琴 (Accordion)

```tsx
<div className="accordion">
  <div className="accordion-item">
    <button className="accordion-trigger">标题</button>
    <div className="accordion-content">内容</div>
  </div>
</div>
```

### 模态框 (Modal)

```tsx
<div className="modal-overlay open">
  <div className="modal">
    <div className="modal-header">
      <div className="modal-title">标题</div>
      <button className="modal-close">&times;</button>
    </div>
    <div className="modal-body">内容</div>
  </div>
</div>
```

### 表格 (Table)

```tsx
<div className="table-wrapper">
  <table className="table">
    <thead>
      <tr><th>标题</th></tr>
    </thead>
    <tbody>
      <tr><td>内容</td></tr>
    </tbody>
  </table>
</div>
```

### Switch 开关

```tsx
<label className="switch">
  <input type="checkbox" className="switch-input">
  <span className="switch-slider"></span>
  <span className="switch-label">开启</span>
</label>
```

### Checkbox 复选框

```tsx
<label className="checkbox">
  <input type="checkbox" className="checkbox-input">
  <span className="checkbox-box"></span>
  <span className="checkbox-label">同意</span>
</label>
```

### Radio 单选框

```tsx
<label className="radio">
  <input type="radio" className="radio-input">
  <span className="radio-circle"></span>
  <span className="radio-label">选项</span>
</label>
```

### Select 选择器

```tsx
<select className="input">
  <option>请选择</option>
  <option>选项1</option>
</select>
```

### Pagination 分页

```tsx
<div className="pagination">
  <button className="pagination-btn">&lt;</button>
  <button className="pagination-btn active">1</button>
  <button className="pagination-btn">2</button>
  <button className="pagination-btn">&gt;</button>
</div>
```

### Breadcrumb 面包屑

```tsx
<nav className="breadcrumb">
  <a className="breadcrumb-item">首页</a>
  <span className="breadcrumb-separator">/</span>
  <span className="breadcrumb-item active">当前页</span>
</nav>
```

### Spinner 加载

```tsx
<div className="spinner"></div>
<div className="spinner spinner-lg"></div>
```

### Progress 进度条

```tsx
<div className="progress">
  <div className="progress-bar" style={{width: '60%'}}></div>
</div>
```

### Skeleton 骨架屏

```tsx
<div className="skeleton skeleton-text"></div>
<div className="skeleton skeleton-title"></div>
<div className="skeleton skeleton-avatar"></div>
```

### Toast 轻提示

```tsx
<div className="toast-container" id="toast-container"></div>

// JS
const toast = document.createElement('div');
toast.className = 'toast toast-success';
toast.innerHTML = '<span>操作成功</span>';
document.getElementById('toast-container').appendChild(toast);
setTimeout(() => toast.remove(), 3000);
```

### Dropdown 下拉菜单

```tsx
<div className="dropdown">
  <button className="btn">菜单 ▾</button>
  <div className="dropdown-menu">
    <button className="dropdown-item">编辑</button>
    <button className="dropdown-item danger">删除</button>
  </div>
</div>
```

### Empty State 空状态

```tsx
<div className="empty-state">
  <div className="empty-state-icon">📭</div>
  <div className="empty-state-title">暂无数据</div>
  <div className="empty-state-description">描述文字</div>
  <button className="btn btn-primary">操作</button>
</div>
```

### Chart 图表

```bash
npm install chart.js react-chartjs-2
```

```tsx
import { Line } from 'react-chartjs-2';

const data = {
  labels: ['1月', '2月', '3月'],
  datasets: [{
    label: '销售',
    data: [65, 59, 80],
    borderColor: 'var(--chart-color-1)',
  }]
};

<Line data={data} />
```

### FillBlank 填空题

```tsx
{/* 填空区域 */}
<div className="fill-blank">
  <span className="fill-blank-text">B</span>
  <span className="fill-blank-slot" data-index="0"></span>
  <span className="fill-blank-slot" data-index="1"></span>
  <span className="fill-blank-text">J</span>
  <span className="fill-blank-slot" data-index="2"></span>
  <span className="fill-blank-text">NG</span>
</div>

{/* 字母选项 */}
<div className="fill-blank-options">
  <button className="fill-blank-option" onClick={selectOption}>E</button>
  <button className="fill-blank-option" onClick={selectOption}>I</button>
  <button className="fill-blank-option" onClick={selectOption}>N</button>
</div>
```

动效：
- 填入：弹跳缩放 (`fillPop`)
- 正确：绿色闪烁 (`correctFlash`)
- 错误：左右抖动 (`wrongShake`)
- 全对：整体发光 (`allCorrectGlow`)

---

## 主题切换

### 切换深色模式

```tsx
// 切换
document.documentElement.dataset.theme = 'dark';

// 重置
document.documentElement.dataset.theme = 'light';
```

### 自定义主题

在 `tokens.css` 中添加：

```css
[data-theme="blue"] {
  --c-primary: #0ea5e9;
  --c-primary-hover: #0284c7;
}
```

---

## 最佳实践

1. **始终使用 Token** - 不要硬编码颜色值
2. **组合使用** - 一个组件可以组合多个类名
3. **语义化命名** - 使用颜色的语义名称而非具体颜色
4. **响应式** - 使用断点变量处理不同屏幕尺寸

---

## React 组件封装示例

```tsx
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  children, 
  onClick 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### QuizResult 答题结果

```tsx
{/* 正确结果 */}
<div className="quiz-result quiz-result-correct">
  <div className="quiz-avatar">🎉</div>
  <div className="quiz-content">
    <div className="quiz-status">
      <span className="quiz-status-icon">✓</span>
      <span className="quiz-status-text">回答正确！</span>
    </div>
    <div className="quiz-message">太棒了！你已经掌握了这个知识点</div>
    <div className="quiz-answer">
      <span className="quiz-answer-label">你的答案：</span>
      <span className="quiz-answer-value">A. 北京</span>
    </div>
  </div>
</div>

{/* 错误结果 */}
<div className="quiz-result quiz-result-wrong">
  <div className="quiz-avatar">💪</div>
  <div className="quiz-content">
    <div className="quiz-status">
      <span className="quiz-status-icon">✕</span>
      <span className="quiz-status-text">回答错误</span>
    </div>
    <div className="quiz-message">没关系，记住正确答案下次就学会了！</div>
    <div className="quiz-answer">
      <span className="quiz-answer-label">正确答案：</span>
      <span className="quiz-answer-value">B. 上海</span>
    </div>
  </div>
</div>
```

停留时间控制：
- 正确：3秒后自动跳转
- 错误：5秒后自动跳转（停留更久）

---

## 文件说明

- `tokens.css` - 设计 Token，定义所有变量
- `components.css` - 组件样式，基于 Token 构建
- `README.md` - 使用规范

复制这三个文件即可在任何项目中使用。