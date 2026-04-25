import { useState, type KeyboardEvent } from 'react'
import type { SearchEngine } from '../types'
import SearchEngineBar from './SearchEngineBar'

interface Props {
  onSend: (question: string, engine: SearchEngine) => void
  onIngest: () => void
  isLoading: boolean
  isIngesting: boolean
  disabled: boolean
}

export default function InputBar({ onSend, onIngest, isLoading, isIngesting, disabled }: Props) {
  const [value, setValue] = useState('')
  const [engine, setEngine] = useState<SearchEngine>(null)
  const [focused, setFocused] = useState(false)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || isLoading || disabled) return
    onSend(trimmed, engine)
    setValue('')
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = !!value.trim() && !isLoading && !disabled

  return (
    <div style={{
      background: 'white',
      borderTop: '1.5px solid #e0e7ff',
      padding: '12px 20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 -4px 20px rgba(99,102,241,0.06)',
    }}>
      <SearchEngineBar selected={engine} onChange={setEngine} />

      {/* Input row */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
        background: focused ? '#fafbff' : '#f8f9ff',
        border: `2px solid ${focused ? '#6366f1' : '#e0e7ff'}`,
        borderRadius: '16px',
        padding: '8px 8px 8px 14px',
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: focused ? '0 0 0 4px rgba(99,102,241,0.08)' : 'none',
      }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            disabled
              ? 'Waiting for backend…'
              : engine
                ? `Ask anything — searching ${engine} + catalog…`
                : 'Ask about Murata products… (Enter to send)'
          }
          disabled={isLoading || disabled}
          rows={2}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '16px',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            color: '#1e293b',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            border: 'none',
            background: canSend
              ? 'linear-gradient(135deg, #ef4444, #f97316)'
              : '#e2e8f0',
            color: canSend ? '#fff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '18px',
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: canSend ? '0 4px 12px rgba(239,68,68,0.4)' : 'none',
          }}
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
          Enter to send · Shift+Enter for newline
        </span>
        <button
          onClick={onIngest}
          disabled={isIngesting || disabled}
          style={{
            padding: '5px 14px',
            borderRadius: '999px',
            border: '1.5px solid #c7d2fe',
            background: isIngesting ? '#f1f5f9' : 'linear-gradient(135deg, #eef2ff, #fdf4ff)',
            color: isIngesting ? '#94a3b8' : '#6366f1',
            borderColor: isIngesting ? '#e2e8f0' : '#c7d2fe',
            fontWeight: 600,
            fontSize: '12px',
            cursor: isIngesting || disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isIngesting ? '⏳ Ingesting…' : '📥 Ingest Murata PDFs'}
        </button>
      </div>
    </div>
  )
}
