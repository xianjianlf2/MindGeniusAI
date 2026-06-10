import { DeleteOutlined, LoadingOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { Graph, Node } from '@antv/x6'
import { useEffect, useRef, useState } from 'react'
import type { NodeComponentData } from './controller'
import { fetchStream } from '@/api/sse'
import { extractListItems } from '@/utils/convertMarkdown'

const palette: Record<string, { background: string; color: string; fontSize: number }> = {
  'topic': { background: '#2563eb', color: '#fff', fontSize: 18 },
  'topic-branch': { background: '#1e293b', color: '#e2e8f0', fontSize: 16 },
  'topic-child': { background: 'transparent', color: '#94a3b8', fontSize: 14 },
}

/** X6 react-shape 节点：双击编辑，悬浮操作（加子节点 / AI 扩展 / 删除） */
export function TopicNode({ node }: { node: Node; graph: Graph }) {
  const { label, type, controller } = node.getData<NodeComponentData>()
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const [expanding, setExpanding] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing)
      inputRef.current?.select()
  }, [editing])

  const commitEdit = () => {
    setEditing(false)
    if (value.trim() && value !== label)
      controller.updateLabel(node.id, value.trim())
  }

  const expandWithAI = () => {
    if (expanding)
      return
    setExpanding(true)
    let buffer = ''
    fetchStream({
      url: '/api/chatNode',
      data: { content: label },
      onMessage: (delta) => { buffer += delta },
      onDone: () => {
        setExpanding(false)
        extractListItems(buffer).forEach(item => controller.addChild(node.id, item))
      },
      onError: () => setExpanding(false),
    })
  }

  const style = palette[type] ?? palette.topic
  const canHaveChildren = type !== 'topic-child'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        border: type === 'topic-child' ? '1px solid #334155' : 'none',
        background: style.background,
        color: style.color,
        fontSize: style.fontSize,
        position: 'relative',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        padding: '0 4px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => setEditing(true)}
    >
      {editing
        ? (
          <input
            ref={inputRef}
            value={value}
            style={{ width: '95%', fontSize: style.fontSize, border: 'none', outline: 'none', borderRadius: 4 }}
            onChange={event => setValue(event.target.value)}
            onBlur={commitEdit}
            onKeyDown={(event) => {
              if (event.key === 'Enter')
                commitEdit()
            }}
          />
          )
        : label}

      {hovered && !editing && (
        <div
          style={{
            position: 'absolute',
            top: -26,
            right: 0,
            display: 'flex',
            gap: 6,
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: '2px 6px',
            color: '#e2e8f0',
            fontSize: 14,
          }}
        >
          {canHaveChildren && (
            <PlusOutlined
              title="Add child"
              onClick={(event) => {
                event.stopPropagation()
                controller.addChild(node.id)
              }}
            />
          )}
          {canHaveChildren && (
            expanding
              ? <LoadingOutlined />
              : (
                <ThunderboltOutlined
                  title="AI brainstorm"
                  onClick={(event) => {
                    event.stopPropagation()
                    expandWithAI()
                  }}
                />
                )
          )}
          {type !== 'topic' && (
            <DeleteOutlined
              title="Delete"
              onClick={(event) => {
                event.stopPropagation()
                controller.removeNode(node.id)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
