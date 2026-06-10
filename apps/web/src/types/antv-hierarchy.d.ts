declare module '@antv/hierarchy' {
  interface HierarchyOptions<T> {
    direction?: string
    getHeight?: (d: T) => number
    getWidth?: (d: T) => number
    getHGap?: (d: T) => number
    getVGap?: (d: T) => number
    getSide?: (d: T) => 'left' | 'right'
  }
  interface HierarchyNode<T> {
    id: string
    x: number
    y: number
    data: T
    children?: HierarchyNode<T>[]
  }
  const Hierarchy: {
    mindmap: <T>(data: T, options: HierarchyOptions<T>) => HierarchyNode<T>
    [key: string]: any
  }
  export default Hierarchy
}
