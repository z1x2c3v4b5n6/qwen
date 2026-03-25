"""sidecar FastAPI 入口。"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.chat import router as chat_router
from app.api.conversations import router as conversations_router
from app.api.health import router as health_router
from app.api.knowledge import router as knowledge_router
from app.api.models import router as models_router
from app.api.runtime import router as runtime_router
from app.api.workspaces import router as workspaces_router
from app.core.config import ensure_directories, load_config
from app.core.database import init_db
from app.utils.logger import setup_logger

cfg = load_config()
ensure_directories(cfg)
logger = setup_logger()

app = FastAPI(title="本地 AI 工作台 Sidecar", version=cfg.app_version)
app.include_router(health_router)
app.include_router(runtime_router)
app.include_router(models_router)
app.include_router(workspaces_router)
app.include_router(conversations_router)
app.include_router(chat_router)
app.include_router(knowledge_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "success" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": {"code": "INTERNAL_ERROR", "message": str(exc.detail)}},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(_: Request, exc: Exception):
    logger.exception("未处理异常: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {"code": "INTERNAL_ERROR", "message": "系统内部错误，请稍后重试。"},
        },
    )


@app.on_event("startup")
def on_startup() -> None:
    logger.info("sidecar 启动中，环境=%s，数据目录=%s", cfg.env_mode, cfg.data_dir)
    init_db()
    logger.info("数据库初始化完成")


@app.on_event("shutdown")
def on_shutdown() -> None:
    logger.info("sidecar 已关闭")
