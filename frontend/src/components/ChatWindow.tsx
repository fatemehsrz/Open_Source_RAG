import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'

interface Props {
  messages: Message[]
  isLoading: boolean
}

export default function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {messages.length === 0 && (
        <div style={{
          margin: 'auto',
          textAlign: 'center',
          color: 'var(--muted)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            Murata Catalog RAG
          </div>
          <div style={{ fontSize: '13px' }}>
            Ask anything about Murata products — BLE modules, capacitors, DC-DC converters.
          </div>
        </div>
      )}

      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
          <div style={{
            padding: '10px 16px',
            borderRadius: '18px 18px 18px 4px',
            background: 'var(--ai-bg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--muted)',
                display: 'inline-block',
                animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
              }} />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
