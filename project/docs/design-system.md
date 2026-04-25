# 《经典常谈》伴学平台 - 前端设计规范

## 设计理念：新中式现代风格

将中国传统美学与现代简约设计融合，营造"在现代界面中阅读经典"的独特体验。

### 核心视觉概念
- **"书卷气韵"**：界面如展开的宣纸，温润柔和
- **"渐进探索"**：学习进度如卷轴徐徐展开，有仪式感
- **"文人雅致"**：色彩、字体、留白体现中式审美

---

## 色彩系统

### 主色
```css
:root {
  /* 朱砂红 - 强调色、按钮、重要提示 */
  --color-zhusha: #C73E3A;
  --color-zhusha-light: #E85D5A;
  --color-zhusha-dark: #A0302D;
  
  /* 石青 - 次强调色、链接、图标 */
  --color-shiqing: #2E5C8A;
  --color-shiqing-light: #4A7CB0;
  --color-shiqing-dark: #1E3D5C;
  
  /* 藤黄 - 点缀色、徽章、高亮 */
  --color-teng-huang: #F4A442;
  --color-teng-huang-light: #F7C06A;
  --color-teng-huang-dark: #D4832A;
}
```

### 中性色
```css
:root {
  /* 墨黑 - 主文字 */
  --color-mohei: #1A1A1A;
  
  /* 宣纸白 - 背景 */
  --color-xuanzhi: #F8F6F1;
  --color-xuanzhi-warm: #F5F2EB;
  
  /* 淡墨灰 - 次要文字、边框 */
  --color-danmo: #8C8C8C;
  --color-danmo-light: #E8E4DC;
  
  /* 成功绿（竹青） */
  --color-zhuqing: #5A9A6E;
  
  /* 错误红（胭脂） */
  --color-yanzhi: #B85450;
}
```

### 渐变
```css
/* 宣纸质感背景 */
--gradient-paper: linear-gradient(135deg, #F8F6F1 0%, #F5F2EB 50%, #EDE9E0 100%);

/* 卷轴阴影 */
--gradient-scroll-shadow: linear-gradient(90deg, 
  rgba(0,0,0,0.05) 0%, 
  transparent 5%, 
  transparent 95%, 
  rgba(0,0,0,0.05) 100%
);
```

---

## 字体系统

### 字体选择
```css
/* 标题字体 - 有书法感的现代字体 */
--font-display: 'Noto Serif SC', 'Source Han Serif SC', serif;

/* 正文字体 - 清晰易读的宋体 */
--font-body: 'Noto Sans SC', 'Source Han Sans SC', sans-serif;

/* 数字字体 - 等宽清晰 */
--font-mono: 'Noto Sans Mono', monospace;
```

### 字号层级
```css
--text-xs: 0.75rem;      /* 12px - 辅助文字 */
--text-sm: 0.875rem;     /* 14px - 小标签 */
--text-base: 1rem;       /* 16px - 正文 */
--text-lg: 1.125rem;     /* 18px - 大正文 */
--text-xl: 1.25rem;      /* 20px - 小标题 */
--text-2xl: 1.5rem;      /* 24px - 标题 */
--text-3xl: 1.875rem;    /* 30px - 大标题 */
--text-4xl: 2.25rem;     /* 36px - 显示标题 */
```

### 行高
```css
--leading-tight: 1.25;   /* 紧凑 - 标题 */
--leading-snug: 1.375;   /* 较紧 - 短文本 */
--leading-normal: 1.75;  /* 正常 - 正文 */
--leading-relaxed: 2;    /* 宽松 - 长文本阅读 */
```

---

## 间距系统

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

---

## 圆角系统

```css
/* 小圆角 - 按钮、输入框 */
--radius-sm: 4px;

/* 中圆角 - 卡片 */
--radius-md: 8px;

/* 大圆角 - 大卡片、模态框 */
--radius-lg: 16px;

/* 圆形 - 头像、徽章 */
--radius-full: 9999px;
```

---

## 阴影系统

```css
/* 卡片阴影 - 轻微漂浮感 */
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);

/* 悬停阴影 */
--shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);

/* 模态框阴影 */
--shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.15);

/* 宣纸纹理感阴影 */
--shadow-paper: 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02);
```

---

## 动画效果

### 缓动函数
```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 时长
```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### 关键动画

#### 1. 卷轴展开效果
```css
@keyframes scrollUnfold {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}
```

#### 2. 毛笔书写感淡入
```css
@keyframes brushFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
```

#### 3. 印章落下
```css
@keyframes stampDrop {
  0% {
    transform: scale(1.5) rotate(-10deg);
    opacity: 0;
  }
  60% {
    transform: scale(0.95) rotate(2deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}
```

#### 4. 解锁闪耀
```css
@keyframes unlockShine {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
  100% {
    filter: brightness(1);
  }
}
```

---

## 页面设计

### 1. 登录页

**布局**: 居中单卡片，宣纸质感背景

**关键元素**:
- 顶部：平台名称书法字体 + 小字副标题
- 中央：登录卡片（宣纸白色，轻微阴影）
- 输入框：底部边框样式，聚焦时变朱砂红
- 按钮：石青底色，圆角，悬停微上浮

**动效**:
- 页面加载：卡片从下方淡入
- 输入框聚焦：边框渐变变色
- 按钮悬停：阴影加深，微微上浮

### 2. 首页

**布局**: 顶部导航 + 主体内容区

**导航栏**:
- 左侧：Logo + 平台名
- 中间：首页、阅读专项、学习中心、我的中心
- 右侧：用户头像下拉菜单
- 背景：宣纸白 + 底部细阴影

**主内容区**:
- 顶部卡片：欢迎语 + 今日学习时长/连续打卡天数
- 进度概览：卷轴式进度条（3大项目状态）
- 快捷入口：阅读、学习、成果 三大模块快捷入口

**动效**:
- 卡片依次淡入（stagger 100ms）
- 进度条：模拟卷轴展开动画
- 快捷入口悬停：图标微旋转 + 上浮

### 3. 阅读专项页

**布局**: 左侧篇目列表 + 右侧阅读区

**篇目列表**:
- 列表项：篇名 + 状态图标（未读、进行中、已完成✓）
- 已完成：藤黄标记
- 当前阅读：朱砂红高亮边框

**阅读区**:
- 顶部：篇名（大字标题）
- 正文：舒适的行高（1.75），段落间有留白
- 右侧边栏：批注按钮、笔记按钮、金句收藏
- 底部：阅读进度条 + 翻页按钮

**动效**:
- 切换篇目：内容区交叉淡入淡出
- 批注展开：从侧面滑入
- 进度保存：右上角小印章动画

### 4. 学习中心页

**布局**: 项目卡片网格（3大项目）

**项目卡片**:
- 顶部：项目序号 + 状态徽章
- 中部：项目名称 + 简介
- 底部：子任务进度

**状态表现**:
- 未解锁：灰度 + 锁图标
- 进行中：正常彩色 + 进度条
- 已完成：藤黄边框 + ✓徽章

**动效**:
- 解锁动画：卡片从灰变彩，印章落下
- 进度条：平滑增长
- 悬停：微微放大 + 阴影加深

### 5. 我的中心页

**布局**: 顶部用户信息卡片 + Tab切换内容区

**Tab设计**:
- 个人档案
- UP主素材库（分类展示）
- 勋章墙
- 学习数据

**素材库**:
- 网格展示，分类筛选
- 每项预览 + 标题 + 日期

**勋章墙**:
- 徽章网格展示
- 未获得：半透明 + 问号
- 已获得：正常显示，悬停显示详情

---

## 组件设计

### Button 按钮

**主按钮（朱砂红）**
```css
.btn-primary {
  background: var(--color-zhusha);
  color: white;
  border-radius: var(--radius-sm);
  padding: 12px 24px;
  font-weight: 500;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-primary:hover {
  background: var(--color-zhusha-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(199, 62, 58, 0.3);
}
```

**次按钮（石青）**
```css
.btn-secondary {
  background: var(--color-shiqing);
  color: white;
  /* 同上 */
}
```

**幽灵按钮**
```css
.btn-ghost {
  background: transparent;
  border: 1px solid var(--color-danmo-light);
  color: var(--color-mohei);
}

.btn-ghost:hover {
  border-color: var(--color-zhusha);
  color: var(--color-zhusha);
}
```

### Card 卡片

```css
.card {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-paper);
  padding: var(--space-6);
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

/* 锁定的卡片 */
.card-locked {
  opacity: 0.6;
  filter: grayscale(0.5);
}

/* 完成的卡片 */
.card-completed {
  border: 2px solid var(--color-teng-huang);
}
```

### Input 输入框

```css
.input {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--color-danmo-light);
  padding: 8px 0;
  font-size: var(--text-base);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.input:focus {
  outline: none;
  border-bottom-color: var(--color-zhusha);
}
```

### Progress 进度条

```css
.progress-track {
  height: 8px;
  background: var(--color-danmo-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-zhusha), var(--color-teng-huang));
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}
```

### Badge 徽章

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.badge-zhusha {
  background: rgba(199, 62, 58, 0.1);
  color: var(--color-zhusha);
}

.badge-shiqing {
  background: rgba(46, 92, 138, 0.1);
  color: var(--color-shiqing);
}

.badge-teng-huang {
  background: rgba(244, 164, 66, 0.15);
  color: var(--color-teng-huang-dark);
}
```

---

## 响应式设计

### 断点
```css
/* 手机 */
@media (max-width: 640px) { }

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) { }

/* 桌面 */
@media (min-width: 1025px) { }
```

### 移动端适配要点
1. **导航**: 汉堡菜单 + 底部固定导航栏
2. **卡片**: 单列布局，全宽
3. **阅读页**: 隐藏侧边栏，底部浮动工具栏
4. **字体**: 正文保持16px，标题适当缩小
5. **间距**: 减小内边距，保持呼吸感

---

## 特殊效果

### 宣纸纹理背景（可选）
```css
.paper-texture {
  background-image: url("data:image/svg+xml,..."); /* 微妙噪点纹理 */
  background-blend-mode: multiply;
}
```

### 印章效果
```css
.seal {
  width: 60px;
  height: 60px;
  background: var(--color-zhusha);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-display);
  font-weight: bold;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  transform: rotate(-5deg);
}
```

### 卷轴装饰
```css
.scroll-decoration::before,
.scroll-decoration::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  background: var(--gradient-scroll-shadow);
}
```

---

## 设计原则总结

1. **克制而有韵味**：不堆砌装饰，每处细节都有中式美学的考量
2. **内容为王**：舒适的阅读体验是核心，界面服务于内容
3. **渐进反馈**：学习进度通过视觉变化给予正向反馈
4. **现代与古典的平衡**：现代交互 + 古典气韵
5. **一致性**：所有页面遵循统一的设计语言

---

*设计规范 v1.0*
