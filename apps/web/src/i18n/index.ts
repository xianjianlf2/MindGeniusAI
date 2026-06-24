import type { Locale } from '@/stores/uiStore'
import { useUiStore } from '@/stores/uiStore'

/* ---------- 字典 ---------- */
type Dict = Record<string, string>

const zh: Dict = {
  // TopBar
  'topbar.openConversation': '对话',
  'topbar.provider': '模型供应商',
  'topbar.keyMissing': '未配置 Key',
  'topbar.sources': '资料源',
  'topbar.settings': '设置与偏好',
  'topbar.apiKey': 'API KEY',
  'topbar.apiKeyPlaceholder': '粘贴 sk-… 以启用请求',
  'topbar.keyConfigured': '● 已配置，仅存于浏览器，仅随请求发给你自己的后端',
  'topbar.keyUnconfigured': '● 未配置 — 发送将提示错误',
  'topbar.apiBaseUrl': 'API BASE URL（可选代理）',
  'topbar.model': 'MODEL（可选，留空用服务端默认）',
  'topbar.nodeStyle': '画布节点风格',
  'topbar.nodeStyleMono': '克制',
  'topbar.nodeStyleColorful': '彩色分层',
  'topbar.nodeStyleCard': '卡片',
  'topbar.density': '密度',
  'topbar.densityComfy': '舒适',
  'topbar.densityCompact': '紧凑',
  'topbar.accent': '强调色',
  'topbar.language': '切换语言',

  // Accent color names
  'accent.coral': '珊瑚',
  'accent.indigo': '靛蓝',
  'accent.emerald': '翠绿',
  'accent.violet': '紫',

  // Conversation
  'conv.toolMindmapGenerate': '生成思维导图',
  'conv.toolNodeExpand': '扩展节点',
  'conv.toolRagQuery': '检索文档',
  'conv.toolMindmapEdit': '编辑画布节点',
  'conv.errorApikeyTitle': '未配置 API Key',
  'conv.errorApikeyDesc': '当前模型供应商缺少有效的 API Key，无法发起请求。',
  'conv.errorApikeyAction': '前往设置',
  'conv.errorRatelimitTitle': '请求过于频繁 (429)',
  'conv.errorRatelimitDesc': '已触发供应商限流，请稍候片刻重试，或切换其它模型。',
  'conv.errorRatelimitAction': '重试',
  'conv.errorTimeoutTitle': '请求超时',
  'conv.errorTimeoutDesc': '模型长时间未返回结果，可能是网络波动或上下文过长。',
  'conv.errorTimeoutAction': '重新生成',
  'conv.errorGenericTitle': '请求失败',
  'conv.errorGenericAction': '重试',
  'conv.statusDone': '完成',
  'conv.statusStopped': '已停止',
  'conv.statusRunning': '运行中',
  'conv.executing': '正在执行…',
  'conv.working': '工作中',
  'conv.ready': '就绪',
  'conv.subtitle': 'AI 思维导图助手',
  'conv.newChat': '新会话',
  'conv.collapse': '折叠面板',
  'conv.placeholder': '给 Hermas 描述你的目标，或 Shift+Enter 换行…',
  'conv.uploadPdf': '上传 PDF 作为上下文',
  'conv.hintWorking': 'Hermas 正在工作…',
  'conv.hintEnter': 'Enter 发送',
  'conv.stop': '停止',

  // Canvas
  'canvas.exampleDocTitle': '拆解一份 PDF 文档',
  'canvas.exampleDocSub': '上传后让 Hermas 检索并结构化',
  'canvas.exampleDocPrompt': '帮我把上传的文档拆解成一张结构化思维导图，覆盖核心论点和关键细节。',
  'canvas.exampleGtmTitle': '规划产品上线 (GTM)',
  'canvas.exampleGtmSub': '市场 · 渠道 · 定价 · 节奏',
  'canvas.exampleGtmPrompt': '为一款 AI 笔记工具规划 Q3 上线计划，覆盖市场定位、渠道增长、定价与发布节奏。',
  'canvas.exampleRoadmapTitle': '整理学习路线',
  'canvas.exampleRoadmapSub': '把一个主题拆成可执行路径',
  'canvas.exampleRoadmapPrompt': '帮我整理一条「从零学习机器学习」的学习路线图，分阶段、给资源。',
  'canvas.exampleBrainstormTitle': '头脑风暴选题',
  'canvas.exampleBrainstormSub': '围绕一个方向发散想法',
  'canvas.exampleBrainstormPrompt': '围绕「面向开发者的技术播客」头脑风暴 12 个选题方向。',
  'canvas.emptyHeading': '和 Hermas 一起，把想法画成导图',
  'canvas.emptyDesc': '用一句话描述你的目标。Hermas 会自主规划、检索你上传的 PDF，并实时生成可编辑的思维导图。',
  'canvas.emptyHint': '或在左侧对话框直接输入 · 支持 📎 上传 PDF 作为上下文',
  'canvas.undo': '撤销',
  'canvas.redo': '重做',
  'canvas.zoomOut': '缩小',
  'canvas.zoomIn': '放大',
  'canvas.fit': '适应屏幕',
  'canvas.export': '导出',
  'canvas.closeExportMenu': '关闭导出菜单',
  'canvas.exportPng': 'PNG 图片',
  'canvas.exportSvg': 'SVG 矢量',
  'canvas.exportMd': 'Markdown',
  'canvas.exportOpml': 'OPML 大纲',
  'canvas.exported': '已导出 {file}',

  // SourcesDrawer
  'sources.uploading': '上传中',
  'sources.indexing': '索引中',
  'sources.ready': '就绪',
  'sources.indexed': '已索引 · 可检索',
  'sources.unindexed': '未索引',
  'sources.buildIndex': '建立索引',
  'sources.attached': '已作为对话上下文',
  'sources.useAsContext': '用作对话上下文',
  'sources.collapsePreview': '收起预览',
  'sources.preview': '预览',
  'sources.title': '资料源',
  'sources.countReady': '{ready}/{total} 就绪',
  'sources.collapse': '收起',
  'sources.empty': '还没有资料源',
  'sources.emptyDesc': '上传 PDF，Hermas 在对话中会自动检索引用。',
  'sources.uploadPdf': '上传 PDF',

  // TopicNode
  'node.addBranch': '加分支',
  'node.addChild': '加子节点',
  'node.brainstorm': 'AI 头脑风暴',
  'node.rename': '重命名',
  'node.delete': '删除',

  // App toasts / notices
  'toast.mapGenerated': '思维导图已生成',
  'toast.fillApiKey': '请在右上角「设置」中填入 API Key',
  'toast.mapUpdated': '已更新画布 {n} 处',
  'toast.uploadFailed': '上传失败：{msg}',
  'app.closeSidebar': '关闭侧栏',
  'app.phoneTitle': '更适合在大屏使用',
  'app.phoneBody': 'MindGenius 是一个桌面思维导图工作台，画布编辑在手机上体验有限。建议用平板或电脑打开。',
  'app.phoneContinue': '仍要继续',

  // store fallbacks
  'err.uploadFailed': '上传失败',
  'err.indexFailed': '索引失败',
}

const en: Dict = {
  // TopBar
  'topbar.openConversation': 'Chat',
  'topbar.provider': 'Model Provider',
  'topbar.keyMissing': 'No key configured',
  'topbar.sources': 'Sources',
  'topbar.settings': 'Settings & preferences',
  'topbar.apiKey': 'API KEY',
  'topbar.apiKeyPlaceholder': 'Paste sk-… to enable requests',
  'topbar.keyConfigured': '● Configured — stored only in your browser, sent only to your own backend',
  'topbar.keyUnconfigured': '● Not configured — sending will raise an error',
  'topbar.apiBaseUrl': 'API BASE URL (optional proxy)',
  'topbar.model': 'MODEL (optional, blank uses server default)',
  'topbar.nodeStyle': 'Canvas node style',
  'topbar.nodeStyleMono': 'Minimal',
  'topbar.nodeStyleColorful': 'Colorful',
  'topbar.nodeStyleCard': 'Card',
  'topbar.density': 'Density',
  'topbar.densityComfy': 'Comfortable',
  'topbar.densityCompact': 'Compact',
  'topbar.accent': 'Accent color',
  'topbar.language': 'Switch language',

  // Accent color names
  'accent.coral': 'Coral',
  'accent.indigo': 'Indigo',
  'accent.emerald': 'Emerald',
  'accent.violet': 'Violet',

  // Conversation
  'conv.toolMindmapGenerate': 'Generate mind map',
  'conv.toolNodeExpand': 'Expand node',
  'conv.toolRagQuery': 'Search documents',
  'conv.toolMindmapEdit': 'Edit canvas nodes',
  'conv.errorApikeyTitle': 'No API key configured',
  'conv.errorApikeyDesc': 'The current model provider has no valid API key, so the request cannot be made.',
  'conv.errorApikeyAction': 'Open settings',
  'conv.errorRatelimitTitle': 'Too many requests (429)',
  'conv.errorRatelimitDesc': 'The provider is rate-limiting you. Wait a moment and retry, or switch to another model.',
  'conv.errorRatelimitAction': 'Retry',
  'conv.errorTimeoutTitle': 'Request timed out',
  'conv.errorTimeoutDesc': 'The model took too long to respond — possibly a network hiccup or an overly long context.',
  'conv.errorTimeoutAction': 'Regenerate',
  'conv.errorGenericTitle': 'Request failed',
  'conv.errorGenericAction': 'Retry',
  'conv.statusDone': 'Done',
  'conv.statusStopped': 'Stopped',
  'conv.statusRunning': 'Running',
  'conv.executing': 'Running…',
  'conv.working': 'Working',
  'conv.ready': 'Ready',
  'conv.subtitle': 'AI mind-map assistant',
  'conv.newChat': 'New chat',
  'conv.collapse': 'Collapse panel',
  'conv.placeholder': 'Describe your goal for Hermas, or Shift+Enter for a new line…',
  'conv.uploadPdf': 'Upload a PDF as context',
  'conv.hintWorking': 'Hermas is working…',
  'conv.hintEnter': 'Enter to send',
  'conv.stop': 'Stop',

  // Canvas
  'canvas.exampleDocTitle': 'Break down a PDF',
  'canvas.exampleDocSub': 'Upload it and let Hermas search and structure it',
  'canvas.exampleDocPrompt': 'Break the uploaded document into a structured mind map covering the core arguments and key details. Respond in English.',
  'canvas.exampleGtmTitle': 'Plan a product launch (GTM)',
  'canvas.exampleGtmSub': 'Market · Channels · Pricing · Timeline',
  'canvas.exampleGtmPrompt': 'Plan a Q3 launch for an AI note-taking tool, covering market positioning, channel growth, pricing, and release timeline. Respond in English.',
  'canvas.exampleRoadmapTitle': 'Build a learning roadmap',
  'canvas.exampleRoadmapSub': 'Turn a topic into an actionable path',
  'canvas.exampleRoadmapPrompt': 'Build a "learn machine learning from scratch" roadmap, broken into stages with resources for each. Respond in English.',
  'canvas.exampleBrainstormTitle': 'Brainstorm topics',
  'canvas.exampleBrainstormSub': 'Diverge ideas around a direction',
  'canvas.exampleBrainstormPrompt': 'Brainstorm 12 episode ideas for a tech podcast aimed at developers. Respond in English.',
  'canvas.emptyHeading': 'Turn ideas into mind maps with Hermas',
  'canvas.emptyDesc': 'Describe your goal in a sentence. Hermas plans autonomously, searches the PDFs you upload, and generates an editable mind map in real time.',
  'canvas.emptyHint': 'Or type directly in the chat on the left · 📎 upload a PDF as context',
  'canvas.undo': 'Undo',
  'canvas.redo': 'Redo',
  'canvas.zoomOut': 'Zoom out',
  'canvas.zoomIn': 'Zoom in',
  'canvas.fit': 'Fit to screen',
  'canvas.export': 'Export',
  'canvas.closeExportMenu': 'Close export menu',
  'canvas.exportPng': 'PNG image',
  'canvas.exportSvg': 'SVG vector',
  'canvas.exportMd': 'Markdown',
  'canvas.exportOpml': 'OPML outline',
  'canvas.exported': 'Exported {file}',

  // SourcesDrawer
  'sources.uploading': 'Uploading',
  'sources.indexing': 'Indexing',
  'sources.ready': 'Ready',
  'sources.indexed': 'Indexed · searchable',
  'sources.unindexed': 'Not indexed',
  'sources.buildIndex': 'Build index',
  'sources.attached': 'Used as chat context',
  'sources.useAsContext': 'Use as chat context',
  'sources.collapsePreview': 'Hide preview',
  'sources.preview': 'Preview',
  'sources.title': 'Sources',
  'sources.countReady': '{ready}/{total} ready',
  'sources.collapse': 'Collapse',
  'sources.empty': 'No sources yet',
  'sources.emptyDesc': 'Upload a PDF — Hermas will search and cite it automatically in chat.',
  'sources.uploadPdf': 'Upload PDF',

  // TopicNode
  'node.addBranch': 'Add branch',
  'node.addChild': 'Add child node',
  'node.brainstorm': 'AI brainstorm',
  'node.rename': 'Rename',
  'node.delete': 'Delete',

  // App toasts / notices
  'toast.mapGenerated': 'Mind map generated',
  'toast.fillApiKey': 'Add your API key under "Settings" in the top right',
  'toast.mapUpdated': 'Updated {n} place(s) on the canvas',
  'toast.uploadFailed': 'Upload failed: {msg}',
  'app.closeSidebar': 'Close sidebar',
  'app.phoneTitle': 'Best used on a larger screen',
  'app.phoneBody': 'MindGenius is a desktop mind-map workbench; canvas editing is limited on phones. A tablet or computer is recommended.',
  'app.phoneContinue': 'Continue anyway',

  // store fallbacks
  'err.uploadFailed': 'Upload failed',
  'err.indexFailed': 'Indexing failed',
}

export const dictionaries: Record<Locale, Dict> = { zh, en }

export type TKey = keyof typeof zh

type Params = Record<string, string | number>

function interpolate(template: string, params?: Params): string {
  if (!params)
    return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match)
}

/** 非 Hook 用法：在 store / 非组件代码中按需翻译 */
export function translate(locale: Locale, key: TKey, params?: Params): string {
  const table = dictionaries[locale] ?? dictionaries.en
  const template = table[key] ?? dictionaries.en[key] ?? key
  return interpolate(template, params)
}

/** Hook：订阅当前语言，返回 t(key, params?) */
export function useT(): (key: TKey, params?: Params) => string {
  const locale = useUiStore(state => state.locale)
  return (key: TKey, params?: Params) => translate(locale, key, params)
}
