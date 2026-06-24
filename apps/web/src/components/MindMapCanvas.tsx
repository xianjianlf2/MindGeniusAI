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

const EXAMPLE_TOPICS: { icon: IconName; title: string; sub: string; prompt: string }[] = [
  { icon: 'file', title: '拆解一份 PDF 文档', sub: '上传后让 Hermas 检索并结构化', prompt: '帮我把上传的文档拆解成一张结构化思维导图，覆盖核心论点和关键细节。' },
  { icon: 'gauge', title: '规划产品上线 (GTM)', sub: '市场 · 渠道 · 定价 · 节奏', prompt: '为一款 AI 笔记工具规划 Q3 上线计划，覆盖市场定位、渠道增长、定价与发布节奏。' },
  { icon: 'layers', title: '整理学习路线', sub: '把一个主题拆成可执行路径', prompt: '帮我整理一条「从零学习机器学习」的学习路线图，分阶段、给资源。' },
  { icon: 'spark', title: '头脑风暴选题', sub: '围绕一个方向发散想法', prompt: '围绕「面向开发者的技术播客」头脑风暴 12 个选题方向。' },
]

function CanvasEmpty({ onPickExample }: { onPickExample: (prompt: string) => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: '0 24px', zIndex: 10 }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <HermasMark size={46} glow />
          <h2 style={{ marginTop: 20, fontSize: 23, fontWeight: 600, color: 'var(--c-text)', letterSpacing: '-0.01em' }}>
            和 Hermas 一起，把想法画成导图
          </h2>
          <p style={{ marginTop: 10, fontSize: 14, color: 'var(--c-text-2)', lineHeight: 1.65, maxWidth: 440 }}>
            用一句话描述你的目标。Hermas 会自主规划、检索你上传的 PDF，并实时生成可编辑的思维导图。
          </p>
        </div>
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {EXAMPLE_TOPICS.map(topic => (
            <button
              type="button"
              key={topic.title}
              onClick={() => onPickExample(topic.prompt)}
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
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 560, color: 'var(--c-text)' }}>{topic.title}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--c-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {topic.sub}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="mono" style={{ marginTop: 20, textAlign: 'center', fontSize: 11, color: 'var(--c-text-3)' }}>
          或在左侧对话框直接输入 · 支持 📎 上传 PDF 作为上下文
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
  const nodes = useNodeStore(state => state.nodes)
  const flash = useUiStore(state => state.flash)

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
          <IconButton icon="undo" label="撤销" kbd="⌘Z" disabled={!history.canUndo} onClick={() => graph?.undo()} />
          <IconButton icon="redo" label="重做" kbd="⌘⇧Z" disabled={!history.canRedo} onClick={() => graph?.redo()} />
          <span style={{ width: 1, height: 18, background: 'var(--c-border)' }} />
          <IconButton icon="zoomOut" label="缩小" onClick={() => graph?.zoom(-0.15)} />
          <button
            type="button"
            onClick={fit}
            className="mono tnum no-drag"
            style={{ fontSize: 11.5, padding: '0 6px', minWidth: 42, color: 'var(--c-text-2)' }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconButton icon="zoomIn" label="放大" onClick={() => graph?.zoom(0.15)} />
          <IconButton icon="fit" label="适应屏幕" onClick={fit} />
          <span style={{ width: 1, height: 18, background: 'var(--c-border)' }} />
          <IconButton
            icon="download"
            label="导出 PNG"
            onClick={() => graph?.toPNG((dataUri) => {
              DataUri.downloadDataUri(dataUri, 'mindmap.png')
              flash('已导出 mindmap.png')
            }, { backgroundColor: '#0A0E17', padding: 20 })}
          />
        </div>
      )}
    </div>
  )
}
