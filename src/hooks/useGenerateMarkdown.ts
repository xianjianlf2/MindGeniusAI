import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { mangle } from 'marked-mangle'

marked.use(mangle())

export function useGenerateMarkdown(content: string) {
  const markdownString = DOMPurify.sanitize(content)
  return marked.parse(markdownString)
}
