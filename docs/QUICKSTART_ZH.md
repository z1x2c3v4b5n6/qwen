# QUICKSTART（Windows）

## 第六阶段：本机手工验收清单（严格顺序）

> 目标：在你的 Windows 本机完整跑通 Ollama -> sidecar -> 前端/Tauri -> 业务链路。

### 1）启动 Ollama

```powershell
ollama serve
```

**预期结果**
- 终端保持运行，无报错。

**失败判断**
- 若提示命令不存在：Ollama 未安装或 PATH 未配置。

---

### 2）验证 Ollama 接口

```powershell
curl http://127.0.0.1:11434/api/tags
```

**预期结果**
- 返回 JSON（包含 `models` 字段）。

**失败判断**
- 连接失败：Ollama 没启动或端口被占。
- `models` 为空：服务在，但没有本地模型（先 `ollama pull qwen2.5:7b`）。

---

### 3）启动 sidecar

```powershell
cd sidecar
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_sidecar.py
```

**预期结果**
- sidecar 终端输出启动日志。
- 生成或更新 `data/runtime.json`。

**失败判断**
- Python 依赖错误：虚拟环境或 requirements 未正确安装。
- 端口冲突：sidecar 会自动切端口，后续以 `runtime.json` 为准。

---

### 4）验证 health/runtime

```powershell
curl http://127.0.0.1:18080/api/v1/health
curl http://127.0.0.1:18080/api/v1/runtime
```

> 若 18080 无响应，先看 `data/runtime.json` 的 `base_url`，再用实际端口重试。

**预期结果**
- `/health` 返回 `success: true`
- `/runtime` 返回 `success: true`，并包含 `base_url`、`status`。

**失败判断**
- health 失败：sidecar 未启动或启动异常。
- runtime 与前端地址不一致：前端未读取到最新 runtime。

---

### 5）启动前端

```powershell
cd frontend
npm install
npm run dev
```

**预期结果**
- 前端启动成功并显示本地地址（通常是 `http://localhost:1420`）。
- 页面能看到 base_url、health、Ollama 状态。

**失败判断**
- 依赖安装失败：网络策略或 npm 源问题。
- 页面显示离线：先回到第 4 步检查 health/runtime。

---

### 6）启动 Tauri dev（可选）

```powershell
cargo tauri dev
```

**预期结果**
- 桌面窗口打开并加载前端页面。

**失败判断**
- Rust/Tauri 构建依赖缺失（Windows C++ 工具链、WebView2 等）。

---

### 7）验证业务链路（workspace / conversation / chat / knowledge）

#### 7.1 Workspace create/list
```powershell
curl http://127.0.0.1:18080/api/v1/workspaces
curl -X POST http://127.0.0.1:18080/api/v1/workspaces -H "Content-Type: application/json" -d "{\"name\":\"验收工作区\",\"description\":\"\",\"default_model\":\"qwen2.5:7b\",\"system_prompt\":\"你是中文助手\"}"
```
**预期结果**：返回 `success: true`，列表中出现新工作区。

#### 7.2 Conversation create/list
```powershell
curl "http://127.0.0.1:18080/api/v1/conversations?workspace_id=<workspace_id>"
curl -X POST http://127.0.0.1:18080/api/v1/conversations -H "Content-Type: application/json" -d "{\"workspace_id\":\"<workspace_id>\",\"title\":\"验收会话\"}"
```
**预期结果**：返回 `success: true`，列表中出现新会话。

#### 7.3 Chat（非流式）
```powershell
curl -X POST http://127.0.0.1:18080/api/v1/chat -H "Content-Type: application/json" -d "{\"workspace_id\":\"<workspace_id>\",\"conversation_id\":\"<conversation_id>\",\"user_message\":\"你好\"}"
```
**预期结果**：返回 `success: true`，包含 assistant 回复。

#### 7.4 Knowledge upload/search
```powershell
curl -X POST http://127.0.0.1:18080/api/v1/knowledge/upload -F "workspace_id=<workspace_id>" -F "file=@demo.md"
curl "http://127.0.0.1:18080/api/v1/knowledge/search?workspace_id=<workspace_id>&q=关键词"
```
**预期结果**：上传成功后可检索到片段（或至少返回 success 且 items 数组）。

**失败判断**
- upload 报错：检查文件类型/大小/重复内容。
- search 空结果：检查关键词是否命中文档原文，或先确认上传是否成功。

---

## 问题定位顺序（建议按层排查）

1. **模型列表为空** -> 先查 Ollama（`/api/tags`）
2. **前端显示离线** -> 先查 runtime 与 health
3. **聊天失败** -> 先查 `conversation_id` 是否存在，再查 Ollama，再查消息是否写入
4. **知识库搜不到** -> 先查 upload 成功，再查 chunks/FTS 检索输入
5. **Tauri 页面异常** -> 先确认前端 dev 正常，再检查 Rust/Tauri 构建依赖
