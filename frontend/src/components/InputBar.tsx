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

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '10px 16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      {/* Search engine selector */}
      <SearchEngineBar selected={engine} onChange={setEngine} />

      {/* Text input + send */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={
            engine
              ? `Ask anything — will search ${engine} + local catalog…`
              : 'Ask about Murata products… (Enter to send)'
          }
          disabled={isLoading || disabled}
          rows={2}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '14px',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            outline: 'none',
            background: disabled ? '#f8fafc' : '#fff',
            color: 'var(--ai-text)',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading || disabled}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            cursor: !value.trim() || isLoading || disabled ? 'not-allowed' : 'pointer',
            opacity: !value.trim() || isLoading || disabled ? 0.5 : 1,
            transition: 'opacity 0.15s',
            whiteSpace: 'nowrap',
            height: '40px',
          }}
        >
          {isLoading ? '…' : 'Send'}
        </button>
      </div>

      {/* Ingest button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onIngest}
          disabled={isIngesting || disabled}
          style={{
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: isIngesting ? 'var(--muted)' : 'var(--accent)',
            fontWeight: 500,
            fontSize: '12px',
            cursor: isIngesting || disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {isIngesting ? '⏳ Ingesting PDFs…' : '📥 Ingest Murata PDFs'}
        </button>
      </div>
    </div>
  )
}
