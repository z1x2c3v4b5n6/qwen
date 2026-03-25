import { 读取运行时配置 } from '../config/runtime';
import type { 健康响应, 通用响应 } from '../types/runtime';

async function 请求<T>(path: string, options?: RequestInit): Promise<通用响应<T>> {
  const runtime = await 读取运行时配置();
  const isFormData = options?.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options?.headers ?? {})
  };

  const resp = await fetch(`${runtime.base_url}${path}`, {
    ...options,
    headers
  });
  const json = (await resp.json()) as 通用响应<T>;
  return json;
}

export async function 获取健康状态() {
  return 请求<健康响应>('/api/v1/health');
}

export async function 获取Ollama状态() {
  return 请求<{ available: boolean; base_url: string; model_count: number }>('/api/v1/models/ollama/status');
}

export async function 获取模型列表() {
  return 请求<{ models: Array<{ name: string }> }>('/api/v1/models/ollama/list');
}

export async function 获取工作区列表() {
  return 请求<{ items: any[] }>('/api/v1/workspaces');
}

export async function 创建工作区(payload: { name: string; description: string; default_model: string; system_prompt: string }) {
  return 请求<any>('/api/v1/workspaces', { method: 'POST', body: JSON.stringify(payload) });
}

export async function 更新工作区(workspaceId: string, payload: { name: string; description: string; default_model: string; system_prompt: string }) {
  return 请求<any>(`/api/v1/workspaces/${workspaceId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function 删除工作区(workspaceId: string) {
  return 请求<{ deleted: boolean }>(`/api/v1/workspaces/${workspaceId}`, { method: 'DELETE' });
}

export async function 获取会话列表(workspaceId: string) {
  return 请求<{ items: any[] }>(`/api/v1/conversations?workspace_id=${encodeURIComponent(workspaceId)}`);
}

export async function 创建会话(workspaceId: string, title: string) {
  return 请求<any>('/api/v1/conversations', {
    method: 'POST',
    body: JSON.stringify({ workspace_id: workspaceId, title })
  });
}

export async function 重命名会话(conversationId: string, title: string) {
  return 请求<any>(`/api/v1/conversations/${conversationId}`, {
    method: 'PUT',
    body: JSON.stringify({ title })
  });
}

export async function 删除会话(conversationId: string) {
  return 请求<{ deleted: boolean }>(`/api/v1/conversations/${conversationId}`, { method: 'DELETE' });
}

export async function 获取消息列表(conversationId: string) {
  return 请求<{ items: any[] }>(`/api/v1/conversations/${conversationId}/messages`);
}

export async function 发送聊天(payload: { workspace_id: string; conversation_id: string; user_message: string }) {
  return 请求<any>('/api/v1/chat', { method: 'POST', body: JSON.stringify(payload) });
}

export async function 上传文档(workspaceId: string, file: File) {
  const form = new FormData();
  form.append('workspace_id', workspaceId);
  form.append('file', file);
  return 请求<any>('/api/v1/knowledge/upload', { method: 'POST', body: form });
}

export async function 获取文档列表(workspaceId: string) {
  return 请求<{ items: any[] }>(`/api/v1/knowledge/documents?workspace_id=${encodeURIComponent(workspaceId)}`);
}

export async function 删除文档(documentId: string) {
  return 请求<{ deleted: boolean }>(`/api/v1/knowledge/documents/${documentId}`, { method: 'DELETE' });
}

export async function 检索片段(workspaceId: string, q: string) {
  return 请求<{ items: any[] }>(`/api/v1/knowledge/search?workspace_id=${encodeURIComponent(workspaceId)}&q=${encodeURIComponent(q)}`);
}
