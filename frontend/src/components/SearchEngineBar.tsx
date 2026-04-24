type Engine = 'duckduckgo' | 'brave' | 'google' | null

interface Props {
  selected: Engine
  onChange: (engine: Engine) => void
}

const engines: { id: NonNullable<Engine>; label: string; icon: JSX.Element; color: string; tip: string }[] = [
  {
    id: 'google',
    label: 'Google',
    color: '#4285F4',
    tip: 'Search with Google (requires API key)',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: 'brave',
    label: 'Brave',
    color: '#FB542B',
    tip: 'Search with Brave (requires API key)',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#FB542B" d="M20.5 7.06L21.83 5l-1.94-.42L19 2.5l-1.75.94L15.5 2l-1.06 1.5H9.56L8.5 2 6.75 3.44 5 2.5l-.89 2.08L2.17 5 3.5 7.06l-.83 2.13.83.44-.5 2.75 1.33 1.44-.33 1.5L5.33 16l.67 1 .67.5v.25l1 .94 1.33.56.58 1.25L11.25 22h1.5l1.67-1.5.58-1.25 1.33-.56 1-.94V17.5l.67-.5.67-1 1.33-.67-.33-1.5 1.33-1.44-.5-2.75.83-.44-.83-2.13zM12 17.5c-3.04 0-5.5-2.46-5.5-5.5S8.96 6.5 12 6.5s5.5 2.46 5.5 5.5-2.46 5.5-5.5 5.5zm0-9a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"/>
      </svg>
    ),
  },
  {
    id: 'duckduckgo',
    label: 'DuckDuckGo',
    color: '#DE5833',
    tip: 'Search with DuckDuckGo (free, no key needed)',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <circle cx="12" cy="12" r="11" fill="#DE5833"/>
        <circle cx="12" cy="10" r="5.5" fill="white"/>
        <circle cx="10.5" cy="9" r="1.2" fill="#3D3D3D"/>
        <circle cx="13.5" cy="9" r="1.2" fill="#3D3D3D"/>
        <circle cx="10.8" cy="8.7" r="0.45" fill="white"/>
        <circle cx="13.8" cy="8.7" r="0.45" fill="white"/>
        <ellipse cx="12" cy="11.5" rx="1.5" ry="0.7" fill="#DE5833"/>
        <path d="M9.5 13.5 Q12 15.5 14.5 13.5" stroke="#3D3D3D" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
        <path d="M7 16 Q12 20 17 16" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function SearchEngineBar({ selected, onChange }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 0',
    }}>
      <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500, marginRight: '2px' }}>
        Web search:
      </span>

      {engines.map(({ id, label, icon, color, tip }) => {
        const active = selected === id
        return (
          <button
            key={id}
            title={tip}
            onClick={() => onChange(active ? null : id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px 4px 6px',
              borderRadius: '999px',
              border: `1.5px solid ${active ? color : 'var(--border)'}`,
              background: active ? `${color}18` : 'transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: active ? 600 : 400,
              color: active ? color : 'var(--muted)',
              transition: 'all 0.15s',
              outline: 'none',
            }}
          >
            {icon}
            {label}
          </button>
        )
      })}

      {selected && (
        <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: '2px' }}>
          + RAG
        </span>
      )}
    </div>
  )
}
