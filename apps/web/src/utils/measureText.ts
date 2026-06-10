let context: CanvasRenderingContext2D | null = null

export function measureText(text: string, font = '16px Arial') {
  if (!context && typeof document !== 'undefined')
    context = document.createElement('canvas').getContext('2d')

  const padding = 10
  const height = Number.parseInt(font)
  if (!context) {
    // 测试环境无 canvas 时按字符数估算
    return { width: text.length * 9 + padding, height: height + padding * 2 }
  }
  context.font = font
  return { width: context.measureText(text).width + padding, height: height + padding * 2 }
}
