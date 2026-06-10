import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useMemo } from 'react'

export function Markdown({ content }: { content: string }) {
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(content, { async: false }) as string),
    [content],
  )
  // 渲染前已经过 DOMPurify 清洗
  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
}
