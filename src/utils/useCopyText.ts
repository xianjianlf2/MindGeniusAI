import { useMessage } from 'naive-ui'

export function useCopyText(text: string) {
  const message = useMessage()
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
  }
  else {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  message.success('Copied to clipboard')
}
