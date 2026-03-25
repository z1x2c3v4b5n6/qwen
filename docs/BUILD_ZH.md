# 构建说明（第二阶段补丁版）

## 当前状态说明（避免误解）

本阶段目标是“开发态闭环稳定 + 发布态路径方案明确”，不是完整一体化交付。

### 已完成

- 前端可构建
- Tauri 壳可构建
- sidecar 可单独运行
- 发布态 runtime 配置读取桥接方案（Tauri `get_runtime_config`）

### 未完成

- Tauri 自动拉起 sidecar
- sidecar externalBin 打包进安装包
- 安装后开箱即用的一体化 sidecar 生命周期管理

## 1. 前端构建

```powershell
cd frontend
npm install
npm run build
```

产物目录：`frontend/dist`

## 2. sidecar 运行（本阶段）

```powershell
cd sidecar
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_sidecar.py
```

## 3. Tauri 构建

```powershell
cargo tauri build
```

安装包产物通常位于：
- `src-tauri/target/release/bundle/`

## 4. 发布态配置读取方案

- 前端不再依赖打包静态 `/runtime.json`
- 前端统一调用 runtime service
- runtime service 在 Tauri 环境下调用 Rust 命令 `get_runtime_config`
- Rust 从应用数据目录读取真实 `runtime.json` 并返回

## 5. 第四阶段计划（再做）

- sidecar 打包为独立可执行文件
- externalBin 配置与生命周期接入
- 真正一体化安装包交付
