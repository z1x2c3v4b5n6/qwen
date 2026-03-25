from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.repositories.workspace_repo import create_workspace, delete_workspace, list_workspaces, update_workspace
from app.utils.response import fail, ok

router = APIRouter(prefix="/api/v1/workspaces", tags=["workspaces"])


class WorkspaceBody(BaseModel):
    name: str
    description: str = ""
    default_model: str = ""
    system_prompt: str = ""


@router.get("")
def workspace_list() -> dict:
    return ok({"items": list_workspaces()})


@router.post("")
def workspace_create(body: WorkspaceBody) -> dict:
    row = create_workspace(body.name, body.description, body.default_model, body.system_prompt)
    return ok(row)


@router.put("/{workspace_id}")
def workspace_update(workspace_id: str, body: WorkspaceBody) -> dict:
    row = update_workspace(workspace_id, body.name, body.description, body.default_model, body.system_prompt)
    if not row:
        raise fail("WORKSPACE_NOT_FOUND")
    return ok(row)


@router.delete("/{workspace_id}")
def workspace_delete(workspace_id: str) -> dict:
    deleted = delete_workspace(workspace_id)
    if not deleted:
        raise fail("WORKSPACE_NOT_FOUND")
    return ok({"deleted": True})
