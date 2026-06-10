import type { ReactNode } from 'react'
import { useState } from 'react'
import type { IconName } from './Icon'
import { Icon } from './Icon'

/* ---- Spinner ---- */
export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="mg-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.6" opacity="0.22" />
      <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

/* ---- IconButton（hover 提示气泡） ---- */
interface IconButtonProps {
  icon: IconName
  label?: string
  onClick?: () => void
  active?: boolean
  danger?: boolean
  size?: number
  btn?: number
  disabled?: boolean
  kbd?: string
}

export function IconButton({ icon, label, onClick, active, danger, size = 18, btn = 32, disabled, kbd }: IconButtonProps) {
  const [hover, setHover] = useState(false)
  const color = disabled
    ? 'var(--c-text-disabled)'
    : active
      ? 'var(--c-accent)'
      : danger && hover
        ? 'var(--c-err)'
        : hover ? 'var(--c-text)' : 'var(--c-text-2)'
  return (
    <div style={{ position: 'relative', lineHeight: 0 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="no-drag"
        style={{
          width: btn,
          height: btn,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 7,
          transition: 'background .15s, color .15s',
          color,
          background: active ? 'var(--c-accent-soft)' : hover && !disabled ? 'var(--c-elevated)' : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        aria-label={label}
      >
        <Icon name={icon} size={size} />
      </button>
      {label && hover && !disabled && (
        <div
          className="mg-fade-in"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '100%',
            marginTop: 6,
            zIndex: 50,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            background: 'var(--c-overlay)',
            color: 'var(--c-text)',
            border: '1px solid var(--c-border-strong)',
            boxShadow: 'var(--sh-2)',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11.5,
          }}
        >
          {label}
          {kbd && <span className="mono" style={{ marginLeft: 8, color: 'var(--c-text-3)' }}>{kbd}</span>}
        </div>
      )}
    </div>
  )
}

/* ---- StatusPill ---- */
export type PillTone = 'running' | 'indexing' | 'done' | 'ready' | 'error' | 'idle' | 'info'

export function StatusPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  const map: Record<PillTone, [string, string]> = {
    running: ['var(--c-warn)', 'var(--c-warn-soft)'],
    indexing: ['var(--c-warn)', 'var(--c-warn-soft)'],
    done: ['var(--c-ok)', 'var(--c-ok-soft)'],
    ready: ['var(--c-ok)', 'var(--c-ok-soft)'],
    error: ['var(--c-err)', 'var(--c-err-soft)'],
    idle: ['var(--c-text-3)', 'var(--c-elevated)'],
    info: ['var(--c-info)', 'var(--c-info-soft)'],
  }
  const [fg, bg] = map[tone]
  const pulse = tone === 'running' || tone === 'indexing'
  return (
    <span
      className="mono no-drag"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 99,
        color: fg,
        background: bg,
        fontSize: 10.5,
        fontWeight: 500,
        padding: '2.5px 8px 2.5px 7px',
        letterSpacing: '0.02em',
      }}
    >
      {pulse
        ? <Spinner size={10} />
        : <span style={{ width: 6, height: 6, borderRadius: 99, background: fg }} />}
      {children}
    </span>
  )
}

/* ---- Hermas 标识 ---- */
export function HermasMark({ size = 24, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <div
      className="no-drag"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 7,
        background: 'var(--c-accent)',
        boxShadow: glow ? '0 0 0 3px var(--c-accent-soft), 0 4px 14px -4px var(--c-accent)' : 'none',
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path d="M12 2.5l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#0A0E17" />
      </svg>
    </div>
  )
}

/* ---- Segmented ---- */
interface SegmentedOption<T extends string> {
  value: T
  label: string
}

export function Segmented<T extends string>({ options, value, onChange }: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div
      className="no-drag"
      style={{
        display: 'inline-flex',
        borderRadius: 8,
        background: 'var(--c-bg)',
        border: '1px solid var(--c-border)',
        padding: 2,
        gap: 2,
      }}
    >
      {options.map((option) => {
        const on = option.value === value
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              padding: '5px 9px',
              fontSize: 11.5,
              fontWeight: 500,
              borderRadius: 6,
              transition: 'background .15s, color .15s',
              color: on ? 'var(--c-text)' : 'var(--c-text-2)',
              background: on ? 'var(--c-elevated)' : 'transparent',
              boxShadow: on ? 'var(--sh-1)' : 'none',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---- Popover（顶栏下拉） ---- */
export function Popover({ children, onClose, width = 280 }: {
  children: ReactNode
  onClose: () => void
  width?: number
}) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={onClose} />
      <div
        className="mg-fade-in"
        style={{
          position: 'absolute',
          zIndex: 50,
          top: '100%',
          right: 0,
          marginTop: 8,
          width,
          borderRadius: 12,
          background: 'var(--c-overlay)',
          border: '1px solid var(--c-border-strong)',
          boxShadow: 'var(--sh-pop)',
        }}
      >
        {children}
      </div>
    </>
  )
}
