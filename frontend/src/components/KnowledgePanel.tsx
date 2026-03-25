type Props = {
  当前工作区: any | null;
  文档列表: any[];
  检索词: string;
  检索中: boolean;
  检索结果: any[];
  set检索词: (v: string) => void;
  onUpload: (file: File) => void;
  onDeleteDocument: (id: string) => void;
  onSearch: () => void;
};

export function KnowledgePanel(props: Props) {
  const { 当前工作区, 文档列表, 检索词, 检索中, 检索结果, set检索词, onUpload, onDeleteDocument, onSearch } = props;

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12 }}>
      <h3>知识库（txt/md）</h3>
      <input
        type="file"
        accept=".txt,.md"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
        disabled={!当前工作区}
      />
      <h4>文档列表</h4>
      {当前工作区 && 文档列表.length === 0 ? <p style={{ color: '#666' }}>当前工作区暂无文档。</p> : null}
      <ul style={{ paddingLeft: 16 }}>
        {文档列表.map((d) => (
          <li key={d.id}>
            {d.file_name}
            <button onClick={() => onDeleteDocument(d.id)} style={{ marginLeft: 6 }}>删除</button>
          </li>
        ))}
      </ul>
      <h4>检索片段</h4>
      <input value={检索词} onChange={(e) => set检索词(e.target.value)} placeholder="输入关键词" />
      <button onClick={onSearch} disabled={!当前工作区 || 检索中}>{检索中 ? '检索中...' : '检索'}</button>
      {检索中 ? <p style={{ color: '#666' }}>正在检索，请稍候...</p> : null}
      {!检索中 && 检索词 && 检索结果.length === 0 ? <p style={{ color: '#666' }}>未命中相关片段，请尝试更换关键词。</p> : null}
      <ul style={{ paddingLeft: 16 }}>
        {检索结果.map((r) => (
          <li key={r.chunk_id}>
            <b>{r.file_name}</b> #{r.chunk_index}
            <div>{r.content.slice(0, 120)}...</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
