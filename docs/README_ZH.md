# 本地 AI 工作台（第二阶段骨架）

这是一个面向 Windows 单机用户的桌面端 AI 工作台骨架项目，当前阶段完成了：

- Tauri 2 桌面壳骨架
- React + TypeScript 中文基础界面
- Python FastAPI sidecar 健康检查服务
- SQLite 自动初始化
- 统一运行时配置（`runtime.json`）
- sidecar 基础生命周期机制（端口冲突处理、状态落盘、日志落盘）

> 当前是第二阶段，不包含真实聊天、Ollama 对话、PDF 解析、导出功能。

## 技术栈

- 桌面壳：Tauri 2
- 前端：React + TypeScript
- sidecar：Python 3.11.x + FastAPI
- 数据库：SQLite

## 目录说明

- `frontend/`：前端工程
- `sidecar/`：FastAPI 本地服务
- `src-tauri/`：Tauri 桌面壳
- `data/`：开发态数据目录（数据库、日志、运行时配置）
- `docs/`：中文文档

## 统一运行时配置

- 统一配置源：`frontend/public/runtime.json`
- sidecar 启动时会自动写入实际端口、状态和 base_url
- 前端只读取该文件来访问 `/api/v1/health`，避免地址硬编码散落

## 开发态与发布态目录

- 开发态：`./data`
- 发布态：`%LOCALAPPDATA%/ai-workbench`

差异原因：开发态方便调试查看；发布态符合 Windows 应用数据规范。
