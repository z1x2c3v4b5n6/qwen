export interface 运行时配置 {
  host: string;
  port: number;
  base_url: string;
  status: 'online' | 'offline' | 'starting' | string;
  env_mode: 'development' | 'production' | string;
}

export interface 健康响应 {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  env_mode: string;
  data_dir: string;
  db_path: string;
}
