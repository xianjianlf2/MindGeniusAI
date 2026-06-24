import { Suspense, lazy, useEffect, useMemo, useRef } from 'react'
import type { ErrorKind } from '@/components/Conversation'
import { Conversation } from '@/components/Conversation'
import { SourcesDrawer } from '@/components/SourcesDrawer'
import { TopBar } from '@/components/TopBar'
import { Icon } from '@/components/ui/Icon'
import { docDisplayName, useDocStore } from '@/stores/docStore'
import { createChatStore } from '@/stores/chatStore'
import { useNodeStore } from '@/stores/nodeStore'
import { PROVIDERS, useUiStore } from '@/stores/uiStore'
import { track } from '@/utils/analytics'
import { extractMarkdownBlock } from '@/utils/convertMarkdown'

// 懒加载画布：X6/AntV 这块重型依赖延迟到首屏之后再载，TopBar + 对话先即时渲染
const MindMapCanvas = lazy(() => import('@/components/MindMapCanvas').then(m => ({ default: m.MindMapCanvas })))

const NARROW = 1280

/**
 * 单一入口三分布局
 * 左栏对话流（380px 可折叠）/ 中央思维导图画布 / 右侧资料源抽屉（360px）
 */
export default function App() {
  const useChat = useMemo(() => createChatStore(), [])
  const { messages, isLoading, send, stop, clear } = useChat()
  const { generateFromMarkdown, reset: resetNodes } = useNodeStore()
  const {
    provider, density, leftCollapsed, setLeftCollapsed,
    sourcesOpen, setSourcesOpen, setSettingsOpen, toast, flash,
  } = useUiStore()
  const { files, attached, setAttached, refresh, upload } = useDocStore()

  const lastSentRef = useRef('')
  const mapSetThisTurnRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const wasNarrow = useRef(typeof window !== 'undefined' && window.innerWidth < NARROW)

  useEffect(() => {
    refresh()
  }, [refresh])

  /* 窄屏（<1280）自动折叠左栏，跨断点时同步一次 */
  useEffect(() => {
    const onResize = () => {
      const narrow = window.innerWidth < NARROW
      if (narrow !== wasNarrow.current) {
        wasNarrow.current = narrow
        setLeftCollapsed(narrow)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setLeftCollapsed])

  /* 强保证出图：优先用 mindmap-set 事件直送的 markdown 渲染 */
  const setMapFromMarkdown = (markdown: string) => {
    if (generateFromMarkdown(markdown).ok) {
      mapSetThisTurnRef.current = true
      flash('思维导图已生成')
    }
  }

  /* 兜底：本轮没有 mindmap-set 事件时，再尝试从聊天回复里抠 ```markdown 块 */
  const applyMarkdown = (content: string) => {
    if (mapSetThisTurnRef.current)
      return
    const markdown = extractMarkdownBlock(content)
    if (!/^#{1,6}\s/m.test(markdown))
      return
    setMapFromMarkdown(markdown)
  }

  const handleSend = (text: string) => {
    lastSentRef.current = text
    mapSetThisTurnRef.current = false
    track('agent_run') // 仅计数「有人真正发起了一次生成」，不含任何内容
    setLeftCollapsed(false)
    const attachedDoc = files.find(file => file.name === attached)
    send({
      url: '/api/agent',
      data: {
        messages: [
          ...messages.filter(item => item.content).map(({ role, content }) => ({ role, content })),
          { role: 'user', content: text },
        ],
        fileName: attached ?? undefined,
        // 画布已有导图时随请求带上轮廓，Hermas 可据此做增量编辑而非全量重画
        mindMap: useNodeStore.getState().outline() ?? undefined,
      },
      userText: text,
      userPdf: attachedDoc ? docDisplayName(attachedDoc) : undefined,
      agentMode: true,
      onDone: applyMarkdown,
      onSetMap: setMapFromMarkdown,
      onPatch: (ops) => {
        const applied = useNodeStore.getState().patch(ops)
        if (applied)
          flash(`已更新画布 ${applied} 处`)
      },
    })
  }

  const handleErrorAction = (kind: ErrorKind) => {
    if (kind === 'apikey') {
      setSettingsOpen(true)
      flash('请在右上角「设置」中填入 API Key')
      return
    }
    if (lastSentRef.current)
      handleSend(lastSentRef.current)
  }

  const handleNewChat = () => {
    clear()
    resetNodes()
  }

  /* 输入框 📎：选择 PDF → 上传 → 索引 → 自动作为对话上下文 */
  const handleAttach = () => fileInputRef.current?.click()
  const handleFilePicked = async (file: File | undefined) => {
    if (!file)
      return
    setSourcesOpen(true)
    try {
      await upload(file, { attach: true })
    }
    catch (error) {
      flash(`上传失败：${(error as Error).message}`)
    }
  }

  const providerName = PROVIDERS.find(item => item.id === provider)?.name ?? provider

  return (
    <div
      className={density === 'compact' ? 'density-compact' : undefined}
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <TopBar />

      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        {!leftCollapsed && (
          <div style={{ width: 380, flexShrink: 0, borderRight: '1px solid var(--c-border)' }}>
            <Conversation
              messages={messages}
              working={isLoading}
              providerName={providerName}
              attached={attached}
              attachedDisplay={(() => {
                const doc = files.find(file => file.name === attached)
                return doc ? docDisplayName(doc) : undefined
              })()}
              onSend={handleSend}
              onStop={stop}
              onNewChat={handleNewChat}
              onCollapse={() => setLeftCollapsed(true)}
              onAttach={handleAttach}
              onRemoveAttach={() => setAttached(null)}
              onErrorAction={handleErrorAction}
            />
          </div>
        )}

        <Suspense fallback={<div className="mg-grid" style={{ flex: 1, minWidth: 0, height: '100%', background: 'var(--c-bg)' }} />}>
          <MindMapCanvas onPickExample={handleSend} />
        </Suspense>

        {sourcesOpen && (
          <div style={{ width: 360, flexShrink: 0 }}>
            <SourcesDrawer />
          </div>
        )}

        {toast && (
          <div
            className="mg-fade-in"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 76,
              zIndex: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 8,
              padding: '8px 12px',
              background: 'var(--c-overlay)',
              border: '1px solid var(--c-border-strong)',
              boxShadow: 'var(--sh-2)',
              fontSize: 12,
              color: 'var(--c-text)',
            }}
          >
            <Icon name="check" size={14} style={{ color: 'var(--c-ok)' }} />
            {toast}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={(event) => {
          handleFilePicked(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}
