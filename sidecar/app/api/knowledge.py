from __future__ import annotations

from fastapi import APIRouter, File, Form, UploadFile

from app.services.knowledge_service import get_documents, remove_document, save_upload, search
from app.utils.response import fail, ok

router = APIRouter(prefix="/api/v1/knowledge", tags=["knowledge"])


@router.post("/upload")
async def upload(workspace_id: str = Form(...), file: UploadFile = File(...)) -> dict:
    data = await file.read()
    result = save_upload(workspace_id=workspace_id, file_name=file.filename or "unknown.txt", file_bytes=data)
    return ok(result)


@router.get("/documents")
def documents(workspace_id: str) -> dict:
    return ok({"items": get_documents(workspace_id)})


@router.delete("/documents/{document_id}")
def delete_document(document_id: str) -> dict:
    deleted = remove_document(document_id)
    if not deleted:
        raise fail("DOCUMENT_NOT_FOUND")
    return ok({"deleted": True})


@router.get("/search")
def knowledge_search(workspace_id: str, q: str, limit: int = 8) -> dict:
    return ok({"items": search(workspace_id, q, limit)})
