/**
 * 隐私友好、无 cookie 的轻量统计 —— 与厂商无关，用环境变量切换。
 *
 * 只统计「计数」：页面浏览（PV/UV）和一个自定义事件 `agent_run`（有人真正生成导图）。
 * 绝不上报对话内容、PDF、API Key 等任何 PII —— 与本项目的隐私定位一致。
 *
 * 未配置 VITE_ANALYTICS_PROVIDER 时（如本地开发）整体为静默 no-op。
 *
 * 配置（构建时注入，需 VITE_ 前缀）：
 *   VITE_ANALYTICS_PROVIDER = umami | goatcounter | cloudflare
 *   - umami:       VITE_UMAMI_WEBSITE_ID（必填）, VITE_UMAMI_SRC（可选，默认官方云）
 *   - goatcounter: VITE_GOATCOUNTER_ENDPOINT（必填，形如 https://你的码.goatcounter.com/count）
 *   - cloudflare:  VITE_CF_BEACON_TOKEN（必填）— 仅支持 PV/UV，不支持自定义事件
 */

declare global {
  interface Window {
    umami?: { track: (event: string) => void }
    goatcounter?: { count: (opts: { path: string; title?: string; event?: boolean }) => void }
  }
}

type Provider = 'umami' | 'goatcounter' | 'cloudflare'

const PROVIDER = import.meta.env.VITE_ANALYTICS_PROVIDER as Provider | undefined

function injectScript(attrs: Record<string, string>, options: { async?: boolean } = {}) {
  const script = document.createElement('script')
  if (options.async)
    script.async = true
  else
    script.defer = true
  for (const [key, value] of Object.entries(attrs))
    script.setAttribute(key, value)
  document.head.appendChild(script)
}

/** 注入对应厂商的统计脚本。在 main.tsx 启动时调用一次。 */
export function initAnalytics() {
  switch (PROVIDER) {
    case 'umami': {
      const id = import.meta.env.VITE_UMAMI_WEBSITE_ID
      if (!id)
        return
      injectScript({
        'src': import.meta.env.VITE_UMAMI_SRC || 'https://cloud.umami.is/script.js',
        'data-website-id': id,
      })
      break
    }
    case 'goatcounter': {
      const endpoint = import.meta.env.VITE_GOATCOUNTER_ENDPOINT
      if (!endpoint)
        return
      injectScript({ 'src': 'https://gc.zgo.at/count.js', 'data-goatcounter': endpoint }, { async: true })
      break
    }
    case 'cloudflare': {
      const token = import.meta.env.VITE_CF_BEACON_TOKEN
      if (!token)
        return
      injectScript({
        'src': 'https://static.cloudflareinsights.com/beacon.min.js',
        'data-cf-beacon': JSON.stringify({ token }),
      })
      break
    }
    default:
      // 未配置：静默 no-op
  }
}

/**
 * 上报一次自定义事件（如 agent 真正跑起来）。仅传事件名，无任何负载。
 * Cloudflare Web Analytics 不支持自定义事件，此时为 no-op。
 */
export function track(event: string) {
  switch (PROVIDER) {
    case 'umami':
      window.umami?.track(event)
      break
    case 'goatcounter':
      window.goatcounter?.count({ path: event, title: event, event: true })
      break
    default:
      // cloudflare / none：不支持事件
  }
}
