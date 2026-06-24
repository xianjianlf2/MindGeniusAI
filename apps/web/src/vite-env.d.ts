/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 统计供应商：umami | goatcounter | cloudflare（留空则不启用） */
  readonly VITE_ANALYTICS_PROVIDER?: 'umami' | 'goatcounter' | 'cloudflare'
  /** umami: 站点 ID */
  readonly VITE_UMAMI_WEBSITE_ID?: string
  /** umami: 自定义脚本地址（默认官方云 https://cloud.umami.is/script.js） */
  readonly VITE_UMAMI_SRC?: string
  /** goatcounter: 计数端点，形如 https://你的码.goatcounter.com/count */
  readonly VITE_GOATCOUNTER_ENDPOINT?: string
  /** cloudflare: Web Analytics beacon token */
  readonly VITE_CF_BEACON_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
