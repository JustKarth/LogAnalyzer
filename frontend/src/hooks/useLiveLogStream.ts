import { useCallback, useEffect, useRef, useState } from 'react'
import type { Event } from '../types'

type StreamStatus = 'connected' | 'connecting' | 'disconnected' | 'error'
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'
const severities: Event['severity'][] = ['info', 'low', 'medium', 'high', 'critical']

const createMockEvent = (): Event => {
  const severity = severities[Math.floor(Math.random() * severities.length)]
  const timestamp = new Date().toISOString()
  return {
    id: crypto.randomUUID(), timestamp, source_id: Math.random() > 0.5 ? '1' : '2',
    event_type: severity === 'critical' ? 'INTRUSION_DETECTED' : severity === 'high' ? 'AUTH_FAILURE' : 'SYSTEM_ACTIVITY',
    severity,
    message: severity === 'critical' ? 'Potential intrusion pattern detected from an untrusted address.' : severity === 'high' ? 'Repeated authentication failure detected.' : 'New log event received from an active source.',
    user: severity === 'high' ? 'unknown-user' : 'system', host: '192.168.1.50', ip_address: '192.168.1.50', raw_data: { streaming: true, received_at: timestamp },
  }
}

export const useLiveLogStream = () => {
  const [status, setStatus] = useState<StreamStatus>('disconnected')
  const [latestEvent, setLatestEvent] = useState<Event | null>(null)
  const mockTimer = useRef<number | null>(null)
  const mockConnectTimer = useRef<number | null>(null)
  const socket = useRef<WebSocket | null>(null)

  const disconnect = useCallback(() => {
    if (mockTimer.current !== null) { window.clearInterval(mockTimer.current); mockTimer.current = null }
    if (mockConnectTimer.current !== null) { window.clearTimeout(mockConnectTimer.current); mockConnectTimer.current = null }
    socket.current?.close()
    socket.current = null
    setStatus('disconnected')
  }, [])

  const connect = useCallback(() => {
    disconnect()
    setStatus('connecting')
    if (USE_MOCK_API) {
      mockConnectTimer.current = window.setTimeout(() => {
        mockConnectTimer.current = null
        setStatus('connected')
        setLatestEvent(createMockEvent())
        mockTimer.current = window.setInterval(() => setLatestEvent(createMockEvent()), 5000)
      }, 250)
      return
    }
    const configuredUrl = import.meta.env.VITE_WS_URL as string | undefined
    const fallbackUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/v1/ws/logs`
    const liveSocket = new WebSocket(configuredUrl || fallbackUrl)
    socket.current = liveSocket
    liveSocket.onopen = () => setStatus('connected')
    liveSocket.onmessage = (message) => { try { setLatestEvent(JSON.parse(message.data) as Event) } catch { setStatus('error') } }
    liveSocket.onerror = () => setStatus('error')
    liveSocket.onclose = () => { socket.current = null; setStatus((currentStatus) => currentStatus === 'error' ? 'error' : 'disconnected') }
  }, [disconnect])

  useEffect(() => { connect(); return disconnect }, [connect, disconnect])
  return { latestEvent, status, reconnect: connect, disconnect }
}
