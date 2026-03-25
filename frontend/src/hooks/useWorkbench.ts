import { useEffect, useMemo, useState } from 'react';
import {
  上传文档,
  创建会话,
  创建工作区,
  发送聊天,
  删除会话,
  删除工作区,
  删除文档,
  获取会话列表,
  获取健康状态,
  获取模型列表,
  获取Ollama状态,
  获取工作区列表,
  获取消息列表,
  获取文档列表,
  更新工作区,
  检索片段,
  重命名会话
} from '../services/api';
import { 读取运行时配置 } from '../config/runtime';

export function useWorkbench() {
  const [运行时地址, set运行时地址] = useState('读取中...');
  const [健康, set健康] = useState<any>(null);
  const [ollama, setOllama] = useState<any>(null);
  const [模型列表, set模型列表] = useState<any[]>([]);

  const [工作区列表, set工作区列表] = useState<any[]>([]);
  const [当前工作区, set当前工作区] = useState<any | null>(null);
  const [会话列表, set会话列表] = useState<any[]>([]);
  const [当前会话, set当前会话] = useState<any | null>(null);
  const [消息列表, set消息列表] = useState<any[]>([]);

  const [文档列表, set文档列表] = useState<any[]>([]);
  const [新工作区名, set新工作区名] = useState('默认工作区');
  const [输入, set输入] = useState('');
  const [错误, set错误] = useState<string | null>(null);
  const [提示, set提示] = useState<string | null>(null);

  const [发送中, set发送中] = useState(false);
  const [检索中, set检索中] = useState(false);
  const [检索词, set检索词] = useState('');
  const [检索结果, set检索结果] = useState<any[]>([]);

  const 当前模型名 = useMemo(() => 当前工作区?.default_model || 模型列表[0]?.name || '未配置', [当前工作区, 模型列表]);

  function 设置错误(message: string) {
    set提示(null);
    set错误(message);
  }

  function 设置成功(message: string) {
    set错误(null);
    set提示(message);
  }

  async function 刷新基础状态() {
    const runtime = await 读取运行时配置();
    set运行时地址(runtime.base_url);

    const [h, o, m] = await Promise.all([获取健康状态(), 获取Ollama状态(), 获取模型列表()]);
    if (h.success) set健康(h.data);
    if (o.success) setOllama(o.data);
    if (m.success) set模型列表(m.data?.models ?? []);
  }

  async function 刷新工作区() {
    const res = await 获取工作区列表();
    if (!res.success) return 设置错误(res.error?.message ?? '获取工作区失败，请检查 sidecar 服务状态。');
    const items = res.data?.items ?? [];
    set工作区列表(items);

    if (!items.length) {
      set当前工作区(null);
      set当前会话(null);
      set会话列表([]);
      set消息列表([]);
      set文档列表([]);
      return;
    }

    const current = 当前工作区 ? items.find((w) => w.id === 当前工作区.id) : null;
    set当前工作区(current ?? items[0]);
  }

  async function 刷新会话(workspaceId: string) {
    const res = await 获取会话列表(workspaceId);
    if (!res.success) return 设置错误(res.error?.message ?? '获取会话失败，请稍后重试。');
    const items = res.data?.items ?? [];
    set会话列表(items);

    if (!items.length) {
      set当前会话(null);
      set消息列表([]);
      return;
    }

    const current = 当前会话 ? items.find((c) => c.id === 当前会话.id) : null;
    set当前会话(current ?? items[0]);
  }

  async function 刷新消息(conversationId: string) {
    const res = await 获取消息列表(conversationId);
    if (!res.success) return 设置错误(res.error?.message ?? '获取消息失败，请检查会话是否存在。');
    set消息列表(res.data?.items ?? []);
  }

  async function 刷新文档(workspaceId: string) {
    const res = await 获取文档列表(workspaceId);
    if (!res.success) return 设置错误(res.error?.message ?? '获取文档失败，请稍后重试。');
    set文档列表(res.data?.items ?? []);
  }

  useEffect(() => {
    void (async () => {
      await 刷新基础状态();
      await 刷新工作区();
    })();
  }, []);

  useEffect(() => {
    if (!当前工作区) return;
    void 刷新会话(当前工作区.id);
    void 刷新文档(当前工作区.id);
  }, [当前工作区?.id]);

  useEffect(() => {
    if (!当前会话) return;
    void 刷新消息(当前会话.id);
  }, [当前会话?.id]);

  async function 新建工作区() {
    const res = await 创建工作区({
      name: 新工作区名,
      description: '',
      default_model: 当前模型名,
      system_prompt: '你是一个中文桌面 AI 助手。'
    });
    if (!res.success) return 设置错误(res.error?.message ?? '创建工作区失败，请稍后重试。');
    设置成功('工作区创建成功。');
    await 刷新工作区();
  }

  async function 重命名当前工作区() {
    if (!当前工作区) return;
    const name = window.prompt('请输入新的工作区名称', 当前工作区.name);
    if (!name?.trim()) return;
    const res = await 更新工作区(当前工作区.id, {
      name: name.trim(),
      description: 当前工作区.description ?? '',
      default_model: 当前工作区.default_model ?? '',
      system_prompt: 当前工作区.system_prompt ?? ''
    });
    if (!res.success) return 设置错误(res.error?.message ?? '重命名工作区失败，请稍后重试。');
    设置成功('工作区重命名成功。');
    await 刷新工作区();
  }

  async function 删除当前工作区() {
    if (!当前工作区) return;
    const ok = window.confirm(`确认删除工作区「${当前工作区.name}」吗？`);
    if (!ok) return;
    const res = await 删除工作区(当前工作区.id);
    if (!res.success) return 设置错误(res.error?.message ?? '删除工作区失败，请稍后重试。');
    设置成功('工作区删除成功。');
    await 刷新工作区();
  }

  async function 新建会话() {
    if (!当前工作区) return;
    const res = await 创建会话(当前工作区.id, `会话 ${new Date().toLocaleTimeString()}`);
    if (!res.success) return 设置错误(res.error?.message ?? '创建会话失败，请稍后重试。');
    设置成功('会话创建成功。');
    await 刷新会话(当前工作区.id);
    set当前会话(res.data);
  }

  async function 重命名当前会话() {
    if (!当前会话) return;
    const title = window.prompt('请输入新的会话名称', 当前会话.title);
    if (!title?.trim()) return;
    const res = await 重命名会话(当前会话.id, title.trim());
    if (!res.success) return 设置错误(res.error?.message ?? '重命名会话失败，请稍后重试。');
    if (!当前工作区) return;
    设置成功('会话重命名成功。');
    await 刷新会话(当前工作区.id);
  }

  async function 删除当前会话() {
    if (!当前会话) return;
    const ok = window.confirm(`确认删除会话「${当前会话.title}」吗？`);
    if (!ok) return;
    const res = await 删除会话(当前会话.id);
    if (!res.success) return 设置错误(res.error?.message ?? '删除会话失败，请稍后重试。');
    if (!当前工作区) return;
    设置成功('会话删除成功。');
    await 刷新会话(当前工作区.id);
  }

  async function 发送消息() {
    if (!当前工作区 || !当前会话 || !输入.trim()) {
      return 设置错误('请先选择工作区和会话，再输入消息后发送。');
    }

    set发送中(true);
    set错误(null);
    try {
      const res = await 发送聊天({ workspace_id: 当前工作区.id, conversation_id: 当前会话.id, user_message: 输入.trim() });
      if (!res.success) return 设置错误(res.error?.message ?? '发送失败，请检查 Ollama 是否可用。');
      set输入('');
      await 刷新消息(当前会话.id);
    } finally {
      set发送中(false);
    }
  }

  async function 上传文件(file: File) {
    if (!当前工作区) return;
    const res = await 上传文档(当前工作区.id, file);
    if (!res.success) return 设置错误(res.error?.message ?? '上传失败，请确认文件类型和大小限制。');
    设置成功('文档上传成功并已建立索引。');
    await 刷新文档(当前工作区.id);
  }

  async function 删除文档项(id: string) {
    if (!当前工作区) return;
    const ok = window.confirm('确认删除该文档吗？');
    if (!ok) return;
    const res = await 删除文档(id);
    if (!res.success) return 设置错误(res.error?.message ?? '删除文档失败，请稍后重试。');
    设置成功('文档删除成功。');
    await 刷新文档(当前工作区.id);
  }

  async function 执行检索() {
    if (!当前工作区) return;
    set检索中(true);
    set错误(null);
    try {
      const res = await 检索片段(当前工作区.id, 检索词);
      if (!res.success) return 设置错误(res.error?.message ?? '检索失败，请稍后重试。');
      set检索结果(res.data?.items ?? []);
    } finally {
      set检索中(false);
    }
  }

  return {
    状态: {
      运行时地址,
      健康,
      ollama,
      当前模型名,
      工作区列表,
      当前工作区,
      会话列表,
      当前会话,
      消息列表,
      文档列表,
      输入,
      发送中,
      错误,
      提示,
      新工作区名,
      检索词,
      检索中,
      检索结果
    },
    动作: {
      set当前工作区,
      set当前会话,
      set输入,
      set新工作区名,
      set检索词,
      新建工作区,
      重命名当前工作区,
      删除当前工作区,
      新建会话,
      重命名当前会话,
      删除当前会话,
      发送消息,
      上传文件,
      删除文档项,
      执行检索
    }
  };
}
