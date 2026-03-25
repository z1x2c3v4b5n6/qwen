"""应用配置：统一读取运行时配置，避免地址与端口散落。"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path


@dataclass
class AppConfig:
    app_name: str = "本地 AI 工作台"
    app_version: str = "0.1.0"
    host: str = "127.0.0.1"
    default_port: int = 18080
    port_max_tries: int = 10
    startup_timeout_seconds: int = 15
    health_poll_interval_seconds: int = 2
    env_mode: str = "development"
    project_root: Path = Path(__file__).resolve().parents[3]

    @property
    def data_dir(self) -> Path:
        if self.env_mode == "development":
            return self.project_root / "data"

        local_appdata = os.getenv("LOCALAPPDATA")
        if local_appdata:
            return Path(local_appdata) / "ai-workbench"
        # 兼容非 Windows 调试环境
        return Path.home() / ".ai-workbench"

    @property
    def logs_dir(self) -> Path:
        return self.data_dir / "logs"

    @property
    def db_path(self) -> Path:
        return self.data_dir / "app.db"

    @property
    def runtime_json_path(self) -> Path:
        return self.data_dir / "runtime.json"

    @property
    def frontend_runtime_json_path(self) -> Path:
        return self.project_root / "frontend" / "public" / "runtime.json"


_config: AppConfig | None = None


def load_config() -> AppConfig:
    global _config
    if _config is not None:
        return _config

    env_mode = os.getenv("APP_ENV", "development").strip().lower()
    port = int(os.getenv("SIDECAR_PORT", "18080"))
    _config = AppConfig(env_mode=env_mode, default_port=port)
    return _config


def ensure_directories(cfg: AppConfig) -> None:
    cfg.data_dir.mkdir(parents=True, exist_ok=True)
    (cfg.data_dir / "files").mkdir(parents=True, exist_ok=True)
    (cfg.data_dir / "indexes").mkdir(parents=True, exist_ok=True)
    (cfg.data_dir / "exports").mkdir(parents=True, exist_ok=True)
    cfg.logs_dir.mkdir(parents=True, exist_ok=True)


def write_runtime_json(port: int, status: str = "starting") -> None:
    cfg = load_config()
    payload = {
        "host": cfg.host,
        "port": port,
        "base_url": f"http://{cfg.host}:{port}",
        "status": status,
        "env_mode": cfg.env_mode,
        "updated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    }

    cfg.runtime_json_path.parent.mkdir(parents=True, exist_ok=True)
    cfg.runtime_json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    # 开发态自动同步到前端统一配置源
    if cfg.env_mode == "development":
        cfg.frontend_runtime_json_path.parent.mkdir(parents=True, exist_ok=True)
        cfg.frontend_runtime_json_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
        )
