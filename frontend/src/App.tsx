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
} from './services/api';

export default function App() {
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

  const [检索词, set检索词] = useState('');
  const [检索结果, set检索结果] = useState<any[]>([]);

  const 当前模型名 = useMemo(() => 当前工作区?.default_model || 模型列表[0]?.name || '', [当前工作区, 模型列表]);

  async function 刷新基础状态() {
    const [h, o, m] = await Promise.all([获取健康状态(), 获取Ollama状态(), 获取模型列表()]);
    if (h.success) set健康(h.data);
    if (o.success) setOllama(o.data);
    if (m.success) set模型列表(m.data?.models ?? []);
  }

  async function 刷新工作区() {
    const res = await 获取工作区列表();
    if (!res.success) return set错误(res.error?.message ?? '获取工作区失败');
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
    if (!res.success) return set错误(res.error?.message ?? '获取会话失败');
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
    if (!res.success) return set错误(res.error?.message ?? '获取消息失败');
    set消息列表(res.data?.items ?? []);
  }

  async function 刷新文档(workspaceId: string) {
    const res = await 获取文档列表(workspaceId);
    if (!res.success) return set错误(res.error?.message ?? '获取文档失败');
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
    set错误(null);
    const res = await 创建工作区({
      name: 新工作区名,
      description: '',
      default_model: 当前模型名,
      system_prompt: '你是一个中文桌面 AI 助手。'
    });
    if (!res.success) return set错误(res.error?.message ?? '创建工作区失败');
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
    if (!res.success) return set错误(res.error?.message ?? '重命名工作区失败');
    await 刷新工作区();
  }

  async function 删除当前工作区() {
    if (!当前工作区) return;
    const ok = window.confirm(`确认删除工作区「${当前工作区.name}」吗？`);
    if (!ok) return;
    const res = await 删除工作区(当前工作区.id);
    if (!res.success) return set错误(res.error?.message ?? '删除工作区失败');
    await 刷新工作区();
  }

  async function 新建会话() {
    if (!当前工作区) return;
    const res = await 创建会话(当前工作区.id, `会话 ${new Date().toLocaleTimeString()}`);
    if (!res.success) return set错误(res.error?.message ?? '创建会话失败');
    await 刷新会话(当前工作区.id);
    set当前会话(res.data);
  }

  async function 重命名当前会话() {
    if (!当前会话) return;
    const title = window.prompt('请输入新的会话名称', 当前会话.title);
    if (!title?.trim()) return;
    const res = await 重命名会话(当前会话.id, title.trim());
    if (!res.success) return set错误(res.error?.message ?? '重命名会话失败');
    if (!当前工作区) return;
    await 刷新会话(当前工作区.id);
  }

  async function 删除当前会话() {
    if (!当前会话) return;
    const ok = window.confirm(`确认删除会话「${当前会话.title}」吗？`);
    if (!ok) return;
    const res = await 删除会话(当前会话.id);
    if (!res.success) return set错误(res.error?.message ?? '删除会话失败');
    if (!当前工作区) return;
    await 刷新会话(当前工作区.id);
  }

  async function 发送() {
    if (!当前工作区 || !当前会话 || !输入.trim()) {
      return set错误('请先选择工作区和会话，并输入消息内容。');
    }
    const res = await 发送聊天({ workspace_id: 当前工作区.id, conversation_id: 当前会话.id, user_message: 输入.trim() });
    if (!res.success) return set错误(res.error?.message ?? '对话失败');
    set输入('');
    await 刷新消息(当前会话.id);
  }

  async function 上传(e: React.ChangeEvent<HTMLInputElement>) {
    if (!当前工作区) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await 上传文档(当前工作区.id, file);
    if (!res.success) return set错误(res.error?.message ?? '上传失败');
    set错误(null);
    await 刷新文档(当前工作区.id);
  }

  async function 删除某个文档(id: string) {
    const ok = window.confirm('确认删除该文档吗？');
    if (!ok || !当前工作区) return;
    const res = await 删除文档(id);
    if (!res.success) return set错误(res.error?.message ?? '删除文档失败');
    await 刷新文档(当前工作区.id);
  }

  async function 查询片段() {
    if (!当前工作区) return;
    const res = await 检索片段(当前工作区.id, 检索词);
    if (!res.success) return set错误(res.error?.message ?? '检索失败');
    set检索结果(res.data?.items ?? []);
  }

  return (
    <main style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 12, fontFamily: 'Segoe UI, PingFang SC', padding: 16 }}>
      <aside style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3>工作区</h3>
        <input value={新工作区名} onChange={(e) => set新工作区名(e.target.value)} />
        <div>
          <button onClick={新建工作区}>新建</button>
          <button onClick={重命名当前工作区} disabled={!当前工作区}>重命名</button>
          <button onClick={删除当前工作区} disabled={!当前工作区}>删除</button>
        </div>
        <ul>
          {工作区列表.map((w) => (
            <li key={w.id}>
              <button onClick={() => set当前工作区(w)}>{w.name}</button>
            </li>
          ))}
        </ul>
        <hr />
        <h3>会话</h3>
        <div>
          <button onClick={新建会话} disabled={!当前工作区}>新建</button>
          <button onClick={重命名当前会话} disabled={!当前会话}>重命名</button>
          <button onClick={删除当前会话} disabled={!当前会话}>删除</button>
        </div>
        <ul>
          {会话列表.map((c) => (
            <li key={c.id}>
              <button onClick={() => set当前会话(c)}>{c.title}</button>
            </li>
          ))}
        </ul>
      </aside>

      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h2>中文本地 AI 工作台（第三阶段 A 前端补丁）</h2>
        <p>Ollama 状态：{ollama?.available ? '可用' : '不可用'}，模型数：{ollama?.model_count ?? '-'}</p>
        <p>当前工作区：{当前工作区?.name ?? '未选择'}，当前会话：{当前会话?.title ?? '未选择'}</p>
        <div style={{ minHeight: 340, border: '1px solid #eee', padding: 8 }}>
          {消息列表.map((m) => (
            <p key={m.id}>
              <b>{m.role}：</b>
              {m.content}
            </p>
          ))}
        </div>
        <textarea value={输入} onChange={(e) => set输入(e.target.value)} rows={4} style={{ width: '100%' }} />
        <button onClick={发送}>发送（非流式）</button>
        {错误 ? <p style={{ color: '#b42318' }}>错误：{错误}</p> : null}
      </section>

      <aside style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
        <h3>知识库（txt/md）</h3>
        <input type="file" accept=".txt,.md" onChange={上传} disabled={!当前工作区} />
        <h4>文档列表</h4>
        <ul>
          {文档列表.map((d) => (
            <li key={d.id}>
              {d.file_name}
              <button onClick={() => 删除某个文档(d.id)}>删除</button>
            </li>
          ))}
        </ul>
        <h4>检索片段</h4>
        <input value={检索词} onChange={(e) => set检索词(e.target.value)} placeholder="输入关键词" />
        <button onClick={查询片段} disabled={!当前工作区}>检索</button>
        <ul>
          {检索结果.map((r) => (
            <li key={r.chunk_id}>
              <b>{r.file_name}</b> #{r.chunk_index}
              <div>{r.content.slice(0, 120)}...</div>
            </li>
          ))}
        </ul>
        <hr />
        <h4>运行状态</h4>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(健康, null, 2)}</pre>
      </aside>
    </main>
  );
}
