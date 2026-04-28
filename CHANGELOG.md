# Changelog

All notable changes to this plugin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-04-27

### Added

- **Direct Messages support**. The plugin now parses the Messenger-style
  `messaging` envelope from Instagram webhooks, persists DMs alongside
  comments in the local SQLite history, and surfaces them as MCP channel
  notifications with `meta.kind === "dm"`. Inbound media (image / audio /
  video) is downloaded into `~/.claude/channels/instagram/media/<handle>/`,
  audio is transcribed via Groq Whisper when `GROQ_API_KEY` is set.
- **Comment-to-DM bootstrap** via Instagram's Private Replies API. New
  tool `send_private_reply(comment_id, text)` opens a private DM thread
  with the author of a public comment (7-day window, one-time per
  comment). Combined with `meta.auto_dm: true` on inbound comment
  notifications, this lets Claude reply briefly in public AND open a DM
  in the same turn — the same UX patterns popularized by Manychat, but
  implemented entirely against the official Graph API with our own
  token (zero third-party dependency).
- **Outbound DMs** via new tool `send_dm(chat_id, text?, image_path?,
  audio_path?)`. Supports text plus a single image or audio attachment.
  Outbound media is served through an internal `/media/<token>` endpoint
  on the existing Bun.serve listener (single-use tokens, 10-minute TTL),
  reachable through the same tunnel that delivers webhooks. Set
  `INSTAGRAM_PUBLIC_BASE` to the public tunnel URL so Meta can fetch
  attachments.
- **24h DM window enforcement**. `send_dm` returns a clear error when
  the user hasn't messaged within the last 24 hours. `HUMAN_AGENT` tag
  (7-day extension) is documented but intentionally not implemented in
  v0.1 — it lands in v0.2 behind an opt-in flag.
- **Extensions interface** widened with `onInboundDm` and `onDmSent`
  hooks. `FirstContactContext` gained a `source: 'comment' | 'dm'`
  field so extensions can differentiate first contact channels.
  `InboundDmContext` carries `sender_id`, `text`, attachment paths and
  optional `transcript`.
- New `/instagram:qualification` skill describing the comment-to-DM →
  qualification flow.

### Changed

- SQLite `messages` table extended with `kind`, `recipient_id`,
  `media_path`, `transcript`, `dm_message_id` columns. Existing rows
  default to `kind = 'comment'`. Migration is idempotent and runs at
  boot. `INSERT` paths are split (`stmtInsertMsg` for comments,
  `stmtInsertDm` for DMs).
- `parseInstagramPayload` now returns a discriminated union of
  `IgComment | IgDm` instead of `IgComment[]`. Internal API only.
- MCP server `instructions` rewritten to teach Claude the comment-to-DM
  flow and the `meta.kind` / `meta.auto_dm` contract.
- `Access` config gained `autoPrivateReplyOnComment?: boolean` (default
  `true`) — controls whether the plugin sets `meta.auto_dm` on inbound
  comments.

### Notes

- DM support requires `instagram_manage_messages` (already part of the
  default Instagram Login API scopes).
- For outbound media, set `INSTAGRAM_PUBLIC_BASE=https://<your-tunnel>`
  so Meta's servers can fetch the temporary `/media/<token>` URL.
- Without `GROQ_API_KEY`, audio inbound is delivered as a file path
  with no transcript — Claude can still respond, just without
  understanding the contents.

## [0.1.1] — 2026-04-27

### Added

- **`init(ctx)` hook** in the extensions interface. The plugin now passes
  an `ExtensionContext = { notify, log }` to extensions when they boot, so
  background loops or asynchronous hooks can capture references to send
  MCP notifications (`notify`) and log lines (`log`) outside the regular
  hook flow. Backward-compatible: `init` is optional — existing extensions
  without it continue to work.

### Changed

- `loadExtensions(log)` is now `loadExtensions(ctx: ExtensionContext)`.
  This is a breaking change to the function signature (used only by the
  plugin server itself, not by extension authors).

## [0.1.0] — 2026-04-26

### Added

- Initial public release.
- HTTP webhook receiver (`Bun.serve` on `INSTAGRAM_PORT`, default `3790`)
  with Meta verification (`GET /webhook`) and HMAC-SHA256 signature
  validation (`POST /webhook`).
- Outbound via Instagram Graph API (default `graph.instagram.com/v24.0`,
  override to `graph.facebook.com/v24.0` via `INSTAGRAM_API_BASE`).
- Three MCP tools: `reply_comment`, `list_comments`, `chat_messages`.
- Two skills: `/instagram:configure` (credentials, status, lockdown
  guidance) and `/instagram:access` (allowlist, policy, media scope,
  mention patterns).
- SQLite-backed comment history at `~/.claude/channels/instagram/messages.db`.
- Optional extensions module loaded via `INSTAGRAM_EXTENSIONS_DIR` —
  hooks for `onInboundComment`, `onFirstContact`, `onReplySent`, and
  `permissionRelay`. See [extensions/README.md](./extensions/README.md).
- Process resilience: `unhandledRejection` / `uncaughtException`
  handlers, `SIGHUP` shutdown, PID lockfile, orphan watchdog (parent-PID
  + stdin checks).

### Scope

- **Comments only**. DMs (Messenger Platform) shipped in v0.2.0.
