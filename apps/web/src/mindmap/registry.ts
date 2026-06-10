import { Graph, Path } from '@antv/x6'
import { register } from '@antv/x6-react-shape'
import { TopicNode } from './TopicNode'

let registered = false

/** 全局注册自定义 connector / edge / react 节点（幂等） */
export function registerMindMapShapes() {
  if (registered)
    return
  registered = true

  Graph.registerConnector(
    'mindmap',
    (sourcePoint, targetPoint, _routerPoints, options) => {
      const midX = sourcePoint.x + 10
      const midY = sourcePoint.y
      const ctrX = (targetPoint.x - midX) / 5 + midX
      const ctrY = targetPoint.y
      const pathData = `
     M ${sourcePoint.x} ${sourcePoint.y}
     L ${midX} ${midY}
     Q ${ctrX} ${ctrY} ${targetPoint.x} ${targetPoint.y}
    `
      return options.raw ? Path.parse(pathData) : pathData
    },
    true,
  )

  Graph.registerEdge(
    'mindmap-edge',
    {
      inherit: 'edge',
      connector: { name: 'mindmap' },
      attrs: {
        line: {
          targetMarker: '',
          stroke: '#2A3340',
          strokeWidth: 1.5,
        },
      },
      zIndex: 0,
    },
    true,
  )

  register({ shape: 'topic', width: 100, height: 40, component: TopicNode, effect: ['data'] })
  register({ shape: 'topic-child', width: 100, height: 40, component: TopicNode, effect: ['data'] })
}
