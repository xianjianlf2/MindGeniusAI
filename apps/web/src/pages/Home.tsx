import { Segmented, Tooltip, message as antdMessage } from 'antd'
import { useMemo, useState } from 'react'
import { ChatPanel } from '@/components/ChatPanel'
import { MindMapCanvas } from '@/components/MindMapCanvas'
import { createChatStore } from '@/stores/chatStore'
import { useNodeStore } from '@/stores/nodeStore'
import { extractMarkdownBlock } from '@/utils/convertMarkdown'

type Mode = 'mindmap' | 'agent'

const WELCOME = 'Hello! Please write your topic you want to generate a mindmap'

export default function Home() {
  const [mode, setMode] = useState<Mode>('agent')
  const useChat = useMemo(() => createChatStore(WELCOME), [])
  const { messages, isLoading, send, stop, clear } = useChat()
  const generateFromMarkdown = useNodeStore(state => state.generateFromMarkdown)
  const [messageApi, contextHolder] = antdMessage.useMessage()

  const applyMarkdown = (content: string) => {
    const markdown = extractMarkdownBlock(content)
    if (!/^#{1,6}\s/m.test(markdown))
      return
    const result = generateFromMarkdown(markdown)
    if (result.ok)
      messageApi.success('Mind map generated.')
    else if (mode === 'mindmap')
      messageApi.info(result.error)
  }

  const handleSend = (text: string) => {
    if (mode === 'mindmap') {
      send({
        url: '/api/chatMindMap',
        data: { topic: text },
        userText: text,
        onDone: applyMarkdown,
      })
      return
    }
    send({
      url: '/api/agent',
      data: {
        messages: [
          ...messages.filter(item => item.content).map(({ role, content }) => ({ role, content })),
          { role: 'user', content: text },
        ],
      },
      userText: text,
      agentMode: true,
      onDone: applyMarkdown,
    })
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {contextHolder}
      <div style={{ width: 420, borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          placeholder={mode === 'mindmap' ? '输入主题，直接生成思维导图' : '和 Hermas 对话，它会自主规划并调用工具'}
          header={(
            <div style={{ padding: 12, borderBottom: '1px solid #1e293b' }}>
              <Tooltip title="MindMap：单次生成；Hermas Agent：多步规划 + 工具调用（可结合已上传文档）">
                <Segmented
                  value={mode}
                  onChange={value => setMode(value as Mode)}
                  options={[
                    { label: 'Hermas Agent', value: 'agent' },
                    { label: 'MindMap', value: 'mindmap' },
                  ]}
                />
              </Tooltip>
            </div>
          )}
          onSend={handleSend}
          onStop={stop}
          onClear={clear}
        />
      </div>
      <MindMapCanvas />
    </div>
  )
}
