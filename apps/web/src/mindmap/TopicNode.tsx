import type { Graph, Node } from '@antv/x6'
import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { NodeComponentData } from './controller'
import { fetchStream } from '@/api/sse'
import type { IconName } from '@/components/ui/Icon'
import { Icon } from '@/components/ui/Icon'
import { Spinner } from '@/components/ui/primitives'
import { useNodeStore } from '@/stores/nodeStore'
import { useUiStore } from '@/stores/uiStore'
import { extractListItems } from '@/utils/convertMarkdown'
import { useT } from '@/i18n'

/** 彩色分层模式下一级分支的色相环 */
const BRANCH_HUES = ['#5B8DEF', '#34D399', '#F2B14C', '#A78BFA', '#F4566B', '#FF6F59']

function NodeAction({ icon, title, danger, onClick }: {
  icon: IconName
  title: string
  danger?: boolean
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      title={title}
      className="no-drag"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      style={{
        width: 26,
        height: 26,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 7,
        color: danger && hover ? 'var(--c-err)' : hover ? 'var(--c-text)' : 'var(--c-text-2)',
        background: hover ? 'var(--c-elevated)' : 'transparent',
        transition: 'background .15s, color .15s',
      }}
    >
      <Icon name={icon} size={15} />
    </button>
  )
}

/** X6 react-shape 节点：双击编辑，悬浮操作（加子节点 / AI 头脑风暴 / 重命名 / 删除） */
export function TopicNode({ node }: { node: Node; graph: Graph }) {
  const t = useT()
  const { label, type, branchIndex } = node.getData<NodeComponentData>()
  const nodeStyle = useUiStore(state => state.nodeStyle)
  const isDropTarget = useUiStore(state => state.dropTargetId === node.id)
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const [expanding, setExpanding] = useState(false)
  const [flipBelow, setFlipBelow] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 悬浮时按节点离画布顶边的距离决定操作条放上方还是下方，避免顶部行被裁切点不到
  const onEnter = () => {
    const top = wrapperRef.current?.getBoundingClientRect().top ?? 999
    setFlipBelow(top < 72)
    setHovered(true)
  }

  useEffect(() => {
    if (editing)
      inputRef.current?.select()
  }, [editing])

  // 加子/兄弟节点或 F2 后，画布把 editingNodeId 指向本节点 → 自动进入重命名
  const editingNodeId = useUiStore(state => state.editingNodeId)
  useEffect(() => {
    if (editingNodeId === node.id) {
      setValue(label)
      setEditing(true)
      useUiStore.getState().setEditingNodeId(null)
    }
  }, [editingNodeId, node.id, label])

  const commitEdit = () => {
    setEditing(false)
    if (value.trim() && value !== label)
      useNodeStore.getState().updateLabel(node.id, value.trim())
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
        const add = useNodeStore.getState().addChild
        extractListItems(buffer).forEach(item => add(node.id, item))
      },
      onError: () => setExpanding(false),
    })
  }

  const isRoot = type === 'topic'
  const isBranch = type === 'topic-branch'
  const canHaveChildren = type !== 'topic-child'
  const hue = BRANCH_HUES[(branchIndex ?? 0) % BRANCH_HUES.length]

  let box: CSSProperties
  if (isRoot) {
    box = {
      background: 'var(--c-accent)',
      color: '#190b07',
      border: '1px solid transparent',
      fontWeight: 650,
      fontSize: 16,
      boxShadow: '0 8px 24px -8px var(--c-accent), 0 0 0 4px var(--c-accent-softer)',
    }
  }
  else if (isBranch) {
    box = {
      background: nodeStyle === 'colorful' ? 'rgba(255,255,255,0.02)' : 'var(--c-surface-2)',
      color: 'var(--c-text)',
      border: `1.5px solid ${nodeStyle === 'colorful' ? hue : 'var(--c-border-strong)'}`,
      fontWeight: 560,
      fontSize: 14,
    }
  }
  else {
    box = {
      background: nodeStyle === 'card' ? 'var(--c-surface-2)' : 'var(--c-surface)',
      color: 'var(--c-text-2)',
      border: '1px solid var(--c-border)',
      fontWeight: 500,
      fontSize: 13,
      boxShadow: nodeStyle === 'card' ? 'var(--sh-1)' : 'none',
    }
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 9,
        whiteSpace: 'nowrap',
        padding: '0 6px',
        cursor: 'default',
        transition: 'box-shadow .15s, border-color .15s',
        outline: isDropTarget
          ? '2px dashed var(--c-accent)'
          : hovered && !editing ? '2px solid var(--c-accent-line)' : 'none',
        outlineOffset: 2,
        ...box,
      }}
      onMouseEnter={onEnter}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => setEditing(true)}
    >
      {isBranch && nodeStyle !== 'mono' && (
        <span style={{ width: 7, height: 7, flexShrink: 0, borderRadius: 99, background: hue }} />
      )}

      {editing
        ? (
          <input
            ref={inputRef}
            value={value}
            style={{
              width: '95%',
              font: 'inherit',
              color: 'inherit',
              background: 'transparent',
              border: 'none',
              outline: 'none',
            }}
            onChange={event => setValue(event.target.value)}
            onBlur={commitEdit}
            onKeyDown={(event) => {
              if (event.key === 'Enter')
                commitEdit()
              if (event.key === 'Escape')
                setEditing(false)
            }}
          />
          )
        : <span>{label}</span>}

      {expanding && <Spinner size={13} />}

      {hovered && !editing && (
        <div
          className="mg-fade-in"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: flipBelow ? 'calc(100% + 8px)' : -36,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderRadius: 8,
            padding: '2px 4px',
            background: 'var(--c-overlay)',
            border: '1px solid var(--c-border-strong)',
            boxShadow: 'var(--sh-2)',
            whiteSpace: 'nowrap',
          }}
        >
          {canHaveChildren && (
            <NodeAction icon="plus" title={isRoot ? t('node.addBranch') : t('node.addChild')} onClick={() => useNodeStore.getState().addChild(node.id)} />
          )}
          {canHaveChildren && !expanding && (
            <NodeAction icon="spark" title={t('node.brainstorm')} onClick={expandWithAI} />
          )}
          <NodeAction icon="edit" title={t('node.rename')} onClick={() => setEditing(true)} />
          {!isRoot && (
            <NodeAction icon="trash" title={t('node.delete')} danger onClick={() => useNodeStore.getState().removeNode(node.id)} />
          )}
        </div>
      )}
    </div>
  )
}
