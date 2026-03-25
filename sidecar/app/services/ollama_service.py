from __future__ import annotations

import json
import urllib.error
import urllib.request

from app.utils.response import fail

OLLAMA_BASE = "http://127.0.0.1:11434"


def _request_json(path: str, method: str = "GET", payload: dict | None = None) -> dict:
    url = f"{OLLAMA_BASE}{path}"
    data = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(url=url, method=method, data=data)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except Exception as exc:
        raise fail("OLLAMA_UNAVAILABLE", f"Ollama 不可用：{exc}") from exc


def status() -> dict:
    tags = _request_json("/api/tags")
    return {"available": True, "base_url": OLLAMA_BASE, "model_count": len(tags.get("models", []))}


def list_models() -> list[dict]:
    tags = _request_json("/api/tags")
    return tags.get("models", [])


def chat(model: str, messages: list[dict]) -> str:
    resp = _request_json(
        "/api/chat",
        method="POST",
        payload={"model": model, "messages": messages, "stream": False},
    )
    message = resp.get("message", {})
    content = message.get("content", "")
    if not content:
        raise fail("INTERNAL_ERROR", "Ollama 返回内容为空。")
    return content
