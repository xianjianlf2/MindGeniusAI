import type { Node } from '@antv/x6'
import { DataUri, Graph } from '@antv/x6'
import { Export } from '@antv/x6-plugin-export'
import { History } from '@antv/x6-plugin-history'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { IconName } from './ui/Icon'
import { Icon } from './ui/Icon'
import { HermasMark, IconButton } from './ui/primitives'
import { MindMapController } from '@/mindmap/controller'
import { registerMindMapShapes } from '@/mindmap/registry'
import { useNodeStore } from '@/stores/nodeStore'
import { useUiStore } from '@/stores/uiStore'
import { downloadText, treeToMarkdown, treeToMermaid, treeToOPML } from '@/utils/export'
import { IMPORT_ACCEPT, importToMarkdown } from '@/utils/import'
import { canMoveUnder } from '@/utils/patch'
import type { TKey } from '@/i18n'
import { useT } from '@/i18n'

const SHORTCUTS: { keys: string[]; labelKey: TKey }[] = [
  { keys: ['Tab'], labelKey: 'shortcut.addChild' },
  { keys: ['Enter'], labelKey: 'shortcut.addSibling' },
  { keys: ['F2'], labelKey: 'shortcut.rename' },
  { keys: ['Del'], labelKey: 'shortcut.delete' },
  { keys: ['⌘', 'Z'], labelKey: 'shortcut.undo' },
  { keys: ['⌘', '⇧', 'Z'], labelKey: 'shortcut.redo' },
  { keys: ['Alt', '⊟'], labelKey: 'shortcut.multiSelect' },
  { keys: ['×2'], labelKey: 'shortcut.edit' },
  { keys: ['Drag'], labelKey: 'shortcut.reparent' },
]

const EXAMPLE_TOPICS: { icon: IconName; titleKey: TKey; subKey: TKey; promptKey: TKey }[] = [
  { icon: 'file', titleKey: 'canvas.exampleDocTitle', subKey: 'canvas.exampleDocSub', promptKey: 'canvas.exampleDocPrompt' },
  { icon: 'gauge', titleKey: 'canvas.exampleGtmTitle', subKey: 'canvas.exampleGtmSub', promptKey: 'canvas.exampleGtmPrompt' },
  { icon: 'layers', titleKey: 'canvas.exampleRoadmapTitle', subKey: 'canvas.exampleRoadmapSub', promptKey: 'canvas.exampleRoadmapPrompt' },
  { icon: 'spark', titleKey: 'canvas.exampleBrainstormTitle', subKey: 'canvas.exampleBrainstormSub', promptKey: 'canvas.exampleBrainstormPrompt' },
]

function CanvasEmpty({ onPickExample, onImport }: { onPickExample: (prompt: string) => void; onImport: () => void }) {
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
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={onImport}
            className="no-drag"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              borderRadius: 9,
              padding: '8px 14px',
              fontSize: 12.5,
              color: 'var(--c-text-2)',
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
            <Icon name="upload" size={14} style={{ color: 'var(--c-text-3)' }} />
            {t('canvas.import')}
          </button>
        </div>
        <p className="mono" style={{ marginTop: 14, textAlign: 'center', fontSize: 11, color: 'var(--c-text-3)' }}>
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
  // 键盘加节点后，等下一次重渲染完成再选中并滚到新节点（resetCells 会重建 cell）
  const pendingSelectId = useRef<string | null>(null)
  const [graph, setGraph] = useState<Graph | null>(null)
  const [history, setHistory] = useState({ canUndo: false, canRedo: false })
  const [zoom, setZoom] = useState(1)
  const [exportMenu, setExportMenu] = useState(false)
  const [shortcutsMenu, setShortcutsMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nodes = useNodeStore(state => state.nodes)
  const flash = useUiStore(state => state.flash)
  const t = useT()

  const pickImportFile = () => fileInputRef.current?.click()

  const onImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // 允许连续导入同一文件
    if (!file)
      return
    try {
      const markdown = importToMarkdown(file.name, await file.text())
      const result = useNodeStore.getState().generateFromMarkdown(markdown)
      if (result.ok)
        flash(t('canvas.imported', { file: file.name }))
      else
        flash(t('canvas.importEmpty'))
    }
    catch {
      flash(t('canvas.importFailed'))
    }
  }

  const exportAs = (kind: 'png' | 'svg' | 'md' | 'opml' | 'mermaid') => {
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
    else if (kind === 'mermaid') {
      downloadText('mindmap.mmd', treeToMermaid(tree), 'text/vnd.mermaid')
      flash(t('canvas.exported', { file: 'mindmap.mmd' }))
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

    // 拖拽改父：拖动节点到另一个合法节点上，松手即重挂为其子节点
    const findDropTargetId = (dragged: Node): string | null => {
      const tree = useNodeStore.getState().nodes
      if (!tree)
        return null
      const center = dragged.getBBox().getCenter()
      const under = instance.getNodesFromPoint(center.x, center.y).filter((cell: Node) => cell.id !== dragged.id)
      return under.find((cell: Node) => canMoveUnder(tree, dragged.id, cell.id))?.id ?? null
    }
    instance.on('node:moving', ({ node }) => {
      useUiStore.getState().setDropTargetId(findDropTargetId(node))
    })
    instance.on('node:moved', ({ node }) => {
      const targetId = findDropTargetId(node)
      useUiStore.getState().setDropTargetId(null)
      const moved = targetId ? useNodeStore.getState().moveNode(node.id, targetId) : false
      // 落点无效（或没移成）：从单一数据源重渲染，把自由拖动的节点复位到布局
      if (!moved)
        controllerRef.current?.render(useNodeStore.getState().nodes)
    })
    // 焦点在输入框（节点重命名 / 对话框）时不抢快捷键
    const isTyping = () => {
      const el = document.activeElement
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
    }
    const selectedNode = () => instance.getSelectedCells().filter(cell => cell.isNode())[0]

    // 加节点后选中新节点并自动进入重命名（键盘流：Tab/Enter → 直接打字）
    const addAndEdit = (newId: string | null) => {
      if (!newId)
        return
      pendingSelectId.current = newId
      useUiStore.getState().setEditingNodeId(newId)
    }

    instance.bindKey(['backspace', 'delete'], () => {
      if (isTyping())
        return
      const ids = instance.getSelectedCells().filter(cell => cell.isNode()).map(cell => cell.id)
      if (ids.length)
        useNodeStore.getState().removeNodes(ids) // 框选多个一次删完
    })
    instance.bindKey('tab', (event) => {
      if (isTyping())
        return
      event.preventDefault()
      const node = selectedNode()
      if (node)
        addAndEdit(useNodeStore.getState().addChild(node.id))
    })
    instance.bindKey('enter', (event) => {
      if (isTyping())
        return
      event.preventDefault()
      const node = selectedNode()
      if (node)
        addAndEdit(useNodeStore.getState().addSibling(node.id))
    })
    instance.bindKey('f2', (event) => {
      if (isTyping())
        return
      event.preventDefault()
      const node = selectedNode()
      if (node)
        useUiStore.getState().setEditingNodeId(node.id)
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

    // 键盘新增的节点：重渲染后选中并滚入视野，让后续 Tab/Enter 接着它继续
    const pending = pendingSelectId.current
    if (pending && graph) {
      const cell = graph.getCellById(pending)
      if (cell) {
        graph.resetSelection(cell)
        // 只在新节点跑出视口时才居中，避免连续加节点时整图乱跳
        if (cell.isNode() && !graph.getGraphArea().isIntersectWithRect(cell.getBBox()))
          graph.centerCell(cell)
      }
      pendingSelectId.current = null
    }
  }, [nodes, graph])

  const fit = () => graph?.zoomToFit({ padding: 20, minScale: 0.3, maxScale: 1.15 })
  const isEmpty = !nodes

  return (
    <div className="mg-grid" style={{ position: 'relative', flex: 1, minWidth: 0, height: '100%', background: 'var(--c-bg)' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, visibility: isEmpty ? 'hidden' : 'visible' }} />

      <input
        ref={fileInputRef}
        type="file"
        accept={IMPORT_ACCEPT}
        onChange={onImportFile}
        style={{ display: 'none' }}
      />

      {isEmpty && <CanvasEmpty onPickExample={onPickExample} onImport={pickImportFile} />}

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
          <IconButton
            icon="newMap"
            label={t('canvas.newMap')}
            onClick={() => {
              // eslint-disable-next-line no-alert
              if (window.confirm(t('canvas.newMapConfirm')))
                useNodeStore.getState().reset()
            }}
          />
          <IconButton icon="upload" label={t('canvas.import')} onClick={pickImportFile} />
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
                  {([['png', 'canvas.exportPng'], ['svg', 'canvas.exportSvg'], ['md', 'canvas.exportMd'], ['opml', 'canvas.exportOpml'], ['mermaid', 'canvas.exportMermaid']] as const).map(([kind, labelKey]) => (
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
          <span style={{ width: 1, height: 18, background: 'var(--c-border)' }} />
          <div style={{ position: 'relative' }}>
            <IconButton icon="help" label={t('canvas.shortcuts')} active={shortcutsMenu} onClick={() => setShortcutsMenu(open => !open)} />
            {shortcutsMenu && (
              <>
                <button
                  type="button"
                  aria-label={t('canvas.closeShortcuts')}
                  onClick={() => setShortcutsMenu(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 39, cursor: 'default' }}
                />
                <div
                  className="mg-fade-in"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 40,
                    width: 220,
                    borderRadius: 10,
                    padding: 8,
                    background: 'var(--c-overlay)',
                    border: '1px solid var(--c-border-strong)',
                    boxShadow: 'var(--sh-3)',
                  }}
                >
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--c-text-3)', letterSpacing: '0.06em', padding: '2px 4px 8px' }}>
                    {t('canvas.shortcuts').toUpperCase()}
                  </div>
                  {SHORTCUTS.map(({ keys, labelKey }) => (
                    <div
                      key={labelKey}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '5px 4px' }}
                    >
                      <span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>{t(labelKey)}</span>
                      <span style={{ display: 'flex', gap: 3 }}>
                        {keys.map(key => (
                          <kbd
                            key={key}
                            className="mono"
                            style={{
                              minWidth: 18,
                              textAlign: 'center',
                              fontSize: 10.5,
                              padding: '2px 5px',
                              borderRadius: 5,
                              color: 'var(--c-text)',
                              background: 'var(--c-surface-2)',
                              border: '1px solid var(--c-border-strong)',
                            }}
                          >
                            {key}
                          </kbd>
                        ))}
                      </span>
                    </div>
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
