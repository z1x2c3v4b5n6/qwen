const 选中样式 = { background: '#eef4ff', border: '1px solid #b2ccff', borderRadius: 6, padding: '4px 6px' };

type Props = {
  当前工作区: any | null;
  会话列表: any[];
  当前会话: any | null;
  onSelect: (c: any) => void;
  onCreate: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function ConversationPanel(props: Props) {
  const { 当前工作区, 会话列表, 当前会话, onSelect, onCreate, onRename, onDelete } = props;
  return (
    <section>
      <hr />
      <h3>会话</h3>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button onClick={onCreate} disabled={!当前工作区}>新建</button>
        <button onClick={onRename} disabled={!当前会话}>重命名</button>
        <button onClick={onDelete} disabled={!当前会话}>删除</button>
      </div>
      {当前工作区 && 会话列表.length === 0 ? <p style={{ color: '#666' }}>当前工作区暂无会话，请先新建会话。</p> : null}
      <ul style={{ paddingLeft: 16 }}>
        {会话列表.map((c) => (
          <li key={c.id} style={当前会话?.id === c.id ? 选中样式 : undefined}>
            <button onClick={() => onSelect(c)}>{c.title}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
