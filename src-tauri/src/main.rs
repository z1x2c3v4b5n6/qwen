#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RuntimeConfig {
    host: String,
    port: u16,
    base_url: String,
    pid: u32,
    status: String,
    env_mode: String,
    data_dir: Option<String>,
}

impl RuntimeConfig {
    fn fallback() -> Self {
        Self {
            host: "127.0.0.1".to_string(),
            port: 18080,
            base_url: "http://127.0.0.1:18080".to_string(),
            pid: 0,
            status: "offline".to_string(),
            env_mode: "development".to_string(),
            data_dir: None,
        }
    }
}

fn runtime_file_path(app: &tauri::AppHandle) -> PathBuf {
    if cfg!(debug_assertions) {
        let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        return cwd.join("data").join("runtime.json");
    }

    if let Some(app_data_dir) = app.path().app_data_dir().ok() {
        return app_data_dir.join("runtime.json");
    }

    PathBuf::from("runtime.json")
}

#[tauri::command]
fn get_runtime_config(app: tauri::AppHandle) -> RuntimeConfig {
    let runtime_path = runtime_file_path(&app);
    let content = fs::read_to_string(runtime_path);
    match content {
        Ok(raw) => serde_json::from_str::<RuntimeConfig>(&raw).unwrap_or_else(|_| RuntimeConfig::fallback()),
        Err(_) => RuntimeConfig::fallback(),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_runtime_config])
        .run(tauri::generate_context!())
        .expect("启动 Tauri 应用失败");
}
