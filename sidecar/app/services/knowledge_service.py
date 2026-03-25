from __future__ import annotations

import hashlib
import json
from pathlib import Path

from app.core.config import load_config
from app.repositories.document_repo import (
    create_document,
    delete_document,
    delete_document_chunks_and_fts,
    get_document_by_hash,
    insert_chunks_and_fts,
    list_documents,
    search_chunks,
)
from app.repositories.workspace_repo import get_workspace
from app.utils.response import fail

MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_SUFFIX = {".txt", ".md"}


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _chunk_text(text: str, chunk_size: int = 800) -> list[dict]:
    chunks: list[dict] = []
    idx = 0
    start = 0
    while start < len(text):
        content = text[start : start + chunk_size]
        chunks.append(
            {
                "chunk_index": idx,
                "content": content,
                "token_estimate": max(1, len(content) // 4),
                "metadata_json": json.dumps({"start": start, "end": start + len(content)}, ensure_ascii=False),
            }
        )
        idx += 1
        start += chunk_size
    return chunks


def save_upload(workspace_id: str, file_name: str, file_bytes: bytes) -> dict:
    if not get_workspace(workspace_id):
        raise fail("WORKSPACE_NOT_FOUND")

    suffix = Path(file_name).suffix.lower()
    if suffix not in ALLOWED_SUFFIX:
        raise fail("INVALID_FILE_TYPE")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise fail("FILE_TOO_LARGE")

    digest = _sha256(file_bytes)
    if get_document_by_hash(workspace_id, digest):
        raise fail("DUPLICATE_DOCUMENT")

    cfg = load_config()
    ws_dir = cfg.data_dir / "files" / workspace_id
    ws_dir.mkdir(parents=True, exist_ok=True)
    target = ws_dir / file_name
    target.write_bytes(file_bytes)

    text = file_bytes.decode("utf-8", errors="ignore")
    if not text.strip():
        raise fail("INTERNAL_ERROR", "文件内容为空，无法建立检索索引。")

    doc = create_document(workspace_id, file_name, str(target), suffix.lstrip("."), len(file_bytes), digest)
    chunks = _chunk_text(text)
    insert_chunks_and_fts(document_id=doc["id"], workspace_id=workspace_id, chunks=chunks)
    return {"document": doc, "chunk_count": len(chunks)}


def remove_document(document_id: str) -> bool:
    delete_document_chunks_and_fts(document_id)
    return delete_document(document_id)


def get_documents(workspace_id: str) -> list[dict]:
    if not get_workspace(workspace_id):
        raise fail("WORKSPACE_NOT_FOUND")
    return list_documents(workspace_id)


def search(workspace_id: str, q: str, limit: int = 8) -> list[dict]:
    if not get_workspace(workspace_id):
        raise fail("WORKSPACE_NOT_FOUND")
    if not q.strip():
        return []
    return search_chunks(workspace_id, q.strip(), limit)
