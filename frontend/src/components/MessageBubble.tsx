import type { Message } from '../types'

interface Props { message: Message }

const engineColors: Record<string, string> = {
  google: '#4285F4',
  brave: '#FB542B',
  duckduckgo: '#DE5833',
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      gap: '8px',
      alignItems: 'flex-end',
    }}>
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
        }}>🤖</div>
      )}

      <div style={{ maxWidth: '72%' }}>
        {/* Role label */}
        <div style={{
          fontSize: '11px',
          marginBottom: '4px',
          textAlign: isUser ? 'right' : 'left',
          fontWeight: 600,
          color: isUser ? '#6366f1' : '#7c3aed',
          letterSpacing: '0.04em',
        }}>
          {isUser ? 'You' : 'Assistant'}
        </div>

        {/* Bubble */}
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          background: message.error
            ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
            : isUser
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'white',
          color: message.error ? '#b91c1c' : isUser ? '#fff' : '#1e293b',
          boxShadow: isUser
            ? '0 4px 16px rgba(99,102,241,0.35)'
            : '0 2px 12px rgba(0,0,0,0.07)',
          border: isUser ? 'none' : '1.5px solid #e0e7ff',
          lineHeight: 1.65,
          fontSize: '16px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {message.content}
        </div>

        {/* Web results */}
        {message.webResults && message.webResults.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, marginBottom: '4px',
              color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Web results
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {message.webResults.slice(0, 3).map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block',
                  fontSize: '12px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: `1.5px solid ${engineColors[r.engine] ?? '#ccc'}40`,
                  background: `${engineColors[r.engine] ?? '#ccc'}10`,
                  color: engineColors[r.engine] ?? '#6366f1',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  transition: 'opacity 0.15s',
                }} title={r.snippet}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  🔗 {r.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* PDF sources */}
        {message.sources && message.sources.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {message.sources.map((src, i) => {
              const label = src.split('/').pop()?.split('?')[0] ?? src
              const hue = (i * 60 + 200) % 360
              return (
                <span key={i} style={{
                  fontSize: '11px',
                  background: `hsl(${hue}, 80%, 95%)`,
                  color: `hsl(${hue}, 60%, 35%)`,
                  border: `1px solid hsl(${hue}, 60%, 80%)`,
                  borderRadius: '999px',
                  padding: '2px 9px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px',
                  fontWeight: 500,
                }} title={src}>
                  📄 {label}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', boxShadow: '0 2px 8px rgba(168,85,247,0.3)',
        }}>👤</div>
      )}
    </div>
  )
}
