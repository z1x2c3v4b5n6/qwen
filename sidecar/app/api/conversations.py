from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.repositories.conversation_repo import create_conversation, delete_conversation, list_conversations, rename_conversation
from app.repositories.message_repo import list_messages
from app.repositories.workspace_repo import get_workspace
from app.utils.response import fail, ok

router = APIRouter(prefix="/api/v1", tags=["conversations"])


class ConversationCreateBody(BaseModel):
    workspace_id: str
    title: str = "新会话"


class ConversationRenameBody(BaseModel):
    title: str


@router.get("/conversations")
def conversations(workspace_id: str) -> dict:
    if not get_workspace(workspace_id):
        raise fail("WORKSPACE_NOT_FOUND")
    return ok({"items": list_conversations(workspace_id)})


@router.post("/conversations")
def create(body: ConversationCreateBody) -> dict:
    if not get_workspace(body.workspace_id):
        raise fail("WORKSPACE_NOT_FOUND")
    row = create_conversation(body.workspace_id, body.title)
    return ok(row)


@router.put("/conversations/{conversation_id}")
def rename(conversation_id: str, body: ConversationRenameBody) -> dict:
    row = rename_conversation(conversation_id, body.title)
    if not row:
        raise fail("CONVERSATION_NOT_FOUND")
    return ok(row)


@router.delete("/conversations/{conversation_id}")
def remove(conversation_id: str) -> dict:
    deleted = delete_conversation(conversation_id)
    if not deleted:
        raise fail("CONVERSATION_NOT_FOUND")
    return ok({"deleted": True})


@router.get("/conversations/{conversation_id}/messages")
def messages(conversation_id: str) -> dict:
    return ok({"items": list_messages(conversation_id)})
