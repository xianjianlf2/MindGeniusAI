import { describe, expect, it } from 'vitest'
import type { AgentEvent } from '../src'
import { decodeAgentEvent, encodeAgentEvent } from '../src'

describe('agent event protocol', () => {
  it('round-trips every event type', () => {
    const events: AgentEvent[] = [
      { type: 'text', delta: 'hello' },
      { type: 'tool-call', toolName: 'rag_query', toolCallId: 'id-1', input: { question: 'q' } },
      { type: 'tool-result', toolName: 'rag_query', toolCallId: 'id-1', output: 'chunk' },
      { type: 'step-finish' },
      { type: 'error', message: 'boom' },
    ]
    for (const event of events)
      expect(decodeAgentEvent(encodeAgentEvent(event))).toEqual(event)
  })

  it('returns null for non-agent payloads', () => {
    expect(decodeAgentEvent('plain token')).toBeNull()
    expect(decodeAgentEvent('agent:{not json')).toBeNull()
  })
})
