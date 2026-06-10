export function measureText(text: string, font = '16px Arial') {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context!.font = font
  const padding = 10
  const width = context!.measureText(text).width
  const height = Number.parseInt(font)
  return { width: width + padding, height: height + padding * 2 }
}
