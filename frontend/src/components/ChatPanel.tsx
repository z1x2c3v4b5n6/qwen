import { KeyboardEvent } from 'react';
import { StatusPanel } from './StatusPanel';

type Props = {
  运行时地址: string;
  健康: any;
  ollama: any;
  当前模型名: string;
  当前工作区: any | null;
  当前会话: any | null;
  消息列表: any[];
  输入: string;
  发送中: boolean;
  错误: string | null;
  提示: string | null;
  set输入: (v: string) => void;
  onSend: () => void;
};

export function ChatPanel(props: Props) {
  const { 运行时地址, 健康, ollama, 当前模型名, 当前工作区, 当前会话, 消息列表, 输入, 发送中, 错误, 提示, set输入, onSend } = props;

  function 输入框按键(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!发送中) onSend();
    }
  }

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12 }}>
      <h2 style={{ marginTop: 0 }}>中文本地 AI 工作台（第五阶段联调验证回合）</h2>
      <StatusPanel 健康={健康} ollama={ollama} 当前模型名={当前模型名} />

      <div style={{ background: '#fff8e6', border: '1px solid #f9d98c', padding: 8, borderRadius: 8, marginBottom: 10 }}>
        <div><b>当前 base_url：</b>{运行时地址}</div>
        <div><b>sidecar health：</b>{健康?.status ?? '未知'}</div>
        <div><b>Ollama 状态：</b>{ollama?.available ? '可用' : '不可用'}</div>
        <div><b>当前工作区：</b>{当前工作区?.name ?? '未选择'}</div>
        <div><b>当前会话：</b>{当前会话?.title ?? '未选择'}</div>
      </div>

      <details style={{ marginBottom: 10 }}>
        <summary>联调检查清单（前端）</summary>
        <ol>
          <li>sidecar health</li>
          <li>runtime</li>
          <li>Ollama status</li>
          <li>Ollama model list</li>
          <li>workspace create/list</li>
          <li>conversation create/list</li>
          <li>chat</li>
          <li>knowledge upload</li>
          <li>knowledge search</li>
        </ol>
      </details>

      <p>当前工作区：{当前工作区?.name ?? '未选择'}，当前会话：{当前会话?.title ?? '未选择'}</p>
      <div style={{ minHeight: 340, border: '1px solid #eee', padding: 8, borderRadius: 8 }}>
        {消息列表.length === 0 ? <p style={{ color: '#666' }}>暂无消息，输入内容后开始第一轮对话。</p> : null}
        {消息列表.map((m) => (
          <p key={m.id}>
            <b>{m.role}：</b>
            {m.content}
          </p>
        ))}
      </div>
      <textarea
        value={输入}
        onChange={(e) => set输入(e.target.value)}
        onKeyDown={输入框按键}
        rows={4}
        style={{ width: '100%', marginTop: 8 }}
        placeholder="回车发送，Shift+Enter 换行"
      />
      <button onClick={onSend} disabled={发送中}>
        {发送中 ? '发送中...' : '发送（非流式）'}
      </button>
      {错误 ? <p style={{ color: '#b42318' }}>错误：{错误}</p> : null}
      {提示 ? <p style={{ color: '#067647' }}>{提示}</p> : null}
    </section>
  );
}
