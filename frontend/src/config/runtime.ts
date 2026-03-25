import type { 运行时配置 } from '../types/runtime';

const 默认配置: 运行时配置 = {
  host: '127.0.0.1',
  port: 18080,
  base_url: 'http://127.0.0.1:18080',
  status: 'offline',
  env_mode: 'development'
};

export async function 读取运行时配置(): Promise<运行时配置> {
  try {
    const resp = await fetch('/runtime.json', { cache: 'no-store' });
    if (!resp.ok) return 默认配置;
    const data = (await resp.json()) as 运行时配置;
    return data.base_url ? data : 默认配置;
  } catch {
    return 默认配置;
  }
}
