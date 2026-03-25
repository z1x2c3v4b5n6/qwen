"""sidecar FastAPI 入口。"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.runtime import router as runtime_router
from app.core.config import ensure_directories, load_config
from app.core.database import init_db
from app.utils.logger import setup_logger

cfg = load_config()
ensure_directories(cfg)
logger = setup_logger()

app = FastAPI(title="本地 AI 工作台 Sidecar", version=cfg.app_version)
app.include_router(health_router)
app.include_router(runtime_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    logger.info("sidecar 启动中，环境=%s，数据目录=%s", cfg.env_mode, cfg.data_dir)
    init_db()
    logger.info("数据库初始化完成")


@app.on_event("shutdown")
def on_shutdown() -> None:
    logger.info("sidecar 已关闭")
