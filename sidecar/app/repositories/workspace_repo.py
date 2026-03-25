from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.core.database import db_cursor


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def list_workspaces() -> list[dict]:
    with db_cursor() as cur:
        rows = cur.execute(
            "SELECT id,name,description,default_model,system_prompt,created_at,updated_at FROM workspaces ORDER BY updated_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]


def get_workspace(workspace_id: str) -> dict | None:
    with db_cursor() as cur:
        row = cur.execute(
            "SELECT id,name,description,default_model,system_prompt,created_at,updated_at FROM workspaces WHERE id=?",
            (workspace_id,),
        ).fetchone()
        return dict(row) if row else None


def create_workspace(name: str, description: str, default_model: str, system_prompt: str) -> dict:
    workspace_id = str(uuid4())
    ts = now_iso()
    with db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO workspaces(id,name,description,default_model,system_prompt,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?)
            """,
            (workspace_id, name, description, default_model, system_prompt, ts, ts),
        )
    return get_workspace(workspace_id)  # type: ignore[return-value]


def update_workspace(workspace_id: str, name: str, description: str, default_model: str, system_prompt: str) -> dict | None:
    ts = now_iso()
    with db_cursor() as cur:
        cur.execute(
            """
            UPDATE workspaces
            SET name=?,description=?,default_model=?,system_prompt=?,updated_at=?
            WHERE id=?
            """,
            (name, description, default_model, system_prompt, ts, workspace_id),
        )
    return get_workspace(workspace_id)


def delete_workspace(workspace_id: str) -> bool:
    with db_cursor() as cur:
        res = cur.execute("DELETE FROM workspaces WHERE id=?", (workspace_id,))
        return res.rowcount > 0
