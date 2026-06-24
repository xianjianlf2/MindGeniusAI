import { useRef, useState } from 'react'
import { Icon } from './ui/Icon'
import { IconButton, Spinner, StatusPill } from './ui/primitives'
import type { DocFile } from '@/stores/docStore'
import { docDisplayName, useDocStore } from '@/stores/docStore'
import { useUiStore } from '@/stores/uiStore'
import { useT } from '@/i18n'

function PdfRow({ doc, expanded, onExpand }: {
  doc: DocFile
  expanded: boolean
  onExpand: (name: string | null) => void
}) {
  const t = useT()
  const { attached, setAttached, index } = useDocStore()
  const isAttached = attached === doc.name

  const statusNode = () => {
    if (doc.status === 'uploading') {
      return (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <StatusPill tone="info">{t('sources.uploading')}</StatusPill>
            <span className="mono tnum" style={{ fontSize: 10.5, color: 'var(--c-text-3)' }}>{doc.progress ?? 0}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, overflow: 'hidden', background: 'var(--c-bg)' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${doc.progress ?? 0}%`, background: 'var(--c-info)', transition: 'width .25s' }} />
          </div>
        </div>
      )
    }
    if (doc.status === 'indexing') {
      return (
        <div style={{ marginTop: 8 }}>
          <div style={{ marginBottom: 6 }}>
            <StatusPill tone="indexing">{t('sources.indexing')}</StatusPill>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="mg-shimmer" style={{ height: 4, flex: 1, borderRadius: 99, animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        </div>
      )
    }
    if (doc.status === 'ready') {
      return (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusPill tone="ready">{t('sources.ready')}</StatusPill>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--c-text-3)' }}>{t('sources.indexed')}</span>
        </div>
      )
    }
    return (
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <StatusPill tone="idle">{t('sources.unindexed')}</StatusPill>
        <button
          type="button"
          onClick={() => index(doc.name)}
          className="no-drag"
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--c-accent)',
            background: 'var(--c-accent-softer)',
            border: '1px solid var(--c-accent-line)',
            borderRadius: 6,
            padding: '2px 8px',
          }}
        >
          {t('sources.buildIndex')}
        </button>
        {doc.error && <span style={{ fontSize: 10.5, color: 'var(--c-err)' }}>{doc.error}</span>}
      </div>
    )
  }

  return (
    <div
      className="mg-card-in"
      style={{
        borderRadius: 10,
        background: 'var(--c-surface-2)',
        border: `1px solid ${isAttached ? 'var(--c-accent-line)' : expanded ? 'var(--c-border-strong)' : 'var(--c-border)'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12 }}>
        <span
          style={{
            width: 32,
            height: 38,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 7,
            background: 'var(--c-bg)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-accent)',
          }}
        >
          {doc.status === 'uploading' || doc.status === 'indexing' ? <Spinner size={15} /> : <Icon name="file" size={17} />}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 560, color: 'var(--c-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {docDisplayName(doc)}
          </div>
          {doc.displayName && (
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--c-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.name}
            </div>
          )}
          {statusNode()}
        </div>
      </div>

      {doc.status === 'ready' && (
        <div style={{ display: 'flex', borderTop: '1px solid var(--c-border)' }}>
          <button
            type="button"
            onClick={() => setAttached(isAttached ? null : doc.name)}
            className="no-drag"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              fontSize: 11.5,
              color: isAttached ? 'var(--c-accent)' : 'var(--c-text-2)',
            }}
          >
            <Icon name="clip" size={13} />
            {isAttached ? t('sources.attached') : t('sources.useAsContext')}
          </button>
          <button
            type="button"
            onClick={() => onExpand(expanded ? null : doc.name)}
            className="no-drag"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              fontSize: 11.5,
              color: 'var(--c-text-2)',
              borderLeft: '1px solid var(--c-border)',
            }}
          >
            {expanded ? t('sources.collapsePreview') : t('sources.preview')}
            <span style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: 'var(--c-text-3)', display: 'grid' }}>
              <Icon name="chevRight" size={13} />
            </span>
          </button>
        </div>
      )}

      {expanded && doc.status === 'ready' && (
        <div style={{ padding: '0 12px 12px' }}>
          <iframe
            title={doc.name}
            src={`/api/${doc.name}`}
            style={{ width: '100%', height: 320, border: '1px solid var(--c-border)', borderRadius: 8, background: '#fbfbf7' }}
          />
        </div>
      )}
    </div>
  )
}

export function SourcesDrawer() {
  const t = useT()
  const { files, upload } = useDocStore()
  const { setSourcesOpen, flash } = useUiStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ready = files.filter(file => file.status === 'ready').length

  const pickFile = () => fileInputRef.current?.click()

  const onFilePicked = async (file: File | undefined) => {
    if (!file)
      return
    try {
      await upload(file)
    }
    catch (error) {
      flash(t('toast.uploadFailed', { msg: (error as Error).message }))
    }
  }

  return (
    <div className="mg-drawer-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--c-surface)', borderLeft: '1px solid var(--c-border)' }}>
      <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', flexShrink: 0, borderBottom: '1px solid var(--c-border)' }}>
        <Icon name="book" size={17} style={{ color: 'var(--c-text-2)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t('sources.title')}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--c-text-3)', background: 'var(--c-elevated)', borderRadius: 99, padding: '1px 6px' }}>
          {t('sources.countReady', { ready, total: files.length })}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <IconButton icon="x" label={t('sources.collapse')} size={16} btn={30} onClick={() => setSourcesOpen(false)} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {files.length === 0 && (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', padding: '0 16px' }}>
            <div>
              <span
                style={{
                  width: 44,
                  height: 44,
                  margin: '0 auto 12px',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 10,
                  background: 'var(--c-surface-2)',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text-3)',
                }}
              >
                <Icon name="book" size={20} />
              </span>
              <div style={{ fontSize: 12.5, color: 'var(--c-text-2)', lineHeight: 1.6 }}>{t('sources.empty')}</div>
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--c-text-3)', lineHeight: 1.6 }}>
                {t('sources.emptyDesc')}
              </div>
            </div>
          </div>
        )}
        {files.map(doc => (
          <PdfRow key={doc.name} doc={doc} expanded={expanded === doc.name} onExpand={setExpanded} />
        ))}
      </div>

      <div style={{ padding: 14, flexShrink: 0, borderTop: '1px solid var(--c-border)' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(event) => {
            onFilePicked(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={pickFile}
          className="no-drag"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 9,
            padding: '10px 0',
            fontSize: 12.5,
            fontWeight: 500,
            color: 'var(--c-text-2)',
            background: 'transparent',
            border: '1px dashed var(--c-border-strong)',
            transition: 'color .15s, border-color .15s',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = 'var(--c-text)'
            event.currentTarget.style.borderColor = 'var(--c-accent-line)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = 'var(--c-text-2)'
            event.currentTarget.style.borderColor = 'var(--c-border-strong)'
          }}
        >
          <Icon name="plus" size={15} />
          {t('sources.uploadPdf')}
        </button>
      </div>
    </div>
  )
}
