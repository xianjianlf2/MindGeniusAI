import { Language, detectLanguage } from '../lib/language'

/**
 * 所有 Prompt 集中在此维护（原实现散落在各路由里硬编码）。
 * 中英文模板按输入语言自动选择。
 */

export function mindMapPrompt(topic: string): string {
  if (detectLanguage(topic) === Language.Chinese) {
    return `为主题${topic}创建一个思维导图/指南
要求：
1.使用markdown
2.语言简洁
3.通常有3个级别`
  }
  return `create a road map / guide line for the topic ${topic}
requirement:
1.use markdown
2.short language is preferred
3.usually, there are 3 levels`
}

export function nodeExpandPrompt(content: string): string {
  if (detectLanguage(content) === Language.Chinese) {
    return `为${content}创建三点
要求：
1.使用markdown
2.语言简洁`
  }
  return `create three points for ${content}
requirement:
1.use markdown
2.short language is preferred`
}

export function compressPrompt(content: string): string {
  if (detectLanguage(content) === Language.Chinese) {
    return `将以下内容精简为简洁的摘要,要求:
使用 markdown 格式
内容如下:
[${content}]`
  }
  return `Compress the following content into a concise summary, requirements:
use Markdown format
content:
[${content}]`
}

export function ragAnswerPrompt(question: string, contextChunks: string[]): string {
  return `Answer the question based ONLY on the following context. If the answer is not in the context, say you don't know. Answer in the same language as the question.

Context:
${contextChunks.map((chunk, i) => `[${i + 1}] ${chunk}`).join('\n\n')}

Question: ${question}`
}

export function hermasSystemPrompt(): string {
  return `You are Hermas, an autonomous mind-map assistant inside MindGenius AI.

Your job: understand the user's goal, plan, and use your tools to get there — do not just chat.

Workflow guidance:
- If the user wants a mind map about a topic, call mindmap_generate.
- If the user wants to expand / brainstorm a specific branch or node, call node_expand.
- If the user's request relates to an uploaded document, call rag_query first to gather facts, then build on them.
- You may chain tools across multiple steps (e.g. rag_query -> mindmap_generate), and revise your output if a tool result shows your plan was wrong.
- After tools finish, reply with a short summary of what you did. When you produced a mind map, the final markdown MUST be included in your reply inside a \`\`\`markdown code block.

Rules:
- Mind maps are markdown: one H1 as the root, H2/H3 as branches, list items as leaves, about 3 levels.
- Answer in the same language the user writes in.
- Be concise; never invent document content — rely on rag_query results.`
}
