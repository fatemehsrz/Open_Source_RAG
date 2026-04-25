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
        id: uid(), role: 'assistant',
        content: data.answer,
        sources: data.sources,
        hits: data.hits,
        webResults: data.web_results,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant',
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
        id: uid(), role: 'assistant',
        content: `✅ Ingestion complete — ${data.chunks_stored} chunks stored.`,
      }])
      fetchStatus()
    } catch (err) {
      setMessages(prev => [...prev, {
        id: uid(), role: 'assistant',
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

      {/* Header — gradient */}
      <header style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #4c1d95 100%)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-20px', right: '80px',
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', right: '200px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '14px',
            padding: '8px 10px',
            fontSize: '32px',
            backdropFilter: 'blur(4px)',
            lineHeight: 1,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff' }}>Murata RAG Chat</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
              Open-source · Local LLM · ChromaDB
            </div>
          </div>
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
          {status ? (
            <>
              <Pill
                color={backendReady ? '#22c55e' : '#f59e0b'}
                bg="rgba(255,255,255,0.15)"
                text={backendReady ? '● Ready' : '● Loading…'}
              />
              {backendReady && (
                <>
                  <Pill bg="rgba(255,255,255,0.15)" text={`📦 ${status.chunks.toLocaleString()} chunks`} />
                  <Pill bg="rgba(255,255,255,0.15)" text={`🧠 ${status.model.split('/').pop()}`} maxW="160px" />
                </>
              )}
            </>
          ) : (
            <Pill bg="rgba(255,255,255,0.15)" text="Connecting…" />
          )}
        </div>
      </header>

      <ChatWindow messages={messages} isLoading={isLoading} />

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

function Pill({ text, bg, color, maxW }: { text: string; bg: string; color?: string; maxW?: string }) {
  return (
    <span style={{
      background: bg,
      color: color ?? '#fff',
      borderRadius: '999px',
      padding: '4px 10px',
      fontSize: '12px',
      fontWeight: 500,
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255,255,255,0.2)',
      maxWidth: maxW,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {text}
    </span>
  )
}
