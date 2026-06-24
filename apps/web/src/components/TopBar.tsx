import { useState } from 'react'
import { Icon } from './ui/Icon'
import { IconButton, Popover, Segmented } from './ui/primitives'
import { ACCENTS, PROVIDERS, useUiStore } from '@/stores/uiStore'
import { useDocStore } from '@/stores/docStore'
import { useT } from '@/i18n'

const MONO_LABEL = { fontSize: 9.5, color: 'var(--c-text-3)', letterSpacing: '0.06em' } as const

export function TopBar() {
  const {
    provider, setProvider, apiKey, setApiKey, proxy, setProxy, model, setModel,
    nodeStyle, setNodeStyle, density, setDensity, accent, setAccent,
    sourcesOpen, setSourcesOpen, settingsOpen, setSettingsOpen,
    leftCollapsed, setLeftCollapsed, locale, setLocale,
  } = useUiStore()
  const t = useT()
  const pdfCount = useDocStore(state => state.files.length)
  const [modelMenu, setModelMenu] = useState(false)

  const current = PROVIDERS.find(item => item.id === provider) ?? PROVIDERS[0]
  const keyOk = apiKey.length > 0

  return (
    <div
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 60, // 压住画布层的浮动元素（缩放栏 z30 / 导出菜单 z40），否则顶栏下拉会被盖住
        background: 'var(--c-surface)',
        borderBottom: '1px solid var(--c-border)',
      }}
    >
      {/* 品牌 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 0 4px' }}>
        <div style={{ width: 26, height: 26, display: 'grid', placeItems: 'center', borderRadius: 7, background: 'var(--c-accent)' }}>
          <Icon name="node" size={16} style={{ color: '#190b07' }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 650, color: 'var(--c-text)', letterSpacing: '-0.01em' }}>
          MindGenius
          <span style={{ color: 'var(--c-accent)' }}> AI</span>
        </span>
      </div>

      {leftCollapsed && (
        <button
          type="button"
          onClick={() => setLeftCollapsed(false)}
          className="no-drag"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 8,
            padding: '6px 8px',
            marginLeft: 4,
            fontSize: 12,
            color: 'var(--c-text-2)',
            border: '1px solid var(--c-border)',
            background: 'var(--c-surface-2)',
          }}
        >
          <Icon name="panelLeft" size={15} />
          {` ${t('topbar.openConversation')}`}
        </button>
      )}

      <div style={{ flex: 1 }} />

      {/* 模型供应商 */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setModelMenu(open => !open)}
          className="no-drag"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12.5,
            color: 'var(--c-text)',
            background: modelMenu ? 'var(--c-elevated)' : 'var(--c-surface-2)',
            border: '1px solid var(--c-border)',
            transition: 'background .15s',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 99, background: current.dot }} />
          <span style={{ fontWeight: 560 }}>{current.name}</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--c-text-3)' }}>{current.sub}</span>
          {!keyOk && <span title={t('topbar.keyMissing')} style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--c-warn)' }} />}
          <Icon name="chevDown" size={13} style={{ color: 'var(--c-text-3)' }} />
        </button>
        {modelMenu && (
          <Popover onClose={() => setModelMenu(false)} width={244}>
            <div style={{ padding: 6 }}>
              <div className="mono" style={{ ...MONO_LABEL, padding: '6px 8px' }}>{t('topbar.provider')}</div>
              {PROVIDERS.map((item) => {
                const on = item.id === provider
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setProvider(item.id)
                      setModelMenu(false)
                    }}
                    className="no-drag"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderRadius: 8,
                      padding: '8px 8px',
                      background: on ? 'var(--c-elevated)' : 'transparent',
                      transition: 'background .15s',
                    }}
                  >
                    <span style={{ width: 9, height: 9, flexShrink: 0, borderRadius: 99, background: item.dot }} />
                    <span style={{ flex: 1, textAlign: 'left', fontSize: 12.5, color: 'var(--c-text)', fontWeight: 500 }}>
                      {item.name}
                      <span className="mono" style={{ display: 'block', fontSize: 10, color: 'var(--c-text-3)' }}>{item.sub}</span>
                    </span>
                    {on && <span style={{ color: 'var(--c-accent)' }}><Icon name="check" size={15} /></span>}
                  </button>
                )
              })}
            </div>
          </Popover>
        )}
      </div>

      {/* 资料源开关 */}
      <button
        type="button"
        onClick={() => setSourcesOpen(!sourcesOpen)}
        className="no-drag"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderRadius: 8,
          padding: '6px 10px',
          fontSize: 12.5,
          color: sourcesOpen ? 'var(--c-accent)' : 'var(--c-text-2)',
          background: sourcesOpen ? 'var(--c-accent-soft)' : 'transparent',
          border: `1px solid ${sourcesOpen ? 'transparent' : 'var(--c-border)'}`,
          transition: 'background .15s, color .15s',
        }}
      >
        <Icon name="book" size={15} />
        {` ${t('topbar.sources')}`}
        {pdfCount > 0 && (
          <span className="mono" style={{ fontSize: 9.5, padding: '0 5px', borderRadius: 99, background: 'var(--c-elevated)', color: 'var(--c-text-2)' }}>
            {pdfCount}
          </span>
        )}
      </button>

      {/* 语言切换 */}
      <button
        type="button"
        onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
        className="no-drag"
        title={t('topbar.language')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          borderRadius: 8,
          padding: '6px 9px',
          fontSize: 12,
          fontWeight: 560,
          color: 'var(--c-text-2)',
          background: 'transparent',
          border: '1px solid var(--c-border)',
          transition: 'background .15s, color .15s',
        }}
      >
        <Icon name="globe" size={15} />
        <span className="mono">{locale === 'zh' ? '中' : 'EN'}</span>
      </button>

      {/* 设置与偏好 */}
      <div style={{ position: 'relative' }}>
        <IconButton icon="sliders" label={t('topbar.settings')} active={settingsOpen} onClick={() => setSettingsOpen(!settingsOpen)} />
        {settingsOpen && (
          <Popover onClose={() => setSettingsOpen(false)} width={300}>
            <div style={{ padding: 12 }}>
              <div className="mono" style={{ ...MONO_LABEL, marginBottom: 6 }}>
                {t('topbar.apiKey')} · {current.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 8,
                  padding: '8px 10px',
                  marginBottom: 4,
                  background: 'var(--c-surface-2)',
                  border: `1px solid ${keyOk ? 'var(--c-border)' : 'rgba(242,177,76,0.27)'}`,
                }}
              >
                <Icon name="key" size={14} style={{ color: keyOk ? 'var(--c-ok)' : 'var(--c-warn)' }} />
                <input
                  type="password"
                  value={apiKey}
                  onChange={event => setApiKey(event.target.value.trim())}
                  placeholder={t('topbar.apiKeyPlaceholder')}
                  className="mono"
                  style={{ flex: 1, background: 'transparent', outline: 'none', border: 'none', fontSize: 11.5, color: 'var(--c-text)' }}
                />
              </div>
              <div className="mono" style={{ fontSize: 10, marginBottom: 12, color: keyOk ? 'var(--c-ok)' : 'var(--c-warn)' }}>
                {keyOk ? t('topbar.keyConfigured') : t('topbar.keyUnconfigured')}
              </div>

              <div className="mono" style={{ ...MONO_LABEL, marginBottom: 6 }}>{t('topbar.apiBaseUrl')}</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 8,
                  padding: '8px 10px',
                  background: 'var(--c-surface-2)',
                  border: '1px solid var(--c-border)',
                }}
              >
                <input
                  value={proxy}
                  onChange={event => setProxy(event.target.value.trim())}
                  placeholder={provider === 'moonshot' ? 'https://api.moonshot.cn/v1' : 'https://api.openai.com/v1'}
                  className="mono"
                  style={{ flex: 1, background: 'transparent', outline: 'none', border: 'none', fontSize: 11.5, color: 'var(--c-text)' }}
                />
              </div>

              <div className="mono" style={{ ...MONO_LABEL, margin: '12px 0 6px' }}>{t('topbar.model')}</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 8,
                  padding: '8px 10px',
                  background: 'var(--c-surface-2)',
                  border: '1px solid var(--c-border)',
                }}
              >
                <input
                  value={model}
                  onChange={event => setModel(event.target.value.trim())}
                  placeholder={provider === 'moonshot' ? 'moonshot-v1-8k / kimi-k2-…' : provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini'}
                  className="mono"
                  style={{ flex: 1, background: 'transparent', outline: 'none', border: 'none', fontSize: 11.5, color: 'var(--c-text)' }}
                />
              </div>

              <div style={{ height: 1, margin: '12px 0', background: 'var(--c-border)' }} />

              <div className="mono" style={{ ...MONO_LABEL, marginBottom: 8 }}>{t('topbar.nodeStyle')}</div>
              <Segmented
                value={nodeStyle}
                onChange={setNodeStyle}
                options={[
                  { value: 'mono', label: t('topbar.nodeStyleMono') },
                  { value: 'colorful', label: t('topbar.nodeStyleColorful') },
                  { value: 'card', label: t('topbar.nodeStyleCard') },
                ]}
              />

              <div className="mono" style={{ ...MONO_LABEL, margin: '12px 0 8px' }}>{t('topbar.density')}</div>
              <Segmented
                value={density}
                onChange={setDensity}
                options={[
                  { value: 'comfy', label: t('topbar.densityComfy') },
                  { value: 'compact', label: t('topbar.densityCompact') },
                ]}
              />

              <div className="mono" style={{ ...MONO_LABEL, margin: '12px 0 8px' }}>{t('topbar.accent')}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {ACCENTS.map(item => (
                  <button
                    type="button"
                    key={item.id}
                    title={t(item.nameKey)}
                    onClick={() => setAccent(item.id)}
                    className="no-drag"
                    style={{
                      width: 34,
                      height: 28,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 7,
                      background: 'var(--c-surface-2)',
                      border: `1px solid ${accent === item.id ? item.id : 'var(--c-border)'}`,
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 99,
                        background: item.id,
                        boxShadow: accent === item.id ? `0 0 0 2px var(--c-overlay), 0 0 0 3px ${item.id}` : 'none',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </Popover>
        )}
      </div>
    </div>
  )
}
