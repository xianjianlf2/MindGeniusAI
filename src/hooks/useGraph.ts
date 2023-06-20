import type { Graph } from '@antv/x6'
import { message } from 'ant-design-vue'

export function useShowCurrentZoomMessage(graph: Graph) {
  const zoom = graph.zoom()
  return message.info(`${Math.round(zoom * 100)}%`)
}
