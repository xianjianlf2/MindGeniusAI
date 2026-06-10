import { ClearOutlined, RobotOutlined, SendOutlined, StopOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Avatar, Button, Input, Space } from 'antd'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AgentSteps } from './AgentSteps'
import { Markdown } from './Markdown'
import type { UiMessage } from '@/stores/chatStore'

interface ChatPanelProps {
  messages: UiMessage[]
  isLoading: boolean
  placeholder?: string
  header?: ReactNode
  onSend: (text: string) => void
  onStop: () => void
  onClear: () => void
}

function Bubble({ message }: { message: UiMessage }) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display: 'flex', gap: 8, flexDirection: isUser ? 'row-reverse' : 'row', marginBottom: 12 }}>
      <Avatar
        size="small"
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{ background: isUser ? '#2563eb' : '#10b981', flexShrink: 0 }}
      />
      <div
        style={{
          maxWidth: '85%',
          background: isUser ? '#2563eb' : '#1e293b',
          color: '#e2e8f0',
          borderRadius: 8,
          padding: '8px 12px',
          overflowX: 'auto',
        }}
      >
        {message.steps && <AgentSteps steps={message.steps} />}
        {message.content
          ? <Markdown content={message.content} />
          : !message.error && <span style={{ color: '#64748b' }}>…</span>}
        {message.error && <Alert type="error" message={message.error} showIcon style={{ marginTop: 8 }} />}
      </div>
    </div>
  )
}

export function ChatPanel({ messages, isLoading, placeholder, header, onSend, onStop, onClear }: ChatPanelProps) {
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const submit = () => {
    const value = text.trim()
    if (!value || isLoading)
      return
    setText('')
    onSend(value)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f172a' }}>
      {header}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {messages.map(message => <Bubble key={message.id} message={message} />)}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #1e293b' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input.TextArea
            value={text}
            placeholder={placeholder}
            autoSize={{ minRows: 1, maxRows: 4 }}
            onChange={event => setText(event.target.value)}
            onPressEnter={(event) => {
              if (!event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
          />
          {isLoading
            ? <Button danger icon={<StopOutlined />} onClick={onStop} />
            : <Button type="primary" icon={<SendOutlined />} onClick={submit} />}
          <Button icon={<ClearOutlined />} onClick={onClear} />
        </Space.Compact>
      </div>
    </div>
  )
}
