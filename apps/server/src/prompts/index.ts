import type { MindMapOutline } from '@mindgenius/shared'
import { Language, detectLanguage } from '../lib/language'

/**
 * 所有 Prompt 集中在此维护（原实现散落在各路由里硬编码）。
 * 中英文模板按输入语言自动选择。
 */

export function mindMapPrompt(topic: string): string {
  if (detectLanguage(topic) === Language.Chinese) {
    return `为主题${topic}创建一个思维导图/指南
要求：
1.使用 markdown：一个 # 一级标题作为根，## / ### 作为分支，列表项作为叶子
2.语言简洁
3.通常有3个级别
4.直接输出 markdown 正文，不要用代码块（\`\`\`）包裹`
  }
  return `create a road map / guide line for the topic ${topic}
requirement:
1.use markdown: one "# H1" as the root, "##"/"###" as branches, list items as leaves
2.short language is preferred
3.usually, there are 3 levels
4.output the raw markdown only — do NOT wrap it in a code fence (\`\`\`)`
}

/** 第一阶段：自由发散（高温，不管格式），尽量铺开角度与细节 */
export function brainstormPrompt(topic: string, extraContext?: string): string {
  const ctx = extraContext ? `\n\n必须结合以下资料：\n${extraContext}` : ''
  if (detectLanguage(topic) === Language.Chinese) {
    return `围绕主题「${topic}」尽情头脑风暴：列出尽可能多的相关角度、子主题、关键要点、注意事项与例子。
不用管格式和结构，先把想法铺开，越全面越好。${ctx}`
  }
  return `Brainstorm widely about the topic "${topic}": list as many relevant angles, subtopics, key points, considerations and examples as you can.
Do not worry about structure or format yet — just get the ideas out, as comprehensive as possible.${extraContext ? `\n\nIncorporate this material:\n${extraContext}` : ''}`
}

/** 默认快速路径：单次结构化调用，让模型在一次调用里先内部发散再产出固定结构 */
export function mindMapDirectPrompt(topic: string, extraContext?: string): string {
  if (detectLanguage(topic) === Language.Chinese) {
    return `围绕主题「${topic}」构建一张思维导图。
先在心里尽量发散（覆盖多种角度、子主题、关键要点），再组织成：
- 一个简洁的中心主题
- 5~7 个主分支，每个分支一个简洁标题
- 每个分支下 3~6 个简洁要点
去重、择优、措辞精炼。${extraContext ? `\n必须结合以下资料：\n${extraContext}` : ''}`
  }
  return `Build a mind map about "${topic}".
First explore broadly in your reasoning (many angles, subtopics, key points), then organize into:
- one concise central topic
- 5-7 main branches, each with a concise title
- 3-6 concise leaf points under each branch
Deduplicate, keep the best, phrase tightly.${extraContext ? `\nIncorporate this material:\n${extraContext}` : ''}`
}

/** 第二阶段：把发散结果收敛进固定结构（配合 generateObject schema 使用，低温） */
export function structurePrompt(topic: string, brainstorm: string): string {
  if (detectLanguage(topic) === Language.Chinese) {
    return `把下面这段关于「${topic}」的发散内容，提炼组织成一张思维导图：
- 一个简洁的中心主题（root）
- 3~7 个主分支，每个分支一个简洁标题
- 每个分支下 3~6 个简洁的要点
去重、择优、措辞精炼。发散内容如下：\n${brainstorm}`
  }
  return `Organize the following brainstorm about "${topic}" into a mind map:
- one concise central topic (root)
- 3-7 main branches, each with a concise title
- 3-6 concise leaf points under each branch
Deduplicate, keep the best, phrase tightly. Brainstorm:\n${brainstorm}`
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

/** 把当前画布轮廓渲染成带 id 的缩进列表，供 mindmap_edit 精准定位节点 */
function renderOutline(node: MindMapOutline, depth = 0): string {
  const line = `${'  '.repeat(depth)}- [${node.id}] ${node.label}`
  const children = (node.children ?? []).map(child => renderOutline(child, depth + 1))
  return [line, ...children].join('\n')
}

export function hermasSystemPrompt(mindMap?: MindMapOutline): string {
  const base = `You are Hermas, an autonomous mind-map assistant inside MindGenius AI.

Your job: understand the user's goal, plan, and use your tools to get there — do not just chat.

Workflow guidance:
- If the user wants a mind map about a topic, call mindmap_generate.
- If the user wants to expand / brainstorm a specific branch or node, call node_expand.
- If the user's request relates to an uploaded document, call rag_query first to gather facts, then build on them.
- You may chain tools across multiple steps (e.g. rag_query -> mindmap_generate), and revise your output if a tool result shows your plan was wrong.
- After tools finish, reply with ONE short sentence confirming what you did. The mind map is already rendered on the canvas automatically — do NOT repeat the full markdown in your reply (it wastes time).

Rules:
- Mind maps are markdown: one H1 as the root, H2/H3 as branches, list items as leaves, about 3 levels.
- Answer in the same language the user writes in.
- Be concise; never invent document content — rely on rag_query results.`

  if (!mindMap)
    return base

  return `${base}

A mind map ALREADY EXISTS on the canvas (outline below, each node prefixed with its stable id).
- To MODIFY it — add, rename, or remove specific nodes — call mindmap_edit with operations that reference these ids. Do NOT regenerate the whole map and do NOT include a markdown code block when you only edit.
- Only call mindmap_generate when the user clearly wants a brand-new map or a full rebuild.
- For 'add' ops, parentId must be an existing id from the outline; new nodes get ids automatically.

Current mind map outline (id → label):
${renderOutline(mindMap)}`
}
