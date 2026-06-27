import { create } from 'zustand'
import { StorageKey, storageManager } from '@/utils/storage'

export type Provider = 'openai' | 'anthropic' | 'deepseek' | 'moonshot'
export type NodeStyle = 'mono' | 'colorful' | 'card'
export type Density = 'comfy' | 'compact'
export type Locale = 'zh' | 'en'

export const PROVIDERS: { id: Provider; name: string; sub: string; dot: string }[] = [
  { id: 'openai', name: 'OpenAI', sub: 'GPT', dot: '#34D399' },
  { id: 'anthropic', name: 'Claude', sub: 'Anthropic', dot: '#FF6F59' },
  { id: 'deepseek', name: 'DeepSeek', sub: 'V3', dot: '#5B8DEF' },
  { id: 'moonshot', name: 'Kimi', sub: 'Moonshot', dot: '#8E7BFF' },
]

export const ACCENTS = [
  { id: '#FF6F59', nameKey: 'accent.coral' },
  { id: '#5B8DEF', nameKey: 'accent.indigo' },
  { id: '#34D399', nameKey: 'accent.emerald' },
  { id: '#A78BFA', nameKey: 'accent.violet' },
] as const

/** 从主色派生 hover/soft 等 CSS 变量 */
function applyAccent(hex: string) {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  const style = document.documentElement.style
  style.setProperty('--c-accent', hex)
  style.setProperty('--c-accent-hover', `rgb(${Math.min(255, r + 22)},${Math.min(255, g + 22)},${Math.min(255, b + 22)})`)
  style.setProperty('--c-accent-soft', `rgba(${r},${g},${b},0.14)`)
  style.setProperty('--c-accent-softer', `rgba(${r},${g},${b},0.08)`)
  style.setProperty('--c-accent-line', `rgba(${r},${g},${b},0.40)`)
}

interface UiState {
  provider: Provider
  apiKey: string
  proxy: string
  model: string
  nodeStyle: NodeStyle
  density: Density
  accent: string
  locale: Locale
  leftCollapsed: boolean
  sourcesOpen: boolean
  settingsOpen: boolean
  /** ⌘K 命令面板（画廊 + 文档搜索）是否打开 */
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  toast: string | null
  /** 需要进入重命名编辑态的节点 id（加子/兄弟节点或 F2 后置位，TopicNode 消费后清空） */
  editingNodeId: string | null
  setEditingNodeId: (id: string | null) => void
  /** 拖拽改父时鼠标悬停的合法落点节点 id，用于高亮提示 */
  dropTargetId: string | null
  setDropTargetId: (id: string | null) => void
  setProvider: (provider: Provider) => void
  setApiKey: (key: string) => void
  setProxy: (proxy: string) => void
  setModel: (model: string) => void
  setNodeStyle: (style: NodeStyle) => void
  setDensity: (density: Density) => void
  setAccent: (accent: string) => void
  setLocale: (locale: Locale) => void
  setLeftCollapsed: (collapsed: boolean) => void
  setSourcesOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  flash: (message: string) => void
}

const PREF_NODE_STYLE = 'MINDGENIUS_NODE_STYLE'
const PREF_DENSITY = 'MINDGENIUS_DENSITY'
const PREF_ACCENT = 'MINDGENIUS_ACCENT'
const PREF_LOCALE = 'MINDGENIUS_LOCALE'

const initialAccent = storageManager.get(PREF_ACCENT) ?? '#FF6F59'
if (typeof document !== 'undefined')
  applyAccent(initialAccent)

const sysLocale: Locale = (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh')) ? 'zh' : 'en'
const initialLocale = (storageManager.get(PREF_LOCALE) as Locale) ?? sysLocale

let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useUiStore = create<UiState>(set => ({
  provider: (storageManager.get(StorageKey.LLM_PROVIDER) as Provider) || 'openai',
  apiKey: storageManager.get(StorageKey.OPENAI_KEY) ?? '',
  proxy: storageManager.get(StorageKey.OPENAI_PROXY) ?? '',
  model: storageManager.get(StorageKey.LLM_MODEL) ?? '',
  nodeStyle: (storageManager.get(PREF_NODE_STYLE) as NodeStyle) || 'mono',
  density: (storageManager.get(PREF_DENSITY) as Density) || 'comfy',
  accent: initialAccent,
  locale: initialLocale,
  leftCollapsed: typeof window !== 'undefined' && window.innerWidth < 1280,
  sourcesOpen: false,
  settingsOpen: false,
  paletteOpen: false,
  toast: null,
  editingNodeId: null,
  dropTargetId: null,

  setEditingNodeId: editingNodeId => set({ editingNodeId }),
  setDropTargetId: dropTargetId => set({ dropTargetId }),
  setProvider(provider) {
    storageManager.set(StorageKey.LLM_PROVIDER, provider)
    set({ provider })
  },
  setApiKey(apiKey) {
    if (apiKey)
      storageManager.set(StorageKey.OPENAI_KEY, apiKey)
    else
      storageManager.remove(StorageKey.OPENAI_KEY)
    set({ apiKey })
  },
  setProxy(proxy) {
    if (proxy)
      storageManager.set(StorageKey.OPENAI_PROXY, proxy)
    else
      storageManager.remove(StorageKey.OPENAI_PROXY)
    set({ proxy })
  },
  setModel(model) {
    if (model)
      storageManager.set(StorageKey.LLM_MODEL, model)
    else
      storageManager.remove(StorageKey.LLM_MODEL)
    set({ model })
  },
  setNodeStyle(nodeStyle) {
    storageManager.set(PREF_NODE_STYLE, nodeStyle)
    set({ nodeStyle })
  },
  setDensity(density) {
    storageManager.set(PREF_DENSITY, density)
    set({ density })
  },
  setAccent(accent) {
    storageManager.set(PREF_ACCENT, accent)
    applyAccent(accent)
    set({ accent })
  },
  setLocale(locale) {
    storageManager.set(PREF_LOCALE, locale)
    set({ locale })
  },
  setLeftCollapsed: leftCollapsed => set({ leftCollapsed }),
  setSourcesOpen: sourcesOpen => set({ sourcesOpen }),
  setSettingsOpen: settingsOpen => set({ settingsOpen }),
  setPaletteOpen: paletteOpen => set({ paletteOpen }),
  flash(message) {
    clearTimeout(toastTimer)
    set({ toast: message })
    toastTimer = setTimeout(() => set({ toast: null }), 1900)
  },
}))
