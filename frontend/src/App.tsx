import { ChatPanel } from './components/ChatPanel';
import { ConversationPanel } from './components/ConversationPanel';
import { KnowledgePanel } from './components/KnowledgePanel';
import { WorkspacePanel } from './components/WorkspacePanel';
import { useWorkbench } from './hooks/useWorkbench';

export default function App() {
  const { 状态, 动作 } = useWorkbench();

  return (
    <main style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 14, fontFamily: 'Segoe UI, PingFang SC', padding: 16 }}>
      <aside style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12 }}>
        <WorkspacePanel
          新工作区名={状态.新工作区名}
          set新工作区名={动作.set新工作区名}
          工作区列表={状态.工作区列表}
          当前工作区={状态.当前工作区}
          onSelect={动作.set当前工作区}
          onCreate={动作.新建工作区}
          onRename={动作.重命名当前工作区}
          onDelete={动作.删除当前工作区}
        />
        <ConversationPanel
          当前工作区={状态.当前工作区}
          会话列表={状态.会话列表}
          当前会话={状态.当前会话}
          onSelect={动作.set当前会话}
          onCreate={动作.新建会话}
          onRename={动作.重命名当前会话}
          onDelete={动作.删除当前会话}
        />
      </aside>

      <ChatPanel
        健康={状态.健康}
        ollama={状态.ollama}
        当前模型名={状态.当前模型名}
        当前工作区={状态.当前工作区}
        当前会话={状态.当前会话}
        消息列表={状态.消息列表}
        输入={状态.输入}
        发送中={状态.发送中}
        错误={状态.错误}
        提示={状态.提示}
        set输入={动作.set输入}
        onSend={动作.发送消息}
      />

      <KnowledgePanel
        当前工作区={状态.当前工作区}
        文档列表={状态.文档列表}
        检索词={状态.检索词}
        检索中={状态.检索中}
        检索结果={状态.检索结果}
        set检索词={动作.set检索词}
        onUpload={动作.上传文件}
        onDeleteDocument={动作.删除文档项}
        onSearch={动作.执行检索}
      />
    </main>
  );
}
