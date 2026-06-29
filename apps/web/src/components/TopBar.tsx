import { useState } from 'react'
import { Icon } from './ui/Icon'
import { IconButton, Popover, Segmented } from './ui/primitives'
import { ACCENTS, MODEL_PRESETS, PROVIDERS, useUiStore } from '@/stores/uiStore'
import { useDocStore } from '@/stores/docStore'
import { useT } from '@/i18n'

const MONO_LABEL = { fontSize: 9.5, color: 'var(--c-text-3)', letterSpacing: '0.06em' } as const

export function TopBar() {
  const {
    provider, setProvider, apiKey, setApiKey, proxy, setProxy, model, setModel,
    nodeStyle, setNodeStyle, density, setDensity, accent, setAccent,
    sourcesOpen, setSourcesOpen, settingsOpen, setSettingsOpen,
    leftCollapsed, setLeftCollapsed, locale, setLocale, setPaletteOpen,
  } = useUiStore()
  const t = useT()
  const pdfCount = useDocStore(state => state.files.length)
  const [modelMenu, setModelMenu] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)

  const current = PROVIDERS.find(item => item.id === provider) ?? PROVIDERS[0]
  const keyOk = apiKey.length > 0
  const presets = MODEL_PRESETS[provider]
  // 当前模型是否落在预设之外（即用户手填的自定义名）
  const modelIsCustom = model.length > 0 && !presets.some(item => item.id === model)
  const showCustomInput = customOpen || modelIsCustom

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

      {/* 命令面板搜索入口（也可 ⌘K 唤起） */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="no-drag"
        title={t('palette.search')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderRadius: 8,
          padding: '6px 8px 6px 10px',
          fontSize: 12.5,
          color: 'var(--c-text-3)',
          background: 'var(--c-surface-2)',
          border: '1px solid var(--c-border)',
          transition: 'background .15s, color .15s',
        }}
      >
        <Icon name="search" size={14} />
        <span>{t('palette.search')}</span>
        <span className="mono" style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, color: 'var(--c-text-2)', background: 'var(--c-elevated)', border: '1px solid var(--c-border)' }}>⌘K</span>
      </button>

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

              {/* 模型：预设一点即用，自定义兜底，省去手打模型名的认知负担 */}
              <div className="mono" style={{ ...MONO_LABEL, marginBottom: 8 }}>{t('topbar.model')} · {current.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {presets.map((item) => {
                  // model 为空时服务端走第一项（推荐默认），故高亮第一项
                  const on = !showCustomInput && (model === item.id || (model === '' && presets[0].id === item.id))
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setCustomOpen(false)
                        setModel(item.id)
                      }}
                      className="no-drag"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        borderRadius: 7,
                        padding: '5px 9px',
                        fontSize: 11.5,
                        color: on ? 'var(--c-accent)' : 'var(--c-text-2)',
                        background: on ? 'var(--c-accent-soft)' : 'var(--c-surface-2)',
                        border: `1px solid ${on ? 'transparent' : 'var(--c-border)'}`,
                      }}
                    >
                      <span className="mono">{item.id}</span>
                      {item.tag && (
                        <span className="mono" style={{ fontSize: 9, padding: '0 4px', borderRadius: 4, color: 'var(--c-text-3)', background: 'var(--c-elevated)' }}>
                          {item.tag === 'max' ? t('topbar.tagMax') : t('topbar.tagRec')}
                        </span>
                      )}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setCustomOpen(true)}
                  className="no-drag"
                  style={{
                    borderRadius: 7,
                    padding: '5px 9px',
                    fontSize: 11.5,
                    color: showCustomInput ? 'var(--c-accent)' : 'var(--c-text-2)',
                    background: showCustomInput ? 'var(--c-accent-soft)' : 'var(--c-surface-2)',
                    border: `1px solid ${showCustomInput ? 'transparent' : 'var(--c-border)'}`,
                  }}
                >
                  {t('topbar.modelCustom')}
                </button>
              </div>
              {showCustomInput && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, padding: '8px 10px', marginTop: 8, background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
                  <input
                    value={model}
                    onChange={event => setModel(event.target.value.trim())}
                    placeholder={t('topbar.modelCustomPlaceholder')}
                    className="mono"
                    style={{ flex: 1, background: 'transparent', outline: 'none', border: 'none', fontSize: 11.5, color: 'var(--c-text)' }}
                  />
                </div>
              )}

              {/* 高级：Base URL（代理 / 自建网关）默认折叠，90% 的人用不到 */}
              <button
                type="button"
                onClick={() => setAdvancedOpen(open => !open)}
                className="no-drag"
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'transparent', border: 'none', padding: 0, color: 'var(--c-text-3)', fontSize: 11.5 }}
              >
                <Icon name="chevDown" size={13} style={{ transform: advancedOpen ? 'none' : 'rotate(-90deg)', transition: 'transform .15s' }} />
                {t('topbar.advanced')}
              </button>
              {advancedOpen && (
                <>
                  <div className="mono" style={{ ...MONO_LABEL, margin: '8px 0 6px' }}>{t('topbar.apiBaseUrl')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, padding: '8px 10px', background: 'var(--c-surface-2)', border: '1px solid var(--c-border)' }}>
                    <input
                      value={proxy}
                      onChange={event => setProxy(event.target.value.trim())}
                      placeholder={provider === 'moonshot' ? 'https://api.moonshot.cn/v1' : 'https://api.openai.com/v1'}
                      className="mono"
                      style={{ flex: 1, background: 'transparent', outline: 'none', border: 'none', fontSize: 11.5, color: 'var(--c-text)' }}
                    />
                  </div>
                </>
              )}

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
