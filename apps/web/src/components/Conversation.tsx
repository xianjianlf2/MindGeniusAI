import { useEffect, useRef, useState } from 'react'
import { Markdown } from './Markdown'
import type { IconName } from './ui/Icon'
import { Icon } from './ui/Icon'
import { HermasMark, IconButton, Spinner, StatusPill } from './ui/primitives'
import type { AgentStep, UiMessage } from '@/stores/chatStore'
import type { TKey } from '@/i18n'
import { useT } from '@/i18n'

/* ---------- 工具元信息（与 apps/server/src/agent/tools.ts 对应） ---------- */
const TOOL_META: Record<string, { labelKey: TKey; icon: IconName }> = {
  mindmap_generate: { labelKey: 'conv.toolMindmapGenerate', icon: 'node' },
  node_expand: { labelKey: 'conv.toolNodeExpand', icon: 'spark' },
  rag_query: { labelKey: 'conv.toolRagQuery', icon: 'search' },
  mindmap_edit: { labelKey: 'conv.toolMindmapEdit', icon: 'edit' },
}

/* ---------- 错误分类 ---------- */
export type ErrorKind = 'apikey' | 'ratelimit' | 'timeout' | 'generic'

export function classifyError(message: string): ErrorKind {
  const lower = message.toLowerCase()
  if (lower.includes('key') || lower.includes('unauthorized') || lower.includes('401'))
    return 'apikey'
  if (lower.includes('429') || lower.includes('rate'))
    return 'ratelimit'
  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('aborted'))
    return 'timeout'
  return 'generic'
}

const ERROR_META: Record<ErrorKind, { icon: IconName; titleKey: TKey; descKey?: TKey; actionKey: TKey; tone: 'error' | 'warn' }> = {
  apikey: { icon: 'alert', titleKey: 'conv.errorApikeyTitle', descKey: 'conv.errorApikeyDesc', actionKey: 'conv.errorApikeyAction', tone: 'error' },
  ratelimit: { icon: 'gauge', titleKey: 'conv.errorRatelimitTitle', descKey: 'conv.errorRatelimitDesc', actionKey: 'conv.errorRatelimitAction', tone: 'warn' },
  timeout: { icon: 'clock', titleKey: 'conv.errorTimeoutTitle', descKey: 'conv.errorTimeoutDesc', actionKey: 'conv.errorTimeoutAction', tone: 'warn' },
  generic: { icon: 'alert', titleKey: 'conv.errorGenericTitle', actionKey: 'conv.errorGenericAction', tone: 'error' },
}

/* ---------- 紧凑 key/value 渲染 ---------- */
function KV({ data }: { data: Record<string, unknown> }) {
  return (
    <div>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', gap: 8, padding: '2px 0', fontSize: 11 }}>
          <span className="mono" style={{ flexShrink: 0, minWidth: 64, color: 'var(--c-text-3)' }}>{key}</span>
          {Array.isArray(value)
            ? (
              <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {value.map((item, index) => (
                  <span
                    key={index}
                    className="mono"
                    style={{ fontSize: 10.5, padding: '1px 6px', borderRadius: 4, background: 'var(--c-bg)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)' }}
                  >
                    {String(item)}
                  </span>
                ))}
              </span>
              )
            : <span className="mono" style={{ color: 'var(--c-text)', wordBreak: 'break-all' }}>{String(value)}</span>}
        </div>
      ))}
    </div>
  )
}

/* ---------- rag_query 命中片段（服务端返回 "[1] …\n\n[2] …"） ---------- */
function Hits({ text }: { text: string }) {
  const hits = text.split(/\n\n+/).map((chunk) => {
    const match = chunk.match(/^\[(\d+)\]\s*([\s\S]*)$/)
    return match ? { index: match[1], text: match[2] } : { index: '·', text: chunk }
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {hits.map((hit, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, borderRadius: 7, padding: 8, background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
          <span
            className="mono"
            style={{ flexShrink: 0, fontSize: 9.5, padding: '1px 5px', height: 16, lineHeight: '14px', borderRadius: 4, background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
          >
            {hit.index}
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--c-text-2)', lineHeight: 1.5, wordBreak: 'break-word' }}>{hit.text}</span>
        </div>
      ))}
    </div>
  )
}

function ToolOutput({ step }: { step: AgentStep }) {
  if (typeof step.output === 'string') {
    if (step.toolName === 'rag_query' && step.output.startsWith('['))
      return <Hits text={step.output} />
    return (
      <div
        className="mono"
        style={{ fontSize: 11, color: 'var(--c-text-2)', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 180, overflowY: 'auto' }}
      >
        {step.output}
      </div>
    )
  }
  if (step.output && typeof step.output === 'object')
    return <KV data={step.output as Record<string, unknown>} />
  return null
}

/* ---------- 工具步骤卡片 ---------- */
function ToolCard({ step, working }: { step: AgentStep; working: boolean }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const meta = TOOL_META[step.toolName]
  const label = meta ? t(meta.labelKey) : step.toolName
  const icon: IconName = meta?.icon ?? 'layers'
  const status = step.done ? 'done' : working ? 'running' : 'stopped'
  const tone = status === 'done' ? 'done' : status === 'stopped' ? 'idle' : 'running'
  const statusLabel = status === 'done' ? t('conv.statusDone') : status === 'stopped' ? t('conv.statusStopped') : t('conv.statusRunning')

  return (
    <div
      className={status === 'running' ? 'mg-card-in an-beam' : 'mg-card-in'}
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        background: 'var(--c-surface-2)',
        border: `1px solid ${status === 'running' ? 'var(--c-ember-line)' : 'var(--c-border)'}`,
        boxShadow: status === 'running' ? 'var(--hl-top)' : 'none',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="no-drag"
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textAlign: 'left' }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 7,
            background: 'var(--c-bg)',
            border: '1px solid var(--c-border)',
            color: status === 'running' ? 'var(--c-ember)' : 'var(--c-accent)',
          }}
        >
          <Icon name={icon} size={15} />
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span className="mono" style={{ display: 'block', fontSize: 11, color: 'var(--c-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {step.toolName}
          </span>
          <span style={{ display: 'block', fontSize: 12.5, color: 'var(--c-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        </span>
        <StatusPill tone={tone}>{statusLabel}</StatusPill>
        <span style={{ color: 'var(--c-text-3)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>
          <Icon name="chevRight" size={14} />
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid var(--c-border)' }}>
          <div style={{ paddingTop: 10 }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--c-text-3)', letterSpacing: '0.06em', marginBottom: 4 }}>INPUT</div>
            {step.input && typeof step.input === 'object'
              ? <KV data={step.input as Record<string, unknown>} />
              : <span className="mono" style={{ fontSize: 11, color: 'var(--c-text-2)' }}>{String(step.input ?? '')}</span>}
          </div>
          {status === 'running'
            ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, fontSize: 11, color: 'var(--c-text-3)' }}>
                <Spinner size={12} />
                {` ${t('conv.executing')}`}
              </div>
              )
            : (
              <div style={{ paddingTop: 10, marginTop: 8, borderTop: '1px dashed var(--c-border)' }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--c-text-3)', letterSpacing: '0.06em', marginBottom: 6 }}>OUTPUT</div>
                <ToolOutput step={step} />
              </div>
              )}
        </div>
      )}
    </div>
  )
}

/* ---------- 错误卡片 ---------- */
function ErrorCard({ message, onAction }: { message: string; onAction: (kind: ErrorKind) => void }) {
  const t = useT()
  const kind = classifyError(message)
  const meta = ERROR_META[kind]
  const color = meta.tone === 'error' ? 'var(--c-err)' : 'var(--c-warn)'
  const background = meta.tone === 'error' ? 'var(--c-err-soft)' : 'var(--c-warn-soft)'
  return (
    <div className="mg-card-in" style={{ display: 'flex', gap: 10, borderRadius: 10, padding: 12, background, border: `1px solid ${color}33` }}>
      <span style={{ color, flexShrink: 0, marginTop: 2 }}><Icon name={meta.icon} size={17} /></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--c-text)' }}>{t(meta.titleKey)}</div>
        <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--c-text-2)', lineHeight: 1.55, wordBreak: 'break-word' }}>
          {meta.descKey ? t(meta.descKey) : message}
        </div>
        <button
          type="button"
          onClick={() => onAction(kind)}
          className="no-drag"
          style={{
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 7,
            padding: '4px 10px',
            fontSize: 11.5,
            fontWeight: 600,
            color,
            background: 'var(--c-bg)',
            border: `1px solid ${color}55`,
          }}
        >
          <Icon name={kind === 'apikey' ? 'sliders' : 'refresh'} size={13} />
          {t(meta.actionKey)}
        </button>
      </div>
    </div>
  )
}

/* ---------- 消息气泡 ---------- */
function UserMsg({ message }: { message: UiMessage }) {
  return (
    <div className="mg-card-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      {message.pdf && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 7, padding: '4px 8px', background: 'var(--c-elevated)', border: '1px solid var(--c-border)' }}>
          <Icon name="file" size={12} style={{ color: 'var(--c-accent)' }} />
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--c-text-2)' }}>{message.pdf}</span>
        </div>
      )}
      <div
        style={{
          maxWidth: '88%',
          borderRadius: '11px 11px 3px 11px',
          padding: '8px 12px',
          background: 'var(--c-elevated)',
          color: 'var(--c-text)',
          fontSize: 13,
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {message.content}
      </div>
    </div>
  )
}

function AssistantBlock({ message, working, isLast, onErrorAction }: {
  message: UiMessage
  working: boolean
  isLast: boolean
  onErrorAction: (kind: ErrorKind) => void
}) {
  const streaming = working && isLast && !message.error
  return (
    <div className="mg-card-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {(message.steps ?? []).map(step => <ToolCard key={step.toolCallId} step={step} working={working && isLast} />)}
      {(message.content || streaming) && (
        <div style={{ display: 'flex', gap: 10 }}>
          <HermasMark size={26} />
          <div style={{ minWidth: 0, flex: 1, paddingTop: 2, fontSize: 13, color: 'var(--c-text)', lineHeight: 1.65 }}>
            {message.content && <Markdown content={message.content} />}
            {streaming && <span className="mg-caret" />}
          </div>
        </div>
      )}
      {message.error && <ErrorCard message={message.error} onAction={onErrorAction} />}
    </div>
  )
}

/* ---------- 左栏面板 ---------- */
interface ConversationProps {
  messages: UiMessage[]
  working: boolean
  providerName: string
  attached: string | null
  attachedDisplay?: string
  onSend: (text: string) => void
  onStop: () => void
  onNewChat: () => void
  onCollapse: () => void
  onAttach: () => void
  onRemoveAttach: () => void
  onErrorAction: (kind: ErrorKind) => void
}

export function Conversation({
  messages, working, providerName, attached, attachedDisplay,
  onSend, onStop, onNewChat, onCollapse, onAttach, onRemoveAttach, onErrorAction,
}: ConversationProps) {
  const t = useT()
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el)
      el.scrollTop = el.scrollHeight
  }, [messages, working])

  useEffect(() => {
    const ta = taRef.current
    if (!ta)
      return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 132)}px`
  }, [text])

  const send = () => {
    const value = text.trim()
    if (!value || working)
      return
    onSend(value)
    setText('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-surface)' }}>
      {/* 头部 */}
      <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', flexShrink: 0, borderBottom: '1px solid var(--c-border)' }}>
        <HermasMark size={28} glow={working} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--c-text)' }}>Hermas</span>
            <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: working ? 'var(--c-signal)' : 'var(--c-text-3)' }}>
              <span
                className={working ? 'an-breath' : undefined}
                style={{ width: 5, height: 5, borderRadius: 99, background: working ? 'var(--c-signal)' : 'var(--c-ok)', boxShadow: working ? '0 0 8px var(--c-signal)' : 'none' }}
              />
              {working ? t('conv.working') : t('conv.ready')}
            </span>
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--c-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t('conv.subtitle')} · {providerName}
          </div>
        </div>
        <IconButton icon="refresh" label={t('conv.newChat')} size={16} btn={30} onClick={onNewChat} />
        <IconButton icon="panelLeft" label={t('conv.collapse')} size={16} btn={30} onClick={onCollapse} />
      </div>

      {/* 消息流 */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 'var(--chat-gap)' }}>
        {messages.map((message, index) =>
          message.role === 'user'
            ? <UserMsg key={message.id} message={message} />
            : (
              <AssistantBlock
                key={message.id}
                message={message}
                working={working}
                isLast={index === messages.length - 1}
                onErrorAction={onErrorAction}
              />
              ),
        )}
      </div>

      {/* 输入框 */}
      <div style={{ padding: '4px 14px 14px', flexShrink: 0 }}>
        <div style={{ borderRadius: 12, background: 'var(--c-surface-2)', border: '1px solid var(--c-border-strong)', boxShadow: 'var(--sh-1)' }}>
          {attached && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 7, padding: '4px 8px', background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                <Icon name="file" size={12} style={{ color: 'var(--c-accent)' }} />
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--c-text-2)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachedDisplay ?? attached}
                </span>
                <button type="button" onClick={onRemoveAttach} className="no-drag" style={{ color: 'var(--c-text-3)', display: 'grid' }}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            </div>
          )}
          <textarea
            ref={taRef}
            value={text}
            rows={1}
            onChange={event => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send()
              }
            }}
            placeholder={t('conv.placeholder')}
            style={{
              width: '100%',
              background: 'transparent',
              outline: 'none',
              border: 'none',
              resize: 'none',
              padding: '10px 12px 0',
              fontSize: 13,
              color: 'var(--c-text)',
              lineHeight: 1.6,
              maxHeight: 132,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px 8px' }}>
            <IconButton icon="clip" label={t('conv.uploadPdf')} size={17} btn={30} onClick={onAttach} />
            <span className="mono" style={{ marginLeft: 'auto', marginRight: 4, fontSize: 10, color: 'var(--c-text-3)' }}>
              {working ? t('conv.hintWorking') : t('conv.hintEnter')}
            </span>
            {working
              ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="no-drag"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--c-err)',
                    background: 'var(--c-err-soft)',
                    border: '1px solid rgba(244,86,107,0.2)',
                  }}
                >
                  <Icon name="stop" size={13} />
                  {t('conv.stop')}
                </button>
                )
              : (
                <button
                  type="button"
                  onClick={send}
                  disabled={!text.trim()}
                  className="no-drag"
                  style={{
                    width: 30,
                    height: 30,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 8,
                    transition: 'background .15s',
                    background: text.trim() ? 'var(--c-accent)' : 'var(--c-elevated)',
                    color: text.trim() ? '#190b07' : 'var(--c-text-3)',
                    cursor: text.trim() ? 'pointer' : 'default',
                  }}
                >
                  <Icon name="send" size={16} />
                </button>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}
