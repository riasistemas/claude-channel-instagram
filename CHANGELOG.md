# Changelog

All notable changes to this plugin are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- **Comments only**. DMs (Messenger Platform) are planned for v0.2 and
  require a separate App Review for `instagram_manage_messages`.
