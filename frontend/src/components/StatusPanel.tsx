type Props = {
  健康: any;
  ollama: any;
  当前模型名: string;
};

export function StatusPanel({ 健康, ollama, 当前模型名 }: Props) {
  return (
    <div style={{ background: '#f8f9fb', padding: 8, borderRadius: 8, marginBottom: 8 }}>
      <div>健康状态：{健康?.status ?? '未知'}</div>
      <div>Ollama 状态：{ollama?.available ? '可用' : '不可用'}</div>
      <div>当前模型：{当前模型名}</div>
    </div>
  );
}
