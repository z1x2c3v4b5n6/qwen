from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.chat_service import chat_once
from app.utils.response import ok

router = APIRouter(prefix="/api/v1", tags=["chat"])


class ChatBody(BaseModel):
    workspace_id: str
    conversation_id: str
    user_message: str


@router.post("/chat")
def chat(body: ChatBody) -> dict:
    result = chat_once(body.workspace_id, body.conversation_id, body.user_message)
    return ok(result)
