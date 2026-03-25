import type { 运行时配置 } from '../types/runtime';

const 默认配置: 运行时配置 = {
  host: '127.0.0.1',
  port: 18080,
  base_url: 'http://127.0.0.1:18080',
  pid: 0,
  status: 'offline',
  env_mode: 'development'
};

async function 读取开发态配置(): Promise<运行时配置> {
  const resp = await fetch('/runtime.json', { cache: 'no-store' });
  if (!resp.ok) return 默认配置;
  const data = (await resp.json()) as 运行时配置;
  return data.base_url ? data : 默认配置;
}

async function 读取发布态配置(): Promise<运行时配置> {
  const { invoke } = await import('@tauri-apps/api/core');
  const data = await invoke<运行时配置>('get_runtime_config');
  return data?.base_url ? data : 默认配置;
}

export async function 读取运行时配置(): Promise<运行时配置> {
  try {
    const 是否Tauri环境 = '__TAURI_INTERNALS__' in window;
    if (是否Tauri环境) {
      return await 读取发布态配置();
    }
    return await 读取开发态配置();
  } catch {
    return 默认配置;
  }
}
