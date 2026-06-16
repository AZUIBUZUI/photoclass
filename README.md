# PhotoClass — 审美样片分类管理工具

批量导入图片 → 快捷键打标签 → 建立审美参考库 → 📊 统计分析

[![Platform](https://img.shields.io/badge/platform-Windows-blue)](https://github.com)
[![Electron](https://img.shields.io/badge/Electron-33-8b5cf6)](https://www.electronjs.org/)

## ✨ 功能特点

- **批量导入**：支持文件夹递归导入、多文件选取，自动去重
- **快捷键分类**：3 个标签维度（构图/光影/情绪）× 8 个标签，键盘一键标注
- **评分系统**：数字键 1-5 评分星星，支持收藏
- **多维度筛选**：按标签、评分、收藏状态组合筛选
- **统计看板**：标签使用频率图表 + 评分分布图表 + 分类进度
- **图片浏览**：网格缩略图 / 全屏查看器，支持缩放
- **导出功能**：复制/移动文件、HTML 画册、CSV 数据表格
- **自定义扩展**：维度、标签、快捷键均可自定义

## 🎮 默认快捷键

| 分类 | 按键 | 功能 |
|------|------|------|
| 评分 | `1` `2` `3` `4` `5` | 1-5 星评分 |
| 评分 | `0` | 清除评分 |
| 收藏 | `` ` `` | 切换收藏 |
| 构图 | `Ctrl+1` ~ `Ctrl+8` | 三分法/对称/引导线/框架/留白/对角线/中心/散点 |
| 光影 | `Alt+1` ~ `Alt+8` | 顺光/侧光/逆光/柔光/硬光/剪影/低调/高调 |
| 情绪 | `Ctrl+Shift+1` ~ `Ctrl+Shift+8` | 宁静/热烈/忧郁/神秘/欢快/庄重/孤独/温暖 |
| 导航 | `←` `→` | 上一张/下一张 |
| 查看 | `F` | 全屏 |
| 缩放 | `Ctrl+=` `Ctrl+-` `Ctrl+0` | 放大/缩小/还原 |
| 导入 | `Ctrl+I` | 导入图片 |
| 删除 | `Delete` | 移除当前图片 |

## 📦 安装方式

### 方式一：安装程序（推荐）

从 [Releases](../../releases) 下载 `PhotoClass_Setup_1.0.0.exe`，双击安装。

### 方式二：便携版

从 [Releases](../../releases) 下载 `release-win-unpacked.zip`，解压到任意目录，运行 `PhotoClass.exe`。

### 方式三：开发者运行

```bash
# 环境要求
Node.js 18+
npm 9+

# 克隆仓库
git clone https://github.com/<your-username>/photoclass.git
cd photoclass

# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 打包
npm run package
```

## 🏗️ 技术架构

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron 33 |
| 前端 | React 18 + React Router + Recharts |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS |
| 数据库 | SQLite (better-sqlite3) |
| 图片处理 | Sharp |
| 构建工具 | electron-vite + electron-builder |

## 📁 项目结构

```
photoclass/
├── src/
│   ├── main/            # Electron 主进程
│   │   ├── ipc/         # IPC 通信处理
│   │   ├── db/          # 数据库定义 & 迁移
│   │   └── services/    # 导入/导出/图片处理
│   ├── preload/         # 预加载脚本
│   ├── renderer/        # 前端 UI
│   │   ├── pages/       # 页面：浏览/对比/统计/设置
│   │   ├── components/  # 组件：网格/标签/评分/过滤
│   │   ├── stores/      # Zustand 状态
│   │   └── features/    # 快捷键/路由
│   └── shared/          # 共享常量 & 默认配置
├── resources/           # 安装包资源
└── electron-builder.yml # 打包配置
```

## 📄 License

MIT License

## 🔗 相关链接

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Recharts](https://recharts.org/)
