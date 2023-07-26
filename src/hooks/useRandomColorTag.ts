import type { NTag } from 'naive-ui'

type NtagInstance = InstanceType<typeof NTag>
export function useRandomColorTag(index: number): NtagInstance['type'] {
  const data: NtagInstance['type'][] = ['default', 'success', 'warning', 'error', 'info', 'primary']
  return data[index % data.length] || 'default'
}
