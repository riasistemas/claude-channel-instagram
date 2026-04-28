/**
 * Optional extensions loader.
 *
 * If `INSTAGRAM_EXTENSIONS_DIR` is set and that directory exports a default
 * implementation of the `InstagramExtensions` interface (see ./extensions/README.md),
 * this loader imports it at boot and exposes the handlers to server.ts.
 *
 * Without the env var, the loader returns a no-op implementation, and the
 * plugin runs as a pure generic Instagram channel.
 *
 * This is the integration point for private extensions (CRM enrichment,
 * action nudges, echo targets, permission relay, etc.) without polluting
 * the public core.
 */

import { existsSync } from 'fs'
import { join } from 'path'

export interface InboundContext {
  comment_id: string
  text: string
  username: string
  ig_user_id?: string
  media_id: string
  media_permalink?: string
  parent_comment_id?: string
  timestamp: number
  /** First inbound from this username in the local SQLite history. */
  is_first_contact: boolean
}

export interface ReplyContext {
  comment_id: string
  reply_id: string
  message: string
  in_reply_to_username: string
  in_reply_to_text: string
  media_id: string
}

export interface FirstContactContext {
  username: string
  ig_user_id?: string
  /** comment_id when source==='comment', message_id when source==='dm'. */
  comment_id: string
  text: string
  /** Whether the first contact arrived as a public comment or a DM. */
  source: 'comment' | 'dm'
}

export interface InboundDmContext {
  message_id: string
  /** IG-scoped user id (`messaging.sender.id` in the webhook). Pass to send_dm. */
  sender_id: string
  /** Our own ig account id (the message recipient). */
  recipient_id: string
  username: string
  text?: string
  image_path?: string
  audio_path?: string
  video_path?: string
  /** Audio transcript when GROQ_API_KEY is set and audio is present. */
  transcript?: string
  timestamp: number
  /** True the first time this username DMs us in our local history. */
  is_first_contact: boolean
}

export interface DmSentContext {
  /** The DM the plugin just sent successfully. */
  message_id: string
  recipient_id: string
  username?: string
  text?: string
  /** When media was attached, the local path that was uploaded. */
  attachment_path?: string
  attachment_kind?: 'image' | 'audio' | 'video'
  /** True when the send used the comment-to-DM path (Private Replies API). */
  via_private_reply: boolean
  /** Set to a tag when send used MESSAGE_TAG (e.g. HUMAN_AGENT for >24h). */
  tag?: 'HUMAN_AGENT' | 'ACCOUNT_UPDATE'
}

export interface MetaPatch {
  /** Fields merged into the MCP notification meta before delivery. */
  [key: string]: string | number | boolean | undefined
}

export interface PermissionPrompt {
  request_id: string
  tool_name: string
  description: string
  input_preview: string
  /** Pattern key the relay should remember if user picks "always". */
  pattern: string
}

export interface PermissionDecision {
  behavior: 'allow' | 'deny'
  pattern_remembered?: string
}

/** Args passed to `init()` so the extension can hold onto helpers. */
export interface ExtensionContext {
  /** Send an MCP `notifications/claude/channel` message to the assistant. */
  notify(params: { content: string; meta: Record<string, string> }): void
  /** Log to stderr + the plugin log file. */
  log(msg: string): void
}

export interface InstagramExtensions {
  /**
   * Called once when the plugin boots, before any other hook. Use this to
   * capture references like `notify` and `log` that some hooks (or
   * background loops) will need later. Optional — extensions that only
   * implement reactive hooks can skip it.
   */
  init?(ctx: ExtensionContext): Promise<void>

  /**
   * Called when an inbound comment passes the access gate, before the MCP
   * notification is emitted. Return a partial meta object to inject extra
   * fields (e.g. `crm_name`, `crm_stage`) into the notification's meta.
   */
  onInboundComment?(ctx: InboundContext): Promise<MetaPatch | void>

  /**
   * Called once the FIRST time a previously unknown username appears,
   * either via comment or DM (use `ctx.source` to disambiguate).
   * Useful for prospect auto-registration into a CRM.
   */
  onFirstContact?(ctx: FirstContactContext): Promise<void>

  /**
   * Called after the plugin successfully sent a reply via the Graph API.
   * Useful for echo targets (mirroring the message to other systems),
   * audit trails, or CRM event registration.
   */
  onReplySent?(ctx: ReplyContext): Promise<void>

  /**
   * Called when an inbound DM passes the access gate, before the MCP
   * notification is emitted. Mirrors `onInboundComment` for direct
   * messages — return a partial meta object to enrich the notification.
   */
  onInboundDm?(ctx: InboundDmContext): Promise<MetaPatch | void>

  /**
   * Called after the plugin successfully sent a DM (text, media, or
   * private reply). Useful for CRM event registration, audit trails.
   */
  onDmSent?(ctx: DmSentContext): Promise<void>

  /**
   * Optional side-channel for permission prompts. Implementations can
   * forward the prompt to a different surface (e.g. WhatsApp interactive
   * buttons) and resolve to allow/deny when the user responds.
   *
   * If not provided, the plugin uses the default permission protocol
   * (text/button reply on the same Instagram channel — currently not
   * supported on Instagram comments since posts have no DMs).
   */
  permissionRelay?(prompt: PermissionPrompt): Promise<PermissionDecision>
}

const NO_OP: Required<InstagramExtensions> = {
  init: async () => undefined,
  onInboundComment: async () => undefined,
  onFirstContact: async () => undefined,
  onReplySent: async () => undefined,
  onInboundDm: async () => undefined,
  onDmSent: async () => undefined,
  permissionRelay: async () => ({ behavior: 'deny' }),
}

let cached: InstagramExtensions | null = null

/**
 * Load the private extensions module if INSTAGRAM_EXTENSIONS_DIR is set.
 * Looks for `<dir>/index.ts`, `<dir>/index.js`, or `<dir>/index.mjs`.
 * Returns a no-op object if the env var is missing or load fails.
 *
 * After load, calls `init(ctx)` on the extension if it exposes one — this
 * is how extensions capture references to `notify` and `log` for use in
 * background loops or asynchronous hooks.
 */
export async function loadExtensions(
  ctx: ExtensionContext,
): Promise<InstagramExtensions> {
  if (cached) return cached

  const log = ctx.log
  const dir = process.env.INSTAGRAM_EXTENSIONS_DIR
  if (!dir) {
    cached = NO_OP
    return cached
  }

  if (!existsSync(dir)) {
    log(`extensions dir not found: ${dir} — running without extensions`)
    cached = NO_OP
    return cached
  }

  const candidates = [
    join(dir, 'index.ts'),
    join(dir, 'index.js'),
    join(dir, 'index.mjs'),
  ]
  const entry = candidates.find(existsSync)
  if (!entry) {
    log(`no index.ts/js/mjs in ${dir} — running without extensions`)
    cached = NO_OP
    return cached
  }

  try {
    const mod = (await import(entry)) as { default?: InstagramExtensions } | InstagramExtensions
    const ext = ('default' in mod ? mod.default : mod) as InstagramExtensions
    if (!ext || typeof ext !== 'object') {
      log(`extensions module at ${entry} has no default export — running without`)
      cached = NO_OP
      return cached
    }
    log(`extensions loaded from ${entry}`)
    if (ext.init) {
      try {
        await ext.init(ctx)
      } catch (err) {
        log(`extensions init() threw: ${err} — keeping load (hooks may misbehave)`)
      }
    }
    cached = ext
    return cached
  } catch (err) {
    log(`extensions load failed (${entry}): ${err} — running without extensions`)
    cached = NO_OP
    return cached
  }
}

/** Run a hook safely — never let a buggy extension crash the plugin. */
export async function runHook<T>(
  log: (msg: string) => void,
  name: string,
  fn: () => Promise<T | void> | undefined,
): Promise<T | void> {
  try {
    const result = fn()
    if (result === undefined) return undefined
    return await result
  } catch (err) {
    log(`extension hook ${name} threw: ${err}`)
    return undefined
  }
}
