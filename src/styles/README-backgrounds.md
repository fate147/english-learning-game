# 背景样式使用指南

## 1. 复制 backgrounds.css 到项目

```
your-project/
├── public/
│   └── images/
│       └── bg-*.jpg      # 背景图片放这里
├── src/
│   └── styles/
│       └── backgrounds.css
```

## 2. 在 main.tsx 引入

```tsx
import './styles/backgrounds.css';
```

## 3. 使用方式

### 方式一：纯 CSS 渐变（推荐，无需图片）

```tsx
<div className="bg-candy game-page-bg">
  <h1>页面标题</h1>
</div>
```

可用类名：
- `bg-candy` - 糖果粉
- `bg-purple` - 紫色渐变
- `bg-green` - 淡绿渐变
- `bg-orange` - 暖橙渐变
- `bg-night` - 深蓝夜空
- `bg-ocean` - 海洋蓝
- `bg-sunset` - 日落粉
- `bg-forest` - 森林绿

### 方式二：背景图片

```tsx
// 图片放 public/images/bg-candy.jpg
<div style={{
  backgroundImage: 'url(/images/bg-candy.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '100vh'
}}>
  <h1>页面标题</h1>
</div>
```

### 方式三：渐变 + 纹理叠加

```tsx
<div className="bg-candy-pattern game-page-bg">
  <h1>带纹理的渐变背景</h1>
</div>
```

### 方式四：毛玻璃卡片

```tsx
<div className="glass-card">
  <h2>毛玻璃卡片</h2>
</div>
```

## 4. React 封装示例

```tsx
// components/PageBackground.tsx
interface Props {
  variant: 'candy' | 'purple' | 'green' | 'orange' | 'night' | 'ocean';
  children: React.ReactNode;
}

export function PageBackground({ variant, children }: Props) {
  return (
    <div className={`bg-${variant} game-page-bg`} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}

// 使用
<PageBackground variant="candy">
  <h1>我的页面</h1>
</PageBackground>
```

## 5. 深色模式自动切换

在 CSS 中已内置深色模式，切换方式：

```tsx
document.documentElement.classList.toggle('dark');
```

深色模式下的背景会自动变暗。