# 快速开始（Windows）

## 1. 环境准备

请先安装：

1. Node.js 20+
2. npm（随 Node 安装）
3. Python **3.11.x**（建议 3.11.9）
4. Rust（含 cargo）
5. Tauri 2 所需 Windows 构建依赖（Visual Studio C++ Build Tools / WebView2）

## 2. 启动 sidecar（固定 requirements.txt 方式）

> 依赖管理固定为 `requirements.txt`，不使用 uv。

### PowerShell

```powershell
cd sidecar
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python run_sidecar.py
```

### CMD

```cmd
cd sidecar
py -3.11 -m venv .venv
.\.venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
python run_sidecar.py
```

启动后会自动：
- 检查端口冲突并选择可用端口
- 初始化 SQLite（`data/app.db`）
- 写入运行时配置（`data/runtime.json` 与 `frontend/public/runtime.json`）
- 写日志到 `data/logs/sidecar.log`

## 3. 启动前端

```powershell
cd frontend
npm install
npm run dev
```

## 4. 启动 Tauri（可选）

```powershell
cargo tauri dev
```

## 5. 验收检查（第二阶段）

1. Tauri 窗口可打开
2. 前端页面显示中文标题
3. 页面能显示 sidecar 在线/离线状态
4. `http://127.0.0.1:<实际端口>/api/v1/health` 可返回 JSON
5. 项目根目录存在 `data/app.db`
