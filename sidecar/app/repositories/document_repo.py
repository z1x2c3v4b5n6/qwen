from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.core.database import db_cursor


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_document_by_hash(workspace_id: str, hash_sha256: str) -> dict | None:
    with db_cursor() as cur:
        row = cur.execute(
            "SELECT * FROM documents WHERE workspace_id=? AND hash_sha256=?",
            (workspace_id, hash_sha256),
        ).fetchone()
        return dict(row) if row else None


def create_document(
    workspace_id: str,
    file_name: str,
    file_path: str,
    file_type: str,
    file_size: int,
    hash_sha256: str,
) -> dict:
    doc_id = str(uuid4())
    ts = now_iso()
    with db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO documents(id,workspace_id,file_name,file_path,file_type,file_size,hash_sha256,parse_status,index_status,error_message,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (doc_id, workspace_id, file_name, file_path, file_type, file_size, hash_sha256, "parsed", "indexed", None, ts, ts),
        )
        row = cur.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone()
    return dict(row)


def list_documents(workspace_id: str) -> list[dict]:
    with db_cursor() as cur:
        rows = cur.execute(
            "SELECT * FROM documents WHERE workspace_id=? ORDER BY updated_at DESC",
            (workspace_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def delete_document(document_id: str) -> bool:
    with db_cursor() as cur:
        res = cur.execute("DELETE FROM documents WHERE id=?", (document_id,))
        return res.rowcount > 0


def insert_chunks_and_fts(document_id: str, workspace_id: str, chunks: list[dict]) -> None:
    ts = now_iso()
    with db_cursor() as cur:
        for chunk in chunks:
            chunk_id = str(uuid4())
            cur.execute(
                """
                INSERT INTO document_chunks(id,document_id,workspace_id,chunk_index,content,token_estimate,metadata_json,embedding_vector,created_at)
                VALUES(?,?,?,?,?,?,?,?,?)
                """,
                (
                    chunk_id,
                    document_id,
                    workspace_id,
                    chunk["chunk_index"],
                    chunk["content"],
                    chunk["token_estimate"],
                    chunk["metadata_json"],
                    None,
                    ts,
                ),
            )
            cur.execute("INSERT INTO document_chunks_fts(chunk_id,content) VALUES(?,?)", (chunk_id, chunk["content"]))


def delete_document_chunks_and_fts(document_id: str) -> None:
    with db_cursor() as cur:
        chunk_rows = cur.execute("SELECT id FROM document_chunks WHERE document_id=?", (document_id,)).fetchall()
        chunk_ids = [row["id"] for row in chunk_rows]
        if chunk_ids:
            placeholders = ",".join(["?" for _ in chunk_ids])
            cur.execute(f"DELETE FROM document_chunks_fts WHERE chunk_id IN ({placeholders})", chunk_ids)
        cur.execute("DELETE FROM document_chunks WHERE document_id=?", (document_id,))


def search_chunks(workspace_id: str, q: str, limit: int) -> list[dict]:
    with db_cursor() as cur:
        rows = cur.execute(
            """
            SELECT dc.id AS chunk_id, dc.document_id, d.file_name, dc.chunk_index, dc.content
            FROM document_chunks_fts f
            JOIN document_chunks dc ON dc.id = f.chunk_id
            JOIN documents d ON d.id = dc.document_id
            WHERE dc.workspace_id = ? AND f.content MATCH ?
            ORDER BY rank
            LIMIT ?
            """,
            (workspace_id, q, limit),
        ).fetchall()
        return [dict(r) for r in rows]
