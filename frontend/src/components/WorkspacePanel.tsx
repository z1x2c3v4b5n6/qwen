const 选中样式 = { background: '#eef4ff', border: '1px solid #b2ccff', borderRadius: 6, padding: '4px 6px' };

type Props = {
  新工作区名: string;
  set新工作区名: (v: string) => void;
  工作区列表: any[];
  当前工作区: any | null;
  onSelect: (w: any) => void;
  onCreate: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function WorkspacePanel(props: Props) {
  const { 新工作区名, set新工作区名, 工作区列表, 当前工作区, onSelect, onCreate, onRename, onDelete } = props;
  return (
    <section>
      <h3>工作区</h3>
      <input value={新工作区名} onChange={(e) => set新工作区名(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button onClick={onCreate}>新建</button>
        <button onClick={onRename} disabled={!当前工作区}>重命名</button>
        <button onClick={onDelete} disabled={!当前工作区}>删除</button>
      </div>
      {工作区列表.length === 0 ? <p style={{ color: '#666' }}>暂无工作区，请先创建一个工作区。</p> : null}
      <ul style={{ paddingLeft: 16 }}>
        {工作区列表.map((w) => (
          <li key={w.id} style={当前工作区?.id === w.id ? 选中样式 : undefined}>
            <button onClick={() => onSelect(w)}>{w.name}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
