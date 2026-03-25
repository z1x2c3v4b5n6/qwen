from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.core.database import db_cursor


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def list_conversations(workspace_id: str) -> list[dict]:
    with db_cursor() as cur:
        rows = cur.execute(
            """
            SELECT id,workspace_id,title,last_message_at,created_at,updated_at
            FROM conversations WHERE workspace_id=?
            ORDER BY updated_at DESC
            """,
            (workspace_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def get_conversation(conversation_id: str) -> dict | None:
    with db_cursor() as cur:
        row = cur.execute(
            "SELECT id,workspace_id,title,last_message_at,created_at,updated_at FROM conversations WHERE id=?",
            (conversation_id,),
        ).fetchone()
        return dict(row) if row else None


def create_conversation(workspace_id: str, title: str) -> dict:
    conversation_id = str(uuid4())
    ts = now_iso()
    with db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO conversations(id,workspace_id,title,last_message_at,created_at,updated_at)
            VALUES(?,?,?,?,?,?)
            """,
            (conversation_id, workspace_id, title, None, ts, ts),
        )
    return get_conversation(conversation_id)  # type: ignore[return-value]


def rename_conversation(conversation_id: str, title: str) -> dict | None:
    ts = now_iso()
    with db_cursor() as cur:
        cur.execute("UPDATE conversations SET title=?,updated_at=? WHERE id=?", (title, ts, conversation_id))
    return get_conversation(conversation_id)


def delete_conversation(conversation_id: str) -> bool:
    with db_cursor() as cur:
        res = cur.execute("DELETE FROM conversations WHERE id=?", (conversation_id,))
        return res.rowcount > 0


def touch_conversation(conversation_id: str) -> None:
    ts = now_iso()
    with db_cursor() as cur:
        cur.execute(
            "UPDATE conversations SET last_message_at=?,updated_at=? WHERE id=?",
            (ts, ts, conversation_id),
        )
