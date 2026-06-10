import { CompressOutlined, DownloadOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons'
import { DataUri, Graph } from '@antv/x6'
import { Export } from '@antv/x6-plugin-export'
import { History } from '@antv/x6-plugin-history'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { Selection } from '@antv/x6-plugin-selection'
import { Button, Space, Tooltip } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { MindMapController } from '@/mindmap/controller'
import { registerMindMapShapes } from '@/mindmap/registry'
import { useNodeStore } from '@/stores/nodeStore'

export function MindMapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<MindMapController | null>(null)
  const [graph, setGraph] = useState<Graph | null>(null)
  const [history, setHistory] = useState({ canUndo: false, canRedo: false })
  const nodes = useNodeStore(state => state.nodes)

  useEffect(() => {
    registerMindMapShapes()
    const instance = new Graph({
      container: containerRef.current!,
      mousewheel: { enabled: true },
      autoResize: true,
      panning: true,
      background: { color: '#0F1729' },
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
    instance.bindKey(['backspace', 'delete'], () => {
      const selected = instance.getSelectedCells().filter(cell => cell.isNode())
      if (selected.length)
        controller.removeNode(selected[0].id)
    })
    instance.bindKey('tab', (event) => {
      event.preventDefault()
      const selected = instance.getSelectedCells().filter(cell => cell.isNode())
      if (selected.length)
        controller.addChild(selected[0].id)
    })

    setGraph(instance)
    return () => {
      instance.dispose()
      controllerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (nodes && controllerRef.current)
      controllerRef.current.setData(nodes)
  }, [nodes])

  return (
    <div style={{ position: 'relative', flex: 1, height: '100%', background: '#0F1729', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <Space style={{ background: '#1e293b', borderRadius: 8, padding: '4px 8px', border: '1px solid #334155' }}>
          <Tooltip title="Undo">
            <Button type="text" disabled={!history.canUndo} icon={<UndoOutlined />} onClick={() => graph?.undo()} />
          </Tooltip>
          <Tooltip title="Redo">
            <Button type="text" disabled={!history.canRedo} icon={<RedoOutlined />} onClick={() => graph?.redo()} />
          </Tooltip>
          <Tooltip title="Fit screen">
            <Button type="text" icon={<CompressOutlined />} onClick={() => graph?.zoomToFit({ padding: 20 })} />
          </Tooltip>
          <Tooltip title="Export PNG">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => graph?.toPNG((dataUri) => {
                DataUri.downloadDataUri(dataUri, 'mind-map.png')
              }, { backgroundColor: '#18212F', padding: 20 })}
            />
          </Tooltip>
        </Space>
      </div>
      <div ref={containerRef} style={{ flex: 1 }} />
    </div>
  )
}
