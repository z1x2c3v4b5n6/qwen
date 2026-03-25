# QUICKSTART（Windows）

## 严格联调顺序（请按顺序执行）

### 1）启动 Ollama

```powershell
ollama serve
```

### 2）检查 Ollama 接口

```powershell
curl http://127.0.0.1:11434/api/tags
```

返回模型列表 JSON 代表 Ollama 服务可用。

### 3）启动 sidecar

```powershell
cd sidecar
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_sidecar.py
```

### 4）检查 health/runtime

```powershell
curl http://127.0.0.1:18080/api/v1/health
curl http://127.0.0.1:18080/api/v1/runtime
```

> 如 18080 占用，sidecar 会自动切换端口；请以 `data/runtime.json` 的 `base_url` 为准。

### 5）启动前端

```powershell
cd frontend
npm install
npm run dev
```

### 6）启动 Tauri dev（可选）

```powershell
cargo tauri dev
```

### 7）验证聊天与知识库

- 创建工作区 -> 创建会话 -> 发送一条聊天消息
- 上传 txt/md 文档 -> 执行关键词检索

---

## 常见问题排查

1. **Ollama 未启动**
   - 现象：`OLLAMA_UNAVAILABLE`
   - 处理：执行 `ollama serve` 并重新请求 `/api/tags`

2. **模型列表为空**
   - 现象：`/api/v1/models/ollama/list` 返回空数组
   - 处理：先拉取至少一个模型，如 `ollama pull qwen2.5:7b`

3. **sidecar 端口冲突**
   - 现象：18080 无响应
   - 处理：查看 `data/runtime.json` 中实际 `base_url`

4. **conversation 不存在**
   - 现象：`CONVERSATION_NOT_FOUND`
   - 处理：先创建会话，再调用 `/api/v1/chat`

5. **上传文件被拒绝**
   - 现象：`INVALID_FILE_TYPE` / `FILE_TOO_LARGE` / `DUPLICATE_DOCUMENT`
   - 处理：仅上传 `.txt/.md`、不超过 5MB、避免同一工作区重复内容

6. **FTS 搜不到结果**
   - 现象：检索空结果
   - 处理：确认文档已上传成功，尝试更短关键词或文档原文中的精确词
