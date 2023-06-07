export function measureText(text: string, font = '14px Arial') {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context!.font = font
  const width = context!.measureText(text).width
  const height = parseInt(font, 10)
  const padding = 10
  return { width: width + padding, height: height + padding }
}
