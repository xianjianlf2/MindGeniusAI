import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { mangle } from 'marked-mangle'
import { gfmHeadingId } from 'marked-gfm-heading-id'

const options = {
  prefix: 'my-prefix-',
}

marked.use(gfmHeadingId(options))
marked.use(mangle())

export function useGenerateMarkdown(content: string) {
  const markdownString = DOMPurify.sanitize(content)
  return marked.parse(markdownString)
}
