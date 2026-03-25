"""sidecar 启动器：处理端口冲突、写入运行时端口。"""
from __future__ import annotations

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


def main() -> None:
    cfg = load_config()
    port = find_available_port(cfg.host, cfg.default_port, cfg.port_max_tries)
    write_runtime_json(port, status="starting")
    uvicorn.run("app.main:app", host=cfg.host, port=port, reload=cfg.env_mode == "development")


if __name__ == "__main__":
    main()
