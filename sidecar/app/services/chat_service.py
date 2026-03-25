from __future__ import annotations

from app.repositories.conversation_repo import get_conversation, touch_conversation
from app.repositories.message_repo import add_message, list_messages
from app.repositories.workspace_repo import get_workspace
from app.services.ollama_service import chat as ollama_chat
from app.utils.response import fail

MAX_HISTORY_MESSAGES = 10
MAX_CONTEXT_CHARS = 14000


def _build_messages(system_prompt: str, history: list[dict], user_message: str) -> list[dict]:
    selected = history[-MAX_HISTORY_MESSAGES:]
    prompt_list: list[dict] = []

    if system_prompt.strip():
        prompt_list.append({"role": "system", "content": system_prompt.strip()})

    for item in selected:
        prompt_list.append({"role": item["role"], "content": item["content"]})

    prompt_list.append({"role": "user", "content": user_message})

    # 按总字符数上限从前向后裁剪（保留 system + 末尾消息）
    total_chars = sum(len(m.get("content", "")) for m in prompt_list)
    while total_chars > MAX_CONTEXT_CHARS and len(prompt_list) > 2:
        # 保护 system 在最前；从 system 后第一条历史删起
        del prompt_list[1]
        total_chars = sum(len(m.get("content", "")) for m in prompt_list)

    return prompt_list


def chat_once(workspace_id: str, conversation_id: str, user_message: str) -> dict:
    workspace = get_workspace(workspace_id)
    if not workspace:
        raise fail("WORKSPACE_NOT_FOUND")

    conversation = get_conversation(conversation_id)
    if not conversation or conversation["workspace_id"] != workspace_id:
        raise fail("CONVERSATION_NOT_FOUND")

    model = workspace.get("default_model") or "qwen2.5:7b"
    system_prompt = workspace.get("system_prompt") or ""

    # 先保存用户消息
    user_row = add_message(conversation_id, "user", user_message, model_name=model)

    history = list_messages(conversation_id)
    prompt_messages = _build_messages(system_prompt, history[:-1], user_message)

    answer = ollama_chat(model=model, messages=prompt_messages)
    assistant_row = add_message(conversation_id, "assistant", answer, model_name=model)
    touch_conversation(conversation_id)

    return {
        "conversation_id": conversation_id,
        "model": model,
        "user_message": user_row,
        "assistant_message": assistant_row,
        "context_message_count": len(prompt_messages),
    }
