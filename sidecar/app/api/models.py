from __future__ import annotations

from fastapi import APIRouter

from app.services.ollama_service import list_models, status
from app.utils.response import ok

router = APIRouter(prefix="/api/v1/models/ollama", tags=["models"])


@router.get("/status")
def ollama_status() -> dict:
    return ok(status())


@router.get("/list")
def ollama_list() -> dict:
    return ok({"models": list_models()})
