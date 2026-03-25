import { useEffect, useState } from 'react';
import { 拉取健康状态, 拉取运行时状态 } from './services/health';
import { 文案 } from './constants/texts';
import type { 健康响应, 运行时配置 } from './types/runtime';

export default function App() {
  const [运行时, set运行时] = useState<运行时配置 | null>(null);
  const [健康, set健康] = useState<健康响应 | null>(null);
  const [运行时调试, set运行时调试] = useState<Record<string, unknown> | null>(null);
  const [错误, set错误] = useState<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const 拉取 = async () => {
      const 结果 = await 拉取健康状态();
      set运行时(结果.运行时);
      set健康(结果.健康);
      set错误(结果.错误);
      if (!结果.错误) {
        const 调试信息 = await 拉取运行时状态(结果.运行时.base_url);
        set运行时调试(调试信息);
      }
      timer = window.setTimeout(拉取, 2000);
    };
    void 拉取();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const 当前状态 = 健康?.status === 'ok' ? 文案.状态在线 : 运行时?.status === 'starting' ? 文案.状态启动中 : 文案.状态离线;

  return (
    <main style={{ fontFamily: 'Segoe UI, PingFang SC, sans-serif', margin: 24 }}>
      <h1>{文案.标题}</h1>
      <p>{文案.副标题}</p>

      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, marginTop: 16 }}>
        <h2>Sidecar 状态：{当前状态}</h2>
        <p>
          {文案.当前地址}：<code>{运行时?.base_url ?? '读取中...'}</code>
        </p>
        <p>当前进程 PID：{运行时?.pid ?? '-'}</p>
        {错误 ? <p style={{ color: '#b42318' }}>{文案.健康检查失败}（{错误}）</p> : null}
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, marginTop: 16 }}>
        <h3>{文案.健康接口}</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(健康, null, 2)}</pre>
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, marginTop: 16 }}>
        <h3>运行时接口（/api/v1/runtime）</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(运行时调试, null, 2)}</pre>
      </section>
    </main>
  );
}
