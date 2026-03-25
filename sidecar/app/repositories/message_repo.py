from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.core.database import db_cursor


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def list_messages(conversation_id: str) -> list[dict]:
    with db_cursor() as cur:
        rows = cur.execute(
            "SELECT id,conversation_id,role,content,model_name,created_at FROM messages WHERE conversation_id=? ORDER BY created_at ASC",
            (conversation_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def add_message(conversation_id: str, role: str, content: str, model_name: str | None = None) -> dict:
    message_id = str(uuid4())
    ts = now_iso()
    with db_cursor() as cur:
        cur.execute(
            "INSERT INTO messages(id,conversation_id,role,content,model_name,created_at) VALUES(?,?,?,?,?,?)",
            (message_id, conversation_id, role, content, model_name, ts),
        )
        row = cur.execute(
            "SELECT id,conversation_id,role,content,model_name,created_at FROM messages WHERE id=?",
            (message_id,),
        ).fetchone()
    return dict(row)
