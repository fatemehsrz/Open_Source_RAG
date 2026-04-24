import { useState, useEffect, useCallback } from 'react'
import type { Message, StatusResponse, SearchEngine } from './types'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'

function uid() {
  return Math.random().toString(36).slice(2)
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isIngesting, setIsIngesting] = useState(false)
  const [status, setStatus] = useState<StatusResponse | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status')
      if (res.ok) setStatus(await res.json())
    } catch { /* backend not reachable yet */ }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const handleSend = async (question: string, engine: SearchEngine) => {
    const userMsg: Message = { id: uid(), role: 'user', content: question }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, engine }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail ?? 'Request failed')
      }

      const data = await res.json()
      setMessages(prev => [...prev, {
        id: uid(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        hits: data.hits,
        webResults: data.web_results,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: uid(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        error: true,
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleIngest = async () => {
    setIsIngesting(true)
    try {
      const res = await fetch('/api/ingest', { method: 'POST' })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: uid(),
        role: 'assistant',
        content: `✅ Ingestion complete — ${data.chunks_stored} chunks stored.`,
      }])
      fetchStatus()
    } catch (err) {
      setMessages(prev => [...prev, {
        id: uid(),
        role: 'assistant',
        content: `Ingestion failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        error: true,
      }])
    } finally {
      setIsIngesting(false)
    }
  }

  const backendReady = status?.ready ?? false

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Murata RAG Chat</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--muted)' }}>
          {status ? (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: backendReady ? '#22c55e' : '#f59e0b',
                  display: 'inline-block',
                }} />
                {backendReady ? 'Ready' : 'Loading…'}
              </span>
              {backendReady && (
                <>
                  <span>📦 {status.chunks.toLocaleString()} chunks</span>
                  <span title={status.model} style={{
                    maxWidth: '160px', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    🧠 {status.model.split('/').pop()}
                  </span>
                </>
              )}
            </>
          ) : (
            <span>Connecting to backend…</span>
          )}
        </div>
      </header>

      {/* Chat area */}
      <ChatWindow messages={messages} isLoading={isLoading} />

      {/* Input */}
      <InputBar
        onSend={handleSend}
        onIngest={handleIngest}
        isLoading={isLoading}
        isIngesting={isIngesting}
        disabled={!backendReady}
      />
    </div>
  )
}
