import type { Message } from '../types'

interface Props {
  message: Message
}

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
      marginBottom: '12px',
    }}>
      <div style={{ maxWidth: '75%' }}>
        {/* Role label */}
        <div style={{
          fontSize: '11px',
          color: 'var(--muted)',
          marginBottom: '4px',
          textAlign: isUser ? 'right' : 'left',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {isUser ? 'You' : 'Assistant'}
        </div>

        {/* Bubble */}
        <div style={{
          padding: '10px 14px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: message.error ? '#fee2e2' : isUser ? 'var(--user-bg)' : 'var(--ai-bg)',
          color: message.error ? 'var(--error)' : isUser ? 'var(--user-text)' : 'var(--ai-text)',
          boxShadow: 'var(--shadow)',
          border: isUser ? 'none' : '1px solid var(--border)',
          lineHeight: 1.6,
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {message.content}
        </div>

        {/* Web results */}
        {message.webResults && message.webResults.length > 0 && (
          <div style={{ marginTop: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 500 }}>
              Web results:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {message.webResults.slice(0, 3).map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block',
                  fontSize: '12px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${engineColors[r.engine] ?? '#ccc'}30`,
                  background: `${engineColors[r.engine] ?? '#ccc'}08`,
                  color: engineColors[r.engine] ?? 'var(--accent)',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }} title={r.snippet}>
                  🔗 {r.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* RAG sources */}
        {message.sources && message.sources.length > 0 && (
          <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {message.sources.map((src, i) => {
              const label = src.split('/').pop()?.split('?')[0] ?? src
              return (
                <span key={i} style={{
                  fontSize: '11px',
                  background: '#eff6ff',
                  color: 'var(--accent)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '220px',
                }} title={src}>
                  📄 {label}
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
