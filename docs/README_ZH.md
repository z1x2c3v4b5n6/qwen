# 本地 AI 工作台（第四阶段：结构整理回合）

## 当前阶段完成情况

### 已完成
- 前端组件化拆分（WorkspacePanel / ConversationPanel / ChatPanel / KnowledgePanel / StatusPanel）
- 第三阶段 A 能力保持可用：Ollama 检测、工作区/会话 CRUD、非流式聊天、txt/md 上传与 FTS 检索
- 统一运行时配置读取（开发态 runtime.json + 发布态 Tauri bridge）

### 本回合未做（仍禁止）
- 流式聊天
- PDF 解析
- 导出 Markdown/PDF
- embedding / RAG
- externalBin 一体化打包
- sidecar 自动拉起

## 目录变化（前端）
- `frontend/src/components/WorkspacePanel.tsx`
- `frontend/src/components/ConversationPanel.tsx`
- `frontend/src/components/ChatPanel.tsx`
- `frontend/src/components/KnowledgePanel.tsx`
- `frontend/src/components/StatusPanel.tsx`
- `frontend/src/hooks/useWorkbench.ts`

## 真实运行链路
1. 先启动 Ollama
2. 再启动 sidecar
3. 再启动前端（或 Tauri dev）
4. 在页面中检查健康状态、Ollama 状态、模型信息
