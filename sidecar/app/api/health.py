"""健康检查接口。"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import load_config

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health")
def health_check() -> dict:
    cfg = load_config()
    return {
        "status": "ok",
        "service": "sidecar",
        "version": cfg.app_version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "env_mode": cfg.env_mode,
        "data_dir": str(cfg.data_dir),
        "db_path": str(cfg.db_path),
    }
