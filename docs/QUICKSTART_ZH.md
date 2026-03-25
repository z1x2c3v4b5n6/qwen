# 快速开始（Windows / 第二阶段补丁版）

## 0. 先明确当前限制

当前阶段：
- 需要先**手动启动 sidecar**
- Tauri 当前**不会自动拉起 sidecar**
- 尚未完成 externalBin 一体化打包

## 1. 环境准备

请先安装：

1. Node.js 20+
2. npm（随 Node 安装）
3. Python **3.11.x**（建议 3.11.9）
4. Rust（含 cargo）
5. Tauri 2 所需 Windows 构建依赖（Visual Studio C++ Build Tools / WebView2）

## 2. 启动 sidecar（固定 requirements.txt）

> 依赖管理固定使用 `requirements.txt`，不使用 uv。

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

sidecar 启动后会：
- 自动选择可用端口（默认从 18080 开始）
- 只由 `run_sidecar.py` 写入 runtime.json（避免端口被覆盖）
- 初始化 SQLite（`data/app.db`）
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

## 5. 端口冲突最小验证（必做）

### 步骤 A：人为占用 18080

```powershell
python -m http.server 18080
```

### 步骤 B：再启动 sidecar

```powershell
cd sidecar
python run_sidecar.py
```

### 步骤 C：确认自动回退到 18081（或更高）

1. 查看 `data/runtime.json` 中 `port`
2. 查看 `base_url` 是否变为 `http://127.0.0.1:18081`（示例）
3. 前端页面显示的当前 sidecar 地址是否一致

## 6. 验收检查（第二阶段）

1. Tauri 窗口可打开
2. sidecar 可运行
3. `/api/v1/health` 可访问
4. SQLite 自动初始化成功
5. 前端显示中文基础页面与健康状态
6. 端口冲突时 runtime.json 不会被写回 default_port
