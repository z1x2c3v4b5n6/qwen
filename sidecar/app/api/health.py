"""健康检查接口。"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import load_config, read_runtime_json
from app.utils.response import ok

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health")
def health_check() -> dict:
    cfg = load_config()
    runtime = read_runtime_json()
    return ok(
        {
            "status": "ok",
            "service": "sidecar",
            "app_name": cfg.app_name,
            "version": cfg.app_version,
            "mode": cfg.env_mode,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "runtime_base_url": runtime.get("base_url"),
            "runtime_port": runtime.get("port"),
            "database_path": str(cfg.db_path),
            "data_dir": str(cfg.data_dir),
        }
    )
