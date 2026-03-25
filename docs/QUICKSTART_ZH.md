# QUICKSTART（Windows）

## 1. 启动 Ollama

```powershell
ollama serve
```

检查是否可用：

```powershell
curl http://127.0.0.1:11434/api/tags
```

如果返回模型列表 JSON，说明 Ollama 正常。

## 2. 启动 sidecar

```powershell
cd sidecar
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_sidecar.py
```

检查 sidecar：

```powershell
curl http://127.0.0.1:18080/api/v1/health
curl http://127.0.0.1:18080/api/v1/runtime
```

> 如果 18080 被占用，sidecar 会自动切换端口；请以 `data/runtime.json` 的 `base_url` 为准。

## 3. 启动前端

```powershell
cd frontend
npm install
npm run dev
```

## 4. 启动 Tauri dev（可选）

```powershell
cargo tauri dev
```

## 5. 常见报错排查

- **OLLAMA_UNAVAILABLE**：确认 `ollama serve` 是否已运行。
- **WORKSPACE_NOT_FOUND / CONVERSATION_NOT_FOUND**：检查是否已创建并选择对应工作区/会话。
- **INVALID_FILE_TYPE**：仅支持 `.txt` / `.md`。
- **FILE_TOO_LARGE**：文件超过 5MB。
- **DUPLICATE_DOCUMENT**：同一工作区内重复上传相同内容文件。
