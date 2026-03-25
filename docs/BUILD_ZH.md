# BUILD（当前阶段）

## 当前重点
本阶段先保证本机真实联调，不进入 externalBin 一体化打包。

## 前端构建
```powershell
cd frontend
npm install
npm run build
```

## sidecar 运行
```powershell
cd sidecar
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_sidecar.py
```

## Tauri 开发运行
```powershell
cargo tauri dev
```

## 本机联调检查清单

1. health 检查
```powershell
curl http://127.0.0.1:18080/api/v1/health
```

2. runtime 检查
```powershell
curl http://127.0.0.1:18080/api/v1/runtime
```

3. Ollama status/list 检查
```powershell
curl http://127.0.0.1:18080/api/v1/models/ollama/status
curl http://127.0.0.1:18080/api/v1/models/ollama/list
```

4. chat 检查（先创建 workspace 和 conversation）
```powershell
curl -X POST http://127.0.0.1:18080/api/v1/chat -H "Content-Type: application/json" -d "{\"workspace_id\":\"<id>\",\"conversation_id\":\"<id>\",\"user_message\":\"你好\"}"
```

5. knowledge upload/search 检查
```powershell
curl -X POST http://127.0.0.1:18080/api/v1/knowledge/upload -F "workspace_id=<id>" -F "file=@demo.md"
curl "http://127.0.0.1:18080/api/v1/knowledge/search?workspace_id=<id>&q=关键词"
```
