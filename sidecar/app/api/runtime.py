"""运行时状态调试接口。"""
from __future__ import annotations

from fastapi import APIRouter

from app.core.config import read_runtime_json

router = APIRouter(prefix="/api/v1", tags=["runtime"])


@router.get("/runtime")
def runtime_status() -> dict:
    return read_runtime_json()
