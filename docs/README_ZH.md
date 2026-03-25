# 本地 AI 工作台（第二阶段补丁版）

## 当前阶段定位（请先看）

本项目当前是**第二阶段骨架 + 补丁回合**，目标是把开发态闭环做稳，不夸大为已完成一体化。

### 已完成

- Tauri 2 桌面壳骨架（可打开窗口）
- React + TypeScript 中文基础页面
- Python FastAPI sidecar 基础服务
- SQLite 自动初始化（含核心表）
- `/api/v1/health` 与 `/api/v1/runtime` 诊断接口
- 统一运行时配置读取入口（前端只走一个 runtime service）
- 开发态端口冲突回退与 runtime.json 同步

### 未完成（本阶段明确不做）

- Tauri 自动拉起 sidecar（当前仍需手动先启动 sidecar）
- sidecar 打包进安装包并由 Tauri externalBin 一体化管理
- 流式聊天
- Ollama 真正对话调用
- PDF 解析
- 导出 Markdown / PDF
- 完整 RAG / embedding pipeline

## 目录说明

- `frontend/`：前端工程（中文基础页 + 统一 runtime 读取）
- `sidecar/`：FastAPI 服务（健康接口、运行时接口、SQLite 初始化）
- `src-tauri/`：Tauri 桌面壳（提供 `get_runtime_config` 桥接命令）
- `data/`：开发态数据目录（db、logs、runtime.json）
- `docs/`：中文文档

## 开发态与发布态配置读取链

### 开发态

`run_sidecar.py` -> 写 `data/runtime.json` + 同步 `frontend/public/runtime.json` -> 前端 runtime service 读 `/runtime.json` -> 调 `/api/v1/health`

### 发布态（方案已落地到前端读取入口）

前端 runtime service -> 调 Tauri 命令 `get_runtime_config` -> Rust 读取应用数据目录 `runtime.json` -> 返回真实 `base_url`

> 注意：发布态方案已给出读取链与代码入口；但“sidecar 打包进安装包 + 自动拉起”仍未完成。
