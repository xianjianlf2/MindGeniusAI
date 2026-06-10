import { CheckCircleOutlined, LoadingOutlined, ToolOutlined } from '@ant-design/icons'
import { Collapse, Tag } from 'antd'
import type { AgentStep } from '@/stores/chatStore'

const TOOL_LABELS: Record<string, string> = {
  mindmap_generate: '生成思维导图',
  node_expand: '扩展节点',
  rag_query: '检索文档',
}

function previewJson(value: unknown, max = 600) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return text.length > max ? `${text.slice(0, max)}…` : text
}

/** Hermas Agent 执行步骤可视化：每个工具调用一条，可展开看入参/结果 */
export function AgentSteps({ steps }: { steps: AgentStep[] }) {
  if (steps.length === 0)
    return null

  return (
    <Collapse
      size="small"
      style={{ marginBottom: 8 }}
      items={steps.map((step, index) => ({
        key: step.toolCallId || String(index),
        label: (
          <span>
            <ToolOutlined style={{ marginRight: 6 }} />
            {TOOL_LABELS[step.toolName] ?? step.toolName}
            {' '}
            {step.done
              ? <Tag icon={<CheckCircleOutlined />} color="success">done</Tag>
              : <Tag icon={<LoadingOutlined />} color="processing">running</Tag>}
          </span>
        ),
        children: (
          <div style={{ fontSize: 12 }}>
            <div style={{ color: '#94a3b8' }}>输入</div>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{previewJson(step.input)}</pre>
            {step.done && (
              <>
                <div style={{ color: '#94a3b8' }}>结果</div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{previewJson(step.output)}</pre>
              </>
            )}
          </div>
        ),
      }))}
    />
  )
}
