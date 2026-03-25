# 第二阶段联调启动脚本（PowerShell）
Write-Host "[1/2] 启动 sidecar..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd sidecar; .\\.venv\\Scripts\\Activate.ps1; python run_sidecar.py"

Write-Host "[2/2] 启动前端..."
cd frontend
npm run dev
