"""统一响应格式与错误定义。"""
from __future__ import annotations

from dataclasses import dataclass

from fastapi import HTTPException


@dataclass(frozen=True)
class ErrorInfo:
    code: str
    message: str
    status_code: int = 400


ERRORS = {
    "OLLAMA_UNAVAILABLE": ErrorInfo("OLLAMA_UNAVAILABLE", "未检测到 Ollama 服务，请先启动 Ollama 后重试。", 503),
    "WORKSPACE_NOT_FOUND": ErrorInfo("WORKSPACE_NOT_FOUND", "未找到指定工作区。", 404),
    "CONVERSATION_NOT_FOUND": ErrorInfo("CONVERSATION_NOT_FOUND", "未找到指定会话。", 404),
    "INVALID_FILE_TYPE": ErrorInfo("INVALID_FILE_TYPE", "仅支持上传 .txt 或 .md 文件。", 400),
    "FILE_TOO_LARGE": ErrorInfo("FILE_TOO_LARGE", "文件大小超过限制（最大 5MB）。", 400),
    "DUPLICATE_DOCUMENT": ErrorInfo("DUPLICATE_DOCUMENT", "该工作区已存在相同内容文件，已拒绝重复导入。", 409),
    "INTERNAL_ERROR": ErrorInfo("INTERNAL_ERROR", "系统内部错误，请稍后重试。", 500),
}


def ok(data):
    return {"success": True, "data": data}


def fail(code: str, message: str | None = None, status_code: int | None = None) -> HTTPException:
    info = ERRORS.get(code, ERRORS["INTERNAL_ERROR"])
    return HTTPException(
        status_code=status_code or info.status_code,
        detail={"success": False, "error": {"code": code, "message": message or info.message}},
    )
