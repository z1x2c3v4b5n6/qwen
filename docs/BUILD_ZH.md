# 构建说明（第二阶段）

## 构建目标

本阶段目标是可打包基础桌面壳，不包含完整 AI 功能。

## 1. 前端构建

```powershell
cd frontend
npm install
npm run build
```

产物目录：`frontend/dist`

## 2. sidecar 构建（当前阶段）

第二阶段可先用 Python 环境运行 sidecar，不强制生成最终独立 exe。

```powershell
cd sidecar
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_sidecar.py
```

> 第四阶段再补充 sidecar 独立可执行文件打包流程并接入 Tauri bundling。

## 3. Tauri 构建

```powershell
cargo tauri build
```

安装包产物通常位于：
- `src-tauri/target/release/bundle/`

## 4. 关键检查点

- `frontend/dist` 是否生成
- Tauri 构建是否成功
- sidecar 是否可独立启动
- `data/runtime.json` 是否包含实际端口
