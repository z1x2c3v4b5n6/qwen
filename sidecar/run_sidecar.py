"""sidecar 启动器：处理端口冲突并作为 runtime.json 唯一写入源。"""
from __future__ import annotations

import os
import socket

import uvicorn

from app.core.config import load_config, write_runtime_json


def find_available_port(host: str, start_port: int, max_tries: int) -> int:
    for offset in range(max_tries):
        port = start_port + offset
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            if sock.connect_ex((host, port)) != 0:
                return port
    raise RuntimeError(f"端口冲突：从 {start_port} 起连续 {max_tries} 个端口不可用")


def write_runtime(host: str, port: int, status: str) -> None:
    pid = os.getpid()
    write_runtime_json(
        {
            "host": host,
            "port": port,
            "base_url": f"http://{host}:{port}",
            "pid": pid,
            "status": status,
        }
    )


def main() -> None:
    cfg = load_config()
    port = find_available_port(cfg.host, cfg.default_port, cfg.port_max_tries)

    # 标记启动中，并将实际端口共享给进程内其他模块（只读）
    os.environ["SIDECAR_ACTUAL_PORT"] = str(port)
    write_runtime(cfg.host, port, status="starting")

    try:
        write_runtime(cfg.host, port, status="online")
        uvicorn.run("app.main:app", host=cfg.host, port=port, reload=cfg.env_mode == "development")
    finally:
        write_runtime(cfg.host, port, status="offline")


if __name__ == "__main__":
    main()
