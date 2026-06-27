import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from './ui/Icon'
import type { MindMapData } from '@/utils/convertMarkdown'
import type { DocFile } from '@/stores/docStore'
import { docDisplayName, useDocStore } from '@/stores/docStore'
import { useNodeStore } from '@/stores/nodeStore'
import { useSavedMapsStore } from '@/stores/savedMapsStore'
import { useUiStore } from '@/stores/uiStore'
import { useT } from '@/i18n'

/* ---------- 模糊匹配：优先连续子串，退化为子序列；返回命中区间用于高亮 ---------- */
function fuzzyRanges(text: string, query: string): [number, number][] | null {
  if (!query)
    return []
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  const idx = lower.indexOf(q)
  if (idx >= 0)
    return [[idx, idx + q.length]]
  const ranges: [number, number][] = []
  let cursor = 0
  for (const ch of q) {
    const found = lower.indexOf(ch, cursor)
    if (found < 0)
      return null
    ranges.push([found, found + 1])
    cursor = found + 1
  }
  return ranges
}

function Highlight({ text, ranges }: { text: string; ranges: [number, number][] }) {
  if (!ranges.length)
    return <>{text}</>
  const out: ReactNode[] = []
  let cursor = 0
  ranges.forEach(([start, end], i) => {
    if (start > cursor)
      out.push(text.slice(cursor, start))
    out.push(<span key={i} style={{ color: 'var(--c-accent)', fontWeight: 600 }}>{text.slice(start, end)}</span>)
    cursor = end
  })
  if (cursor < text.length)
    out.push(text.slice(cursor))
  return <>{out}</>
}

function relativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts)
  const min = Math.floor(diff / 60000)
  if (min < 1)
    return 'just now'
  if (min < 60)
    return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24)
    return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day === 1)
    return 'yesterday'
  if (day < 7)
    return `${day}d ago`
  return `${Math.floor(day / 7)}w ago`
}

const MONO_EYEBROW: CSSProperties = {
  fontFamily: 'var(--f-mono)',
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--c-text-3)',
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 10,
        padding: '2px 5px',
        borderRadius: 4,
        color: 'var(--c-text-2)',
        border: '1px solid var(--c-border-strong)',
        background: 'var(--c-surface-2)',
      }}
    >
      {children}
    </span>
  )
}

interface MapItem { kind: 'map'; id: string; title: string; tree: MindMapData; nodeCount: number; updatedAt: number; ranges: [number, number][] }
interface DocItem { kind: 'doc'; id: string; name: string; title: string; status: DocFile['status']; attached: boolean; ranges: [number, number][] }
type Item = MapItem | DocItem

export function CommandPalette() {
  const t = useT()
  const open = useUiStore(state => state.paletteOpen)
  const setOpen = useUiStore(state => state.setPaletteOpen)
  const flash = useUiStore(state => state.flash)
  const maps = useSavedMapsStore(state => state.maps)
  const files = useDocStore(state => state.files)
  const attached = useDocStore(state => state.attached)
  const toggleAttached = useDocStore(state => state.toggleAttached)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const now = useMemo(() => Date.now(), [open, maps, files])

  // 打开时重置查询、聚焦输入
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const docs = useMemo(
    () => files.filter(file => !file.name.startsWith('__uploading__')),
    [files],
  )

  // 过滤 + 分组（空查询=最近，按 updatedAt/上传序）
  const { mapItems, docItems } = useMemo(() => {
    const mapItems: MapItem[] = []
    for (const map of maps) {
      const ranges = fuzzyRanges(map.title, query)
      if (ranges)
        mapItems.push({ kind: 'map', id: map.id, title: map.title, tree: map.tree, nodeCount: map.nodeCount, updatedAt: map.updatedAt, ranges })
    }
    const docItems: DocItem[] = []
    for (const doc of docs) {
      const title = docDisplayName(doc)
      const ranges = fuzzyRanges(title, query)
      if (ranges)
        docItems.push({ kind: 'doc', id: doc.name, name: doc.name, title, status: doc.status, attached: attached.includes(doc.name), ranges })
    }
    const limit = query ? Number.POSITIVE_INFINITY : 6
    return { mapItems: mapItems.slice(0, limit), docItems: docItems.slice(0, limit) }
  }, [maps, docs, attached, query])

  const items: Item[] = useMemo(() => [...mapItems, ...docItems], [mapItems, docItems])
  const hasAny = items.length > 0
  const firstRun = maps.length === 0 && docs.length === 0

  // 选中索引夹紧 + 滚动可见
  useEffect(() => {
    setSelected(prev => Math.min(prev, Math.max(0, items.length - 1)))
  }, [items.length])
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-row="${selected}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open)
    return null

  const runMap = (item: MapItem) => {
    useNodeStore.getState().loadTree(item.tree)
    flash(t('palette.opened', { title: item.title }))
    setOpen(false)
  }
  const runDoc = (item: DocItem) => {
    toggleAttached(item.name)
  }
  const exec = (item: Item) => {
    if (item.kind === 'map')
      runMap(item)
    else runDoc(item)
  }
  const previewDoc = (item: DocItem) => {
    window.open(`/api/${item.name}`, '_blank', 'noopener')
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (!hasAny)
      return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelected(prev => (prev + 1) % items.length)
    }
    else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelected(prev => (prev - 1 + items.length) % items.length)
    }
    else if (event.key === 'Enter') {
      event.preventDefault()
      const item = items[selected]
      if (!item)
        return
      if ((event.metaKey || event.ctrlKey) && item.kind === 'doc')
        previewDoc(item)
      else exec(item)
    }
  }

  const resultLabel = query
    ? t('palette.results', { n: String(items.length) })
    : null

  let flatIndex = -1
  const renderRow = (item: Item) => {
    flatIndex += 1
    const index = flatIndex
    const isSel = index === selected
    const isMap = item.kind === 'map'
    return (
      <div
        key={item.kind + item.id}
        data-row={index}
        onMouseEnter={() => setSelected(index)}
        onClick={() => (item.kind === 'map' ? runMap(item) : runDoc(item))}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 18px',
          margin: '0 8px',
          borderRadius: 7,
          cursor: 'pointer',
          background: isSel ? 'var(--c-accent-soft)' : 'transparent',
        }}
      >
        {isSel && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 99, background: 'var(--c-accent)' }} />}
        <div
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            position: 'relative',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 7,
            background: 'var(--c-surface-2)',
            border: `1px solid ${(!isMap && item.attached) ? 'var(--c-accent-line)' : 'var(--c-border)'}`,
            color: isSel || (!isMap && item.attached) ? 'var(--c-accent)' : 'var(--c-text-2)',
          }}
        >
          <Icon name={isMap ? 'node' : 'file'} size={14} />
          {!isMap && item.attached && (
            <span style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, display: 'grid', placeItems: 'center', borderRadius: 99, background: 'var(--c-accent)' }}>
              <Icon name="check" size={8} style={{ color: 'var(--c-bg)' }} />
            </span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--c-text)', fontWeight: isSel ? 600 : 500, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Highlight text={item.title} ranges={item.ranges} />
          </div>
          <div className="mono" style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: 11, color: 'var(--c-text-3)' }}>
            {isMap
              ? <><span>{relativeTime(item.updatedAt, now)}</span><span>·</span><span>{t('palette.nodes', { n: String(item.nodeCount) })}</span></>
              : <><span style={{ color: item.status === 'ready' ? 'var(--c-ok)' : item.status === 'idle' ? 'var(--c-text-3)' : 'var(--c-warn)' }}>{t(item.status === 'ready' ? 'palette.statusIndexed' : item.status === 'idle' ? 'palette.statusUnindexed' : 'palette.statusIndexing')}</span>{item.attached && <><span>·</span><span style={{ color: 'var(--c-accent)' }}>{t('palette.attached')}</span></>}</>}
          </div>
        </div>
        {isSel && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-text)', fontWeight: 500 }}>
            {isMap ? t('palette.open') : (item.attached ? t('palette.detach') : t('palette.attach'))}
            <Kbd>↵</Kbd>
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      onMouseDown={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'grid',
        placeItems: 'start center',
        paddingTop: '14vh',
        background: 'rgba(8,9,12,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'mg-fade-in .15s ease',
      }}
    >
      <div
        className="mg-fade-in"
        onMouseDown={event => event.stopPropagation()}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
        style={{
          width: 'min(600px, calc(100vw - 32px))',
          maxHeight: '64vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          background: 'var(--c-overlay)',
          border: '1px solid var(--c-border-strong)',
          boxShadow: 'var(--sh-pop)',
          overflow: 'hidden',
        }}
      >
        {/* 搜索行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', height: 56, flexShrink: 0, borderBottom: `1px solid ${query ? 'var(--c-accent-line)' : 'var(--c-border)'}` }}>
          <Icon name="search" size={16} style={{ color: query ? 'var(--c-accent)' : 'var(--c-text-3)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('palette.placeholder')}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: 'var(--c-text)' }}
          />
          {resultLabel
            ? <span className="mono" style={{ fontSize: 10, padding: '3px 7px', borderRadius: 4, color: items.length ? 'var(--c-text-2)' : 'var(--c-warn)', border: `1px solid ${items.length ? 'var(--c-border)' : 'var(--c-warn-soft)'}`, background: 'var(--c-surface-2)' }}>{resultLabel}</span>
            : <Kbd>Esc</Kbd>}
        </div>

        {/* 列表 */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 0 8px' }}>
          {hasAny && (
            <>
              {mapItems.length > 0 && (
                <>
                  <GroupHeader label={query ? t('palette.maps') : t('palette.recentMaps')} count={mapItems.length} />
                  {mapItems.map(renderRow)}
                </>
              )}
              {docItems.length > 0 && (
                <>
                  <GroupHeader label={query ? t('palette.documents') : t('palette.recentDocuments')} count={docItems.length} />
                  {docItems.map(renderRow)}
                </>
              )}
            </>
          )}

          {!hasAny && (
            <div style={{ padding: '44px 24px 32px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 18px', display: 'grid', placeItems: 'center', borderRadius: 99, background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', color: 'var(--c-text-3)' }}>
                <Icon name="search" size={22} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--c-text)', marginBottom: 6 }}>
                {firstRun ? t('palette.emptyGalleryTitle') : t('palette.noMatchTitle', { q: query })}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--c-text-2)', maxWidth: 360, margin: '0 auto 24px' }}>
                {firstRun ? t('palette.emptyGalleryDesc') : t('palette.noMatchDesc')}
              </div>
              {!firstRun && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      flash(t('palette.seedHint'))
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, color: 'var(--c-accent)', background: 'var(--c-accent-soft)', border: '1px solid var(--c-accent-line)' }}
                  >
                    <Icon name="plus" size={12} />
                    {t('palette.newMapFrom', { q: query })}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部快捷键栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: 40, flexShrink: 0, background: 'var(--c-bg)', borderTop: '1px solid var(--c-border)' }}>
          <div className="mono" style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--c-text-2)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Kbd>↑↓</Kbd> {t('palette.kbdNav')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Kbd>↵</Kbd> {t('palette.kbdEnter')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Kbd>⌘↵</Kbd> {t('palette.kbdPreview')}</span>
          </div>
          {attached.length > 0 && (
            <span className="mono" style={{ fontSize: 11, color: 'var(--c-accent)' }}>{t('palette.attachedCount', { n: String(attached.length) })}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px' }}>
      <span style={MONO_EYEBROW}>{label}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--c-border)' }} />
      <span className="mono" style={{ fontSize: 10, color: 'var(--c-text-3)' }}>{count}</span>
    </div>
  )
}
