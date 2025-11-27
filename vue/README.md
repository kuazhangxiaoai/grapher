# G6 知识图谱可视化系统

基于 Vue 3 + TypeScript + G6 + Arco Design 构建的知识图谱可视化系统，支持多种布局方式、节点交互、路径分析等功能。

## 功能特性

- 🎨 多种布局方式
  - Force 力导向布局
  - Radial 辐射布局
  - Dagre 层次布局
  - Concentric 同心圆布局
  - Grid 网格布局
  - Circular 环形布局
  - Fruchterman 布局

- 🔍 交互功能
  - 节点拖拽
  - 画布缩放
  - 画布平移
  - 节点选择
  - 边创建
  - 右键菜单

- 📊 分析功能
  - 最短路径分析
  - 路径高亮
  - 节点搜索
  - 数据导出

- 🛠️ 工具栏功能
  - 布局切换
  - 全屏显示
  - 撤销/重做
  - 图片下载
  - 数据导出

## 技术栈

- Vue 3
- TypeScript
- Vite
- G6 5.0
- Arco Design Vue
- TailwindCSS

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 7

### 安装

```bash
# 克隆项目
git clone [项目地址]

# 进入项目目录
cd g6_arco_v3

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
src/
├── components/
│   └── GraphG6/
│       ├── components/        # 子组件
│       ├── customBehavior/    # 自定义行为
│       ├── customPlugins/     # 自定义插件
│       └── utils/            # 工具函数
├── assets/                   # 静态资源
└── App.vue                  # 根组件
```

## 主要功能说明

### 布局系统

支持多种布局方式，可以通过工具栏快速切换：

- Force: 力导向布局，适合展示节点间的关系
- Radial: 辐射布局，适合展示层级关系
- Dagre: 层次布局，适合展示有向图
- Concentric: 同心圆布局，适合展示中心节点
- Grid: 网格布局，适合展示规整的数据
- Circular: 环形布局，适合展示循环关系
- Fruchterman: 力导向布局的变体，适合大规模数据

### 交互系统

- 节点拖拽：支持拖拽节点调整位置
- 画布操作：支持缩放、平移等基础操作
- 节点选择：支持单选、多选节点
- 边创建：支持通过拖拽创建边
- 右键菜单：支持通过右键菜单添加节点

### 分析功能

- 最短路径：支持计算并高亮显示两个节点间的最短路径
- 路径分析：支持分析节点间的所有可能路径
- 数据导出：支持导出图谱数据为 CSV 格式
