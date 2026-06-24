let context: CanvasRenderingContext2D | null = null

/**
 * 估算节点盒子尺寸。关键：测量用的字体必须与节点实际渲染字体（Geist）一致，
 * 否则盒子宽度算偏小 → 文字溢出/截断 → 视觉上与相邻节点重叠。
 * 水平方向两侧各留足内边距（覆盖 CSS padding + 分支圆点/留白），宁可略宽不可截断。
 */
export function measureText(text: string, font = '500 16px "Geist", system-ui, sans-serif') {
  if (!context && typeof document !== 'undefined')
    context = document.createElement('canvas').getContext('2d')

  const padX = 18
  const padY = 11
  // 从字体串里取「<number>px」的字号；不能直接 parseInt（字重 500 会被误当成字号）
  const fontSize = Number.parseInt(font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? '16')
  if (!context) {
    // 测试环境无 canvas 时按字符数估算（中文按更宽估）
    return { width: text.length * 11 + padX * 2, height: fontSize + padY * 2 }
  }
  context.font = font
  return { width: Math.ceil(context.measureText(text).width) + padX * 2, height: fontSize + padY * 2 }
}
