/**
 * Minimal MCP server over stdio — newline-delimited JSON-RPC 2.0.
 *
 * Implements only what this plugin uses: `initialize`, `ping`, request
 * handlers by method (`tools/list`, `tools/call`), inbound notifications by
 * method, and outbound notifications. It replaces @modelcontextprotocol/sdk
 * so the plugin ships with zero npm dependencies and every file it runs is
 * readable source (Claude plugin directory policy).
 */

import { createInterface } from 'node:readline'

const LATEST_PROTOCOL_VERSION = '2025-11-25'
const SUPPORTED_PROTOCOL_VERSIONS = [LATEST_PROTOCOL_VERSION, '2025-06-18', '2025-03-26', '2024-11-05', '2024-10-07']

// JSON-RPC 2.0 error codes
const PARSE_ERROR = -32700
const INVALID_REQUEST = -32600
const METHOD_NOT_FOUND = -32601
const INTERNAL_ERROR = -32603

type Message = { method: string; params?: any }
type RequestHandler = (req: Message) => unknown | Promise<unknown>
type NotificationHandler = (notification: Message) => void | Promise<void>

export class McpServer {
  private readonly requestHandlers = new Map<string, RequestHandler>()
  private readonly notificationHandlers = new Map<string, NotificationHandler>()

  constructor(
    serverInfo: { name: string; version: string },
    options: { capabilities: Record<string, unknown>; instructions?: string },
  ) {
    this.requestHandlers.set('initialize', req => ({
      protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(req.params?.protocolVersion)
        ? req.params.protocolVersion
        : LATEST_PROTOCOL_VERSION,
      capabilities: options.capabilities,
      serverInfo,
      ...(options.instructions ? { instructions: options.instructions } : {}),
    }))
    this.requestHandlers.set('ping', () => ({}))
  }

  setRequestHandler(method: string, handler: RequestHandler): void {
    this.requestHandlers.set(method, handler)
  }

  setNotificationHandler(method: string, handler: NotificationHandler): void {
    this.notificationHandlers.set(method, handler)
  }

  async notification(notification: Message): Promise<void> {
    this.send({ jsonrpc: '2.0', ...notification })
  }

  /** Start reading JSON-RPC messages from stdin. */
  async connect(): Promise<void> {
    const lines = createInterface({ input: process.stdin, crlfDelay: Infinity })
    lines.on('line', line => {
      if (!line.trim()) return
      let msg: any
      try {
        msg = JSON.parse(line)
      } catch {
        this.send({ jsonrpc: '2.0', id: null, error: { code: PARSE_ERROR, message: 'Parse error' } })
        return
      }
      void this.dispatch(msg)
    })
  }

  private async dispatch(msg: any): Promise<void> {
    if (!msg || typeof msg !== 'object' || msg.jsonrpc !== '2.0') {
      this.send({ jsonrpc: '2.0', id: msg?.id ?? null, error: { code: INVALID_REQUEST, message: 'Invalid Request' } })
      return
    }
    // Responses to server-initiated requests — this server sends none.
    if (typeof msg.method !== 'string') return

    const isRequest = msg.id !== undefined && msg.id !== null
    if (!isRequest) {
      const handler = this.notificationHandlers.get(msg.method)
      if (!handler) return
      try {
        await handler({ method: msg.method, params: msg.params })
      } catch (err) {
        process.stderr.write(`mcp: notification handler ${msg.method} failed: ${err}\n`)
      }
      return
    }

    const handler = this.requestHandlers.get(msg.method)
    if (!handler) {
      this.send({ jsonrpc: '2.0', id: msg.id, error: { code: METHOD_NOT_FOUND, message: `Method not found: ${msg.method}` } })
      return
    }
    try {
      const result = await handler({ method: msg.method, params: msg.params })
      this.send({ jsonrpc: '2.0', id: msg.id, result })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.send({ jsonrpc: '2.0', id: msg.id, error: { code: INTERNAL_ERROR, message } })
    }
  }

  private send(message: Record<string, unknown>): void {
    process.stdout.write(JSON.stringify(message) + '\n')
  }
}
