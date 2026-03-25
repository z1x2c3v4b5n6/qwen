import { 读取运行时配置 } from '../config/runtime';
import type { 健康响应, 运行时配置 } from '../types/runtime';

export async function 拉取健康状态(): Promise<{ 运行时: 运行时配置; 健康: 健康响应 | null; 错误: string | null }> {
  const 运行时 = await 读取运行时配置();
  try {
    const resp = await fetch(`${运行时.base_url}/api/v1/health`, { cache: 'no-store' });
    if (!resp.ok) {
      return { 运行时, 健康: null, 错误: `健康检查失败：HTTP ${resp.status}` };
    }
    const 健康 = (await resp.json()) as 健康响应;
    return { 运行时, 健康, 错误: null };
  } catch (e) {
    return { 运行时, 健康: null, 错误: e instanceof Error ? e.message : '未知错误' };
  }
}

export async function 拉取运行时状态(baseUrl: string): Promise<Record<string, unknown> | null> {
  try {
    const resp = await fetch(`${baseUrl}/api/v1/runtime`, { cache: 'no-store' });
    if (!resp.ok) return null;
    return (await resp.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
