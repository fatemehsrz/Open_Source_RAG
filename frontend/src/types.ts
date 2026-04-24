export type Role = 'user' | 'assistant'
export type SearchEngine = 'duckduckgo' | 'brave' | 'google' | null

export interface Hit {
  text: string
  source: string
  page: number
  score: number
}

export interface WebResult {
  title: string
  snippet: string
  url: string
  engine: string
}

export interface Message {
  id: string
  role: Role
  content: string
  sources?: string[]
  hits?: Hit[]
  webResults?: WebResult[]
  error?: boolean
}

export interface StatusResponse {
  ready: boolean
  chunks: number
  model: string
}
