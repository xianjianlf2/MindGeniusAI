import { DataUri, Graph } from '@antv/x6'
import { Export } from '@antv/x6-plugin-export'
import { History } from '@antv/x6-plugin-history'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import { useEffect, useRef, useState } from 'react'
import type { IconName } from './ui/Icon'
import { Icon } from './ui/Icon'
import { HermasMark, IconButton } from './ui/primitives'
import { MindMapController } from '@/mindmap/controller'
import { registerMindMapShapes } from '@/mindmap/registry'
import { useNodeStore } from '@/stores/nodeStore'
import { useUiStore } from '@/stores/uiStore'
import { downloadText, treeToMarkdown, treeToOPML } from '@/utils/export'
import type { TKey } from '@/i18n'
import { useT } from '@/i18n'

const EXAMPLE_TOPICS: { icon: IconName; titleKey: TKey; subKey: TKey; promptKey: TKey }[] = [
  { icon: 'file', titleKey: 'canvas.exampleDocTitle', subKey: 'canvas.exampleDocSub', promptKey: 'canvas.exampleDocPrompt' },
  { icon: 'gauge', titleKey: 'canvas.exampleGtmTitle', subKey: 'canvas.exampleGtmSub', promptKey: 'canvas.exampleGtmPrompt' },
  { icon: 'layers', titleKey: 'canvas.exampleRoadmapTitle', subKey: 'canvas.exampleRoadmapSub', promptKey: 'canvas.exampleRoadmapPrompt' },
  { icon: 'spark', titleKey: 'canvas.exampleBrainstormTitle', subKey: 'canvas.exampleBrainstormSub', promptKey: 'canvas.exampleBrainstormPrompt' },
]

function CanvasEmpty({ onPickExample }: { onPickExample: (prompt: string) => void }) {
  const t = useT()
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: '0 24px', zIndex: 10 }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <HermasMark size={46} glow />
          <h2 style={{ marginTop: 20, fontSize: 23, fontWeight: 600, color: 'var(--c-text)', letterSpacing: '-0.01em' }}>
            {t('canvas.emptyHeading')}
          </h2>
          <p style={{ marginTop: 10, fontSize: 14, color: 'var(--c-text-2)', lineHeight: 1.65, maxWidth: 440 }}>
            {t('canvas.emptyDesc')}
          </p>
        </div>
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {EXAMPLE_TOPICS.map(topic => (
            <button
              type="button"
              key={topic.titleKey}
              onClick={() => onPickExample(t(topic.promptKey))}
              className="no-drag"
              style={{
                textAlign: 'left',
                borderRadius: 11,
                padding: 14,
                background: 'var(--c-surface-2)',
                border: '1px solid var(--c-border)',
                transition: 'background .15s, border-color .15s',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor = 'var(--c-border-strong)'
                event.currentTarget.style.background = 'var(--c-elevated)'
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor = 'var(--c-border)'
                event.currentTarget.style.background = 'var(--c-surface-2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 7,
                    background: 'var(--c-bg)',
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-accent)',
                  }}
                >
                  <Icon name={topic.icon} size={16} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 560, color: 'var(--c-text)' }}>{t(topic.titleKey)}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--c-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t(topic.subKey)}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="mono" style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--c-text-3)' }}>
          {t('canvas.emptyHint')}
        </p>
      </div>
    </div>
  )
}

export function MindMapCanvas({ onPickExample }: { onPickExample: (prompt: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<MindMapController | null>(null)
  const prevRootId = useRef<string | null>(null)
  const [graph, setGraph] = useState<Graph | null>(null)
  const [history, setHistory] = useState({ canUndo: false, canRedo: false })
  const [zoom, setZoom] = useState(1)
  const [exportMenu, setExportMenu] = useState(false)
  const nodes = useNodeStore(state => state.nodes)
  const flash = useUiStore(state => state.flash)
  const t = useT()

  const exportAs = (kind: 'png' | 'svg' | 'md' | 'opml') => {
    setExportMenu(false)
    if (kind === 'png') {
      graph?.toPNG((dataUri) => {
        DataUri.downloadDataUri(dataUri, 'mindmap.png')
        flash(t('canvas.exported', { file: 'mindmap.png' }))
      }, { backgroundColor: '#0B0D11', padding: 20 })
      return
    }
    if (kind === 'svg') {
      graph?.toSVG((svg) => {
        downloadText('mindmap.svg', svg, 'image/svg+xml')
        flash(t('canvas.exported', { file: 'mindmap.svg' }))
      })
      return
    }
    const tree = useNodeStore.getState().nodes
    if (!tree)
      return
    if (kind === 'md') {
      downloadText('mindmap.md', treeToMarkdown(tree), 'text/markdown')
      flash(t('canvas.exported', { file: 'mindmap.md' }))
    }
    else {
      downloadText('mindmap.opml', treeToOPML(tree), 'text/x-opml')
      flash(t('canvas.exported', { file: 'mindmap.opml' }))
    }
  }

  useEffect(() => {
    registerMindMapShapes()
    const instance = new Graph({
      container: containerRef.current!,
      mousewheel: { enabled: true },
      autoResize: true,
      panning: true,
    })
    instance.use(new Export())
    instance.use(new Selection({ multiple: true, modifiers: ['alt'], rubberband: true, showNodeSelectionBox: true, pointerEvents: 'none' }))
    instance.use(new Keyboard())
    instance.use(new History())

    const controller = new MindMapController(instance)
    controllerRef.current = controller

    instance.on('history:change', () => {
      setHistory({ canUndo: instance.canUndo(), canRedo: instance.canRedo() })
    })
    instance.on('scale', () => setZoom(instance.zoom()))
    instance.bindKey(['backspace', 'delete'], () => {
      const selected = instance.getSelectedCells().filter(cell => cell.isNode())
      if (selected.length)
        useNodeStore.getState().removeNode(selected[0].id)
    })
    instance.bindKey('tab', (event) => {
      event.preventDefault()
      const selected = instance.getSelectedCells().filter(cell => cell.isNode())
      if (selected.length)
        useNodeStore.getState().addChild(selected[0].id)
    })

    setGraph(instance)
    setZoom(instance.zoom())
    return () => {
      instance.dispose()
      controllerRef.current = null
    }
  }, [])

  // 单一数据源：nodes 变化即重渲染；仅在「新图」（根 id 变化）时缩放适配，编辑时保持视图
  useEffect(() => {
    const controller = controllerRef.current
    if (!controller)
      return
    controller.render(nodes)
    const rootId = nodes?.id ?? null
    if (rootId && rootId !== prevRootId.current)
      controller.fit()
    prevRootId.current = rootId
  }, [nodes])

  const fit = () => graph?.zoomToFit({ padding: 20, minScale: 0.3, maxScale: 1.15 })
  const isEmpty = !nodes

  return (
    <div className="mg-grid" style={{ position: 'relative', flex: 1, minWidth: 0, height: '100%', background: 'var(--c-bg)' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, visibility: isEmpty ? 'hidden' : 'visible' }} />

      {isEmpty && <CanvasEmpty onPickExample={onPickExample} />}

      {!isEmpty && (
        <div
          className="no-drag"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 20,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            borderRadius: 11,
            padding: '4px 6px',
            background: 'var(--c-overlay)',
            border: '1px solid var(--c-border-strong)',
            boxShadow: 'var(--sh-3)',
          }}
        >
          <IconButton icon="undo" label={t('canvas.undo')} kbd="⌘Z" disabled={!history.canUndo} onClick={() => graph?.undo()} />
          <IconButton icon="redo" label={t('canvas.redo')} kbd="⌘⇧Z" disabled={!history.canRedo} onClick={() => graph?.redo()} />
          <span style={{ width: 1, height: 18, background: 'var(--c-border)' }} />
          <IconButton icon="zoomOut" label={t('canvas.zoomOut')} onClick={() => graph?.zoom(-0.15)} />
          <button
            type="button"
            onClick={fit}
            className="mono tnum no-drag"
            style={{ fontSize: 11.5, padding: '0 6px', minWidth: 42, color: 'var(--c-text-2)' }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconButton icon="zoomIn" label={t('canvas.zoomIn')} onClick={() => graph?.zoom(0.15)} />
          <IconButton icon="fit" label={t('canvas.fit')} onClick={fit} />
          <span style={{ width: 1, height: 18, background: 'var(--c-border)' }} />
          <div style={{ position: 'relative' }}>
            <IconButton icon="download" label={t('canvas.export')} active={exportMenu} onClick={() => setExportMenu(open => !open)} />
            {exportMenu && (
              <>
                <button
                  type="button"
                  aria-label={t('canvas.closeExportMenu')}
                  onClick={() => setExportMenu(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 39, cursor: 'default' }}
                />
                <div
                  className="mg-fade-in"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 40,
                    minWidth: 152,
                    borderRadius: 10,
                    padding: 6,
                    background: 'var(--c-overlay)',
                    border: '1px solid var(--c-border-strong)',
                    boxShadow: 'var(--sh-3)',
                  }}
                >
                  {([['png', 'canvas.exportPng'], ['svg', 'canvas.exportSvg'], ['md', 'canvas.exportMd'], ['opml', 'canvas.exportOpml']] as const).map(([kind, labelKey]) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => exportAs(kind)}
                      className="no-drag"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderRadius: 7,
                        padding: '7px 9px',
                        textAlign: 'left',
                        fontSize: 12.5,
                        color: 'var(--c-text)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-elevated)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Icon name="download" size={13} style={{ color: 'var(--c-text-3)' }} />
                      {t(labelKey)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
