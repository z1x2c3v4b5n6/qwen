"""SQLite 初始化与连接管理。"""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager

from .config import load_config


def get_connection() -> sqlite3.Connection:
    cfg = load_config()
    conn = sqlite3.connect(cfg.db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def db_cursor():
    conn = get_connection()
    try:
        cur = conn.cursor()
        yield cur
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with db_cursor() as cur:
        cur.executescript(
            """
            CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                default_model TEXT,
                system_prompt TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at ON workspaces(updated_at DESC);

            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL,
                title TEXT NOT NULL,
                last_message_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_conversations_workspace_updated
            ON conversations(workspace_id, updated_at DESC);

            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                model_name TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
            ON messages(conversation_id, created_at ASC);

            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_type TEXT,
                file_size INTEGER,
                hash_sha256 TEXT,
                parse_status TEXT,
                index_status TEXT,
                error_message TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_documents_workspace_updated
            ON documents(workspace_id, updated_at DESC);
            CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_workspace_hash
            ON documents(workspace_id, hash_sha256);

            CREATE TABLE IF NOT EXISTS document_chunks (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                workspace_id TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                token_estimate INTEGER,
                metadata_json TEXT,
                embedding_vector TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
                FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id, chunk_index);
            CREATE INDEX IF NOT EXISTS idx_chunks_workspace ON document_chunks(workspace_id);

            CREATE VIRTUAL TABLE IF NOT EXISTS document_chunks_fts USING fts5(
                chunk_id,
                content,
                tokenize='unicode61'
            );

            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at TEXT NOT NULL
            );
            """
        )
