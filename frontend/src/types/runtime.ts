export interface 运行时配置 {
  host: string;
  port: number;
  base_url: string;
  pid: number;
  status: 'online' | 'offline' | 'starting' | string;
  env_mode: 'development' | 'production' | string;
  data_dir?: string;
}

export interface 健康响应 {
  status: string;
  service: string;
  app_name: string;
  version: string;
  mode: string;
  timestamp: string;
  runtime_base_url: string;
  runtime_port: number;
  database_path: string;
  data_dir: string;
}

export interface 通用响应<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
