# 断简残编·经典复原室 — 设计方案

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为《经典常谈》阅读系统新增"断简残编·经典复原室"子项目，学生以"经典修复师"身份，通过四步交互流程修复13部中华经典。

**Architecture:** 后端新增6张数据库表存储典籍内容、碎片、诊断题、排序节点、学生进度和个人笔记；前端通过React Context管理状态，按步骤渲染对应交互组件；内容数据通过Alembic migration + seed脚本初始化，不暴露管理端接口。

**Tech Stack:** React + TypeScript + Vite + Tailwind CSS + Ant Design (frontend), FastAPI + SQLAlchemy + MySQL (backend)

---

## 一、需求背景

学生登录后进入"经典复原室"工作台，面对13部因"年代久远"而散落的经典残卷，通过四步修复流程将其修复为完整档案卡：
1. **研读诊断** — 阅读任务卡 + 3道关键信息提取题
2. **碎片归筐** — 10-15个知识碎片拖拽到5个分类筐
3. **脉络排序** — 5-6个发展节点按时间/逻辑顺序排列
4. **档案生成** — 修复完成，生成精美档案卡 + 个人笔记

全部13部修复完毕后，工作台升级为"经典溯源档案馆"，可总览档案并探索典籍关联网络。

## 二、数据库模型

### 2.1 `restoration_chapters` — 典籍残卷定义
```python
class RestorationChapter(BaseModel):
    __tablename__ = "restoration_chapters"

    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    name = Column(String(50), nullable=False)        # 如"文字之源"
    alias = Column(String(50), nullable=False)       # 如"《说文解字》"
    description = Column(String(200), nullable=False) # 一句话介绍
    difficulty = Column(Enum("easy", "medium", "hard"), nullable=False)
    sort_order = Column(Integer, default=0)          # 1-13
    image_url = Column(String(500), nullable=True)   # 残卷封套图
    era_quote = Column(Text, nullable=False)         # 朱自清诊断提示原文
    positioning = Column(String(200), nullable=False) # 典籍定位
    archive_summary = Column(Text, nullable=False)   # 档案卡核心摘要
    archive_impact = Column(Text, nullable=False)    # 档案卡历史影响评价
```

### 2.2 `restoration_fragments` — 知识碎片
```python
class RestorationFragment(BaseModel):
    __tablename__ = "restoration_fragments"

    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    content = Column(String(300), nullable=False)    # 碎片内容
    category = Column(Enum("era", "author", "content", "style", "impact"), nullable=False)
    sort_order = Column(Integer, default=0)
```

### 2.3 `restoration_diagnostics` — 诊断题目
```python
class RestorationDiagnostic(BaseModel):
    __tablename__ = "restoration_diagnostics"

    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    question_type = Column(Enum("choice", "fill_blank"), nullable=False)
    content = Column(String(500), nullable=False)    # 题目文本
    options = Column(JSON, nullable=True)             # 选项数组
    correct_answer = Column(String(200), nullable=False)
    hint = Column(Text, nullable=False)               # 答错后原文提示
    sort_order = Column(Integer, default=0)           # 1-3
```

### 2.4 `restoration_nodes` — 脉络排序节点
```python
class RestorationNode(BaseModel):
    __tablename__ = "restoration_nodes"

    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    content = Column(String(200), nullable=False)    # 节点内容
    correct_order = Column(Integer, nullable=False)  # 正确顺序 1-based
    sort_order = Column(Integer, default=0)          # 显示顺序（打乱用）
```

### 2.5 `restoration_progress` — 学生修复进度（细粒度）
```python
class RestorationProgress(BaseModel):
    __tablename__ = "restoration_progress"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    current_step = Column(
        Enum("locked", "diagnostic", "sorting", "sequencing", "archive", "completed"),
        default="locked"
    )
    diagnostic_correct = Column(Integer, default=0)   # 答对题数 0-3
    sorting_correct = Column(Integer, default=0)      # 碎片归筐正确数
    sorting_completed = Column(Boolean, default=False)
    sequencing_attempts = Column(Integer, default=0)  # 排序尝试次数
    sequencing_completed = Column(Boolean, default=False)
    archive_completed = Column(Boolean, default=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'chapter_id', name='uix_user_chapter_progress'),
    )
```

### 2.6 `restoration_notes` — 档案卡个人笔记
```python
class RestorationNote(BaseModel):
    __tablename__ = "restoration_notes"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    chapter_id = Column(Integer, ForeignKey("restoration_chapters.id"), nullable=False)
    note = Column(String(200), nullable=False)

    __table_args__ = (
        UniqueConstraint('user_id', 'chapter_id', name='uix_user_chapter_note'),
    )
```

## 三、后端API设计

### 3.1 学生端聚合接口

```
GET    /restoration/chapters                         # 13部典籍列表（含进度状态）
GET    /restoration/chapters/{id}                    # 单部典籍详情 + 当前步骤
GET    /restoration/chapters/{id}/diagnostic         # 3道诊断题 + 原文提示
POST   /restoration/chapters/{id}/diagnostic/submit  # 提交答案 → {correct_count}
GET    /restoration/chapters/{id}/fragments          # 碎片池 + 5个分类筐
POST   /restoration/chapters/{id}/fragments/submit   # 提交分类 → {correct_count, total}
GET    /restoration/chapters/{id}/nodes              # 排序节点（已打乱）
POST   /restoration/chapters/{id}/nodes/submit       # 提交排序 → {is_correct, wrong_positions}
GET    /restoration/chapters/{id}/archive            # 档案卡数据
POST   /restoration/chapters/{id}/archive/note       # 保存个人笔记
GET    /restoration/progress                         # 全部13部进度总览
```

### 3.2 后端修改点

1. **`backend/app/routers/learning.py`** — 在 `PROJECTS[0]["sub_projects"]` 新增：
   ```python
   {"id": 2, "slug": "restoration", "name": "断简残编·经典复原室", "path": "/restoration"}
   ```
   解锁条件：`{"project_id": 1, "status": "completed"}`

2. **`backend/app/models/restoration.py`** — 6个SQLAlchemy模型
3. **`backend/app/routers/restoration.py`** — 学生端API路由
4. **`backend/app/schemas/restoration.py`** — Pydantic schemas
5. **`backend/app/main.py`** — 注册 router
6. **Alembic migration** — 创建表
7. **Seed script** — `backend/app/seeders/restoration_data.py` 初始化13部典籍数据

## 四、前端架构

### 4.1 页面结构
```
src/pages/Restoration/
├── index.tsx              # 复原室大厅（13封套网格 + 进度条 + 等级）
├── ChapterRepair.tsx      # 四步修复流程容器
└── ArchiveHall.tsx        # 经典溯源档案馆（全部完成后解锁）
```

### 4.2 组件结构
```
src/components/Restoration/
├── RepairHall.tsx         # 封套网格
├── RepairStepper.tsx      # 4步进度指示器
├── DiagnosticStep.tsx     # 研读诊断
├── FragmentSortStep.tsx   # 碎片归筐（HTML5拖拽）
├── NodeSequenceStep.tsx   # 脉络排序（HTML5拖拽）
├── ArchiveCardStep.tsx    # 档案生成
├── ArchiveCard.tsx        # 档案卡展示
├── ConnectionNetwork.tsx  # 关联网络图
├── DraggableFragment.tsx  # 可拖拽碎片
├── SortBin.tsx            # 分类筐
├── TimelineNode.tsx       # 脉络节点
└── LevelIndicator.tsx     # 修复师等级
```

### 4.3 Hooks
```
src/hooks/
├── useRestorationProgress.ts   # 进度查询与更新
├── useRestorationChapter.ts    # 单章数据获取
└── useRepairLevel.ts           # 修复师等级计算
```

### 4.4 状态管理

**React Context: `RestorationContext`**
- `chapters: RestorationChapter[]` — 13部典籍列表
- `progressMap: Record<number, RestorationProgress>` — 进度映射
- `refreshProgress()` — 刷新进度
- `updateProgress(chapterId, patch)` — 更新单章进度

**页面级 useState**
- `currentStep: RepairStep` — 当前步骤
- `diagnosticAnswers: Record<number, string>` — 诊断答案
- `fragmentPlacements: Record<number, string>` — 碎片分类结果
- `nodeOrder: number[]` — 节点排序结果
- `note: string` — 档案卡笔记

### 4.5 修复师等级（前端计算）

| 完成数 | 等级 |
|---|---|
| 0 | 学徒 |
| 1-3 | 学徒 |
| 4-6 | 助手 |
| 7-9 | 匠人 |
| 10-12 | 专家 |
| 13 | 大师 |

## 五、关键交互规则

### 5.1 碎片归筐
- 每个碎片有唯一的正确分类筐
- 提交后后端返回 `{correct_count, total}`
- 全部正确则推进到 `sequencing`
- 有错则标红错误碎片，允许调整后重新提交

### 5.2 脉络排序
- 节点拖拽到时间线上的正确位置
- 提交后后端返回 `{is_correct, wrong_positions: number[]}`
- 有错则标红错误位置节点，允许调整后再提交
- 允许多次尝试直到全对

### 5.3 诊断题
- 3道题依次作答
- 每题答错后显示朱自清原文提示
- 无限重试直到全对
- 全对后解锁下一步

### 5.4 档案卡笔记
- 200字以内
- 实时保存到后端
- 重新进入时回显

## 六、关联网络（前端硬编码）

全部13部完成后解锁的关联网络，8-10条核心关联线前端硬编码：

```typescript
const CONNECTIONS = [
  { from: 'shuowen', to: 'shangshu', label: '文字→记言', quote: '...' },
  { from: 'shijing', to: 'cifu', label: '诗歌→辞赋', quote: '...' },
  // ... 共8-10条
];
```

## 七、路由与集成

### 7.1 前端路由
```tsx
<Route path="/restoration" element={<RestorationHall />} />
<Route path="/restoration/:chapterId" element={<ChapterRepair />} />
<Route path="/restoration/archive" element={<ArchiveHall />} />
```

### 7.2 前端集成
- `src/App.tsx` — 新增路由
- `src/api/restoration.ts` — 新建API模块
- `src/pages/Learning/index.tsx` — 新增 `restoration` slug 图标映射

### 7.3 后端集成
- `backend/app/main.py` — 注册 restoration router
- `backend/app/routers/learning.py` — 新增子项目定义

## 八、响应式策略

| 断点 | 大厅网格 | 修复流程布局 |
|---|---|---|
| Desktop (≥1024px) | 4-4-5 三行 | 左右分栏（左侧导航+右侧内容） |
| Tablet (768-1023px) | 3-3-3-4 四行 | 上下堆叠 |
| Mobile (<768px) | 2-2-2-2-2-2-1 七行 | 单列，全屏步骤 |

## 九、风险与应对

| 风险 | 应对 |
|---|---|
| HTML5 拖拽在移动端兼容性差 | 使用 `react-dnd` 或 `dnd-kit` 库，自带触摸支持 |
| 13部典籍的 seed 数据量大 | 分文件存储，每部一个数据文件，seed脚本合并写入 |
| 碎片/题目内容准确性 | 直接从设计文档提取，由用户最终审核 |
| 进度状态复杂（6种状态×13章） | 使用状态机模式，定义明确的转换规则 |

## 十、测试策略

1. **单元测试** — 碎片分类判分逻辑、节点排序判分逻辑、等级计算
2. **集成测试** — API端到端（提交答案→更新进度→获取进度）
3. **交互测试** — 拖拽功能、步骤切换、断点续修
4. **Seed数据验证** — 13部典籍碎片总数、题目数、节点数是否符合设计
