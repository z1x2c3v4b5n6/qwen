# 本地 AI 工作台（第五阶段：真实联调验证回合）

## 当前回合目标

- 不新增核心功能
- 聚焦“本机真实跑通”
- 补充联调检查与调试信息展示

## 已完成

- 前端组件化拆分（WorkspacePanel / ConversationPanel / ChatPanel / KnowledgePanel / StatusPanel）
- 前端新增联调检查清单展示（界面内）
- 前端新增最小调试信息展示：base_url、health、Ollama、当前 workspace/conversation
- 文档补全：严格联调顺序 + 常见故障排查

## 本回合未做（仍禁止）

- 流式聊天
- PDF 解析
- 导出 Markdown/PDF
- embedding / RAG
- externalBin 一体化打包
- sidecar 自动拉起

## 真实运行链路
1. 先启动 Ollama
2. 检查 Ollama 接口
3. 启动 sidecar
4. 检查 health/runtime
5. 启动前端
6. 启动 Tauri dev（可选）
7. 验证聊天与知识库
