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
      padding: '28px 20px',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
    }}>
      {messages.length === 0 && (
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          {/* Animated logo */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: '24px', color: '#4f46e5', marginBottom: '8px' }}>
            Murata Catalog RAG
          </div>
          <div style={{ fontSize: '16px', color: '#4f46e5', marginBottom: '24px' }}>
            Ask anything about Murata products
          </div>
          {/* Quick-start chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '420px' }}>
            {[
              'What BLE modules does Murata offer?',
              'What is the capacitance of the C90E polymer?',
              'Explain Murata DC-DC converters',
            ].map(q => (
              <span key={q} style={{
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'white',
                border: '1.5px solid #c7d2fe',
                color: '#4f46e5',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
              }}>
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
          <div style={{
            padding: '12px 18px',
            borderRadius: '20px 20px 20px 4px',
            background: 'white',
            border: '1.5px solid #e0e7ff',
            boxShadow: '0 2px 12px rgba(99,102,241,0.1)',
            display: 'flex', gap: '5px', alignItems: 'center',
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: `hsl(${245 + i * 20}, 70%, 60%)`,
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
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
