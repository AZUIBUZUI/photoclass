# muster.md

PhotoClass 审美样片分类管理工具 — 批量导入、快捷键分类、建立审美参考库。

## 技术栈

| 技术 | 用途 |
|------|------|
| Electron 33 | 桌面应用框架 |
| React 18 | UI 渲染 |
| electron-vite | 构建工具 (main + preload + renderer) |
| Tailwind CSS 3 | 样式系统 (深色主题) |
| Zustand | 全局状态管理 |
| react-window | 虚拟化缩略图网格 |
| Sharp | 图像处理 (缩略图生成、元数据) |
| better-sqlite3 | SQLite 数据库 |
| react-router-dom 6 | 页面路由 (MemoryRouter) |
| allotment | 分栏拖拽面板 |
| recharts | 统计图表 |

## 目录结构

```
src/
├── main/               # Electron 主进程
│   ├── index.js        # 应用入口
│   ├── windows.js      # 窗口管理
│   ├── protocol.js     # local:// 自定义协议
│   ├── globalShortcuts.js  # 全局快捷键
│   ├── ipc/index.js    # 所有 IPC 处理器 (核心)
│   ├── db/             # 数据库连接、迁移、Schema
│   ├── services/       # 图像导入、导出、迁移服务
│   └── utils/          # 路径、哈希、文件类型工具
├── preload/
│   └── index.js        # contextBridge API 暴露
├── renderer/           # React 渲染进程
│   ├── index.html
│   ├── main.jsx        # React 入口
│   ├── App.jsx         # 根组件 (MemoryRouter)
│   ├── router/index.jsx  # 路由配置
│   ├── stores/index.js # Zustand 全局 store
│   ├── pages/          # 页面组件
│   ├── components/     # UI 组件
│   │   ├── layout/     # AppShell, Sidebar, TitleBar, StatusBar
│   │   ├── grid/       # ThumbnailGrid, ThumbnailCell, GridToolbar
│   │   ├── viewer/     # ImageViewer, CompareView, CompareCell, ZoomControls
│   │   ├── tagging/    # TagPanel, TagChip, QuickTagBar, DimensionGroup, RatingStars
│   │   ├── filter/     # FilterBar
│   │   ├── annotation/ # NotePanel
│   │   └── common/     # Modal, ContextMenu, DropZone, Toast
│   ├── hooks/          # useObserver, useThumbnail, useDragDrop, usePaste
│   ├── features/       # useShortcuts
│   └── assets/styles/  # global.css (Tailwind)
└── shared/             # 主进程/渲染进程共享
    ├── ipcChannels.js  # IPC 通道常量
    ├── constants.js    # 应用常量
    └── tagDefaults.js  # 默认标签体系
```

## 核心架构模式

### IPC 通信模式
1. 在 `src/shared/ipcChannels.js` 定义通道常量 (`domain:action`)
2. 在 `src/main/ipc/index.js` 注册 `ipcMain.handle(channel, handler)`
3. 渲染进程调用 `window.api.invoke(channel, ...args)`
4. 事件推送：主进程 `win.webContents.send('event:xxx', data)`，渲染进程 `window.api.onXxx(callback)`
5. Preload 白名单自动放行所有 `IPC.*` 中不以 `event:` 开头的通道

### 自定义协议
- `local://thumbnails/<hash>.webp` → 缩略图缓存目录
- `local://file?p=<base64url>` → 原始图片文件
- 实现在 `src/main/protocol.js`，URL 编码在 `src/renderer/hooks/useThumbnail.js`

### 状态管理
- 单文件 Zustand store：`src/renderer/stores/index.js`
- 包含：images, currentId, selectedIds, zoom, fullscreen, filters, tags, UI 状态
- 模式：`useStore(s => s.fieldName)` 按需订阅

### 样式约定
- 仅深色主题 (dark-only)
- Tailwind 自定义颜色：`surface-{50..950}`, `accent-{400,500,600}`
- 字体大小：`text-2xs` (0.625rem), `text-xs`, `text-sm`
- 所有 UI 文案使用中文
- 圆角统一用 `rounded` / `rounded-lg` / `rounded-xl`
- 边框标准 `border-surface-700` / `border-surface-800`

### 命名规范
- 组件文件：PascalCase (`ImageViewer.jsx`)
- Hook 文件：camelCase，`use` 前缀 (`useThumbnail.js`)
- 工具/服务文件：camelCase (`image.service.js`)
- IPC 通道：`domain:action` (`image:list`, `tag:toggleOnImage`)
- 事件通道：`event:camelCase` (`event:shortcutTriggered`)

## 关键文件参考

| 文件 | 作用 |
|------|------|
| `src/main/ipc/index.js` | 所有后端逻辑入口 (600+ 行) |
| `src/main/services/image.service.js` | 图片导入、缩略图生成 |
| `src/renderer/stores/index.js` | 全局状态 |
| `src/renderer/pages/BrowsePage.jsx` | 主浏览页面 (Allotment 分栏) |
| `src/renderer/pages/ComparePage.jsx` | 图片对比页面 |
| `src/renderer/components/grid/ThumbnailGrid.jsx` | 虚拟化缩略图网格 |
| `src/renderer/components/viewer/ImageViewer.jsx` | 大图查看器 (缩放/平移) |
| `src/shared/ipcChannels.js` | IPC 通道注册表 |
| `src/preload/index.js` | 渲染进程 API 桥接 |

## 开发命令

```bash
npm run dev        # 启动开发服务器 (Vite HMR)
npm run build      # 生产构建
npm run package    # 构建 + 打包 exe
npm run preview    # 预览构建产物
npm run lint       # ESLint 检查
```

## 注意事项

- 添加新 IPC 通道必须先加入 `src/shared/ipcChannels.js`，preload 自动放行
- 主进程 handler 检查 `currentProjectDb` 非空（项目未打开时返回 error）
- Sharp 处理大图时先 resize 避免 OOM
- react-window Grid 需要提供 `rowCount`, `columnCount`, `columnWidth`, `rowHeight`
- Zustand 不可在 render 外调用 set/get（如 useEffect 内是安全的）
- `allotment` 分栏器需要在容器有明确高度时才能正常工作
