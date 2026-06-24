import type { CSSProperties, ReactNode } from 'react'

export type IconName =
  | 'send' | 'stop' | 'clip' | 'plus' | 'trash' | 'spark' | 'undo' | 'redo'
  | 'fit' | 'download' | 'search' | 'file' | 'chevDown' | 'chevRight' | 'x'
  | 'sliders' | 'panelLeft' | 'check' | 'alert' | 'clock' | 'gauge' | 'edit'
  | 'zoomIn' | 'zoomOut' | 'refresh' | 'book' | 'key' | 'layers' | 'node'
  | 'arrowUpRight' | 'globe'

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  style?: CSSProperties
}

const paths: Record<IconName, ReactNode> = {
  send: <><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></>,
  stop: <rect x="7" y="7" width="10" height="10" rx="2.2" fill="currentColor" stroke="none" />,
  clip: <path d="M20 11.5l-7.6 7.6a4 4 0 0 1-5.66-5.66l8.1-8.1a2.6 2.6 0 0 1 3.68 3.68l-8.1 8.1a1.2 1.2 0 0 1-1.7-1.7l7.2-7.2" />,
  plus: <><path d="M12 6v12" /><path d="M6 12h12" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M6.5 7l.7 11a2 2 0 0 0 2 1.9h5.6a2 2 0 0 0 2-1.9l.7-11" /></>,
  spark: <><path d="M12 3l1.6 5.1L18.7 9.7 13.6 11.3 12 16.4 10.4 11.3 5.3 9.7l5.1-1.6z" /><path d="M19 14l.7 2.1L21.8 16.8 19.7 17.5 19 19.6 18.3 17.5 16.2 16.8 18.3 16.1z" /></>,
  undo: <><path d="M9 7L4 12l5 5" /><path d="M4 12h11a5 5 0 0 1 0 10h-1" /></>,
  redo: <><path d="M15 7l5 5-5 5" /><path d="M20 12H9a5 5 0 0 0 0 10h1" /></>,
  fit: <><path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9" /><path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9" /><path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15" /><path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" /></>,
  download: <><path d="M12 4v10" /><path d="M8 10l4 4 4-4" /><path d="M5 19h14" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-3.6-3.6" /></>,
  file: <><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4" /></>,
  chevDown: <path d="M6 9l6 6 6-6" />,
  chevRight: <path d="M9 6l6 6-6 6" />,
  x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  sliders: <><path d="M5 8h9" /><path d="M18 8h1" /><circle cx="16" cy="8" r="2" /><path d="M5 16h2" /><path d="M11 16h8" /><circle cx="9" cy="16" r="2" /></>,
  panelLeft: <><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M10 5v14" /></>,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  alert: <><path d="M12 4.5l8.5 14.8H3.5L12 4.5z" /><path d="M12 10v4" /><path d="M12 17h.01" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4.4l2.8 2" /></>,
  gauge: <><path d="M5 17a8 8 0 1 1 14 0" /><path d="M12 13l4-3.5" /><circle cx="12" cy="13" r="1.4" fill="currentColor" stroke="none" /></>,
  edit: <><path d="M14.5 5.7l3.8 3.8" /><path d="M4 20l4.2-.9L19 8.3a2 2 0 0 0 0-2.8l-.5-.5a2 2 0 0 0-2.8 0L4.9 15.8 4 20z" /></>,
  zoomIn: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-3.6-3.6" /><path d="M11 9v4" /><path d="M9 11h4" /></>,
  zoomOut: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-3.6-3.6" /><path d="M9 11h4" /></>,
  refresh: <><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" /><path d="M20 4v4h-4" /><path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" /><path d="M4 20v-4h4" /></>,
  book: <><path d="M5 4.5h9a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5z" /><path d="M16 6.5h3V18a2 2 0 0 0-2 2" /><path d="M8 8.5h5" /><path d="M8 12h5" /></>,
  key: <><circle cx="8" cy="14" r="3.5" /><path d="M10.5 11.5L19 3" /><path d="M16 6l2.5 2.5" /><path d="M14 8l2 2" /></>,
  layers: <><path d="M12 4l8 4-8 4-8-4 8-4z" /><path d="M4 12l8 4 8-4" /></>,
  node: <><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M8.2 11l7.6-3.8" /><path d="M8.2 13l7.6 3.8" /></>,
  arrowUpRight: <><path d="M7 17L17 7" /><path d="M8 7h9v9" /></>,
  globe: <><circle cx="12" cy="12" r="8" /><path d="M4 12h16" /><path d="M12 4a12 12 0 0 1 0 16 12 12 0 0 1 0-16z" /></>,
}

/** 设计稿图标集：24×24 线性图标，stroke=currentColor */
export function Icon({ name, size = 18, strokeWidth = 1.7, className = '', style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {paths[name]}
    </svg>
  )
}
