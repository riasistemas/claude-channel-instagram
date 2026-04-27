---
name: configure
description: Set up the Instagram channel — save Graph API credentials and review access policy. Use when the user pastes an Instagram access token, asks to configure Instagram, asks "how do I set this up" or "who can reach me," or wants to check channel status.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash(ls *)
  - Bash(mkdir *)
  - Bash(chmod *)
---

# /instagram:configure — Instagram Channel Setup

Writes Instagram Graph API credentials to `~/.claude/channels/instagram/.env`
and orients the user on access policy. The server reads `.env` once at boot.

Arguments passed: `$ARGUMENTS`

---

## Required env vars

The server fails fast if any of these are missing:

| Var | What it is | Where to find it |
|---|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | Long-lived token with `instagram_basic` + `instagram_manage_comments` | Business Manager → System Users → Generate Token |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | The Instagram Business account ID | Meta App Dashboard → Instagram Graph API → API Setup |
| `INSTAGRAM_VERIFY_TOKEN` | Random string you choose; same value goes into Meta's webhook config | Pick one (e.g. `openssl rand -hex 32`) |
| `INSTAGRAM_APP_SECRET` | Meta App Secret used for HMAC-SHA256 signature verification | Meta App Dashboard → App Settings → Basic |

Optional:

| Var | Default | Purpose |
|---|---|---|
| `INSTAGRAM_PORT` | `3790` | Local HTTP port for the webhook receiver |
| `INSTAGRAM_API_BASE` | `https://graph.instagram.com/v24.0` | Override to `https://graph.facebook.com/v24.0` if your token is from the older Facebook Login → Page flow |
| `INSTAGRAM_TIMEZONE` | `UTC` | IANA timezone for `local_time` in notifications |
| `INSTAGRAM_STATE_DIR` | `~/.claude/channels/instagram` | Override the state directory |
| `INSTAGRAM_EXTENSIONS_DIR` | (empty) | Path to a directory exporting an extensions module (CRM enrichment, etc.) |

---

## Dispatch on arguments

Parse `$ARGUMENTS` (whitespace-separated). If empty or unrecognized, show status.

### No args — status and guidance

Read state files and give the user a complete picture:

1. **Credentials** — check `~/.claude/channels/instagram/.env`. For each
   required key, show set/not-set; if set, mask everything except the
   first 6 and last 4 chars.

2. **Access** — read `~/.claude/channels/instagram/access.json` (missing
   file = defaults: `policy: "allowlist"`, empty allowFrom). Show:
   - Policy and what it means in one line
   - Allowed usernames: count, list
   - Media whitelist: count (empty = all)
   - Mention patterns: count

3. **What next** — end with a concrete next step:
   - Missing required env vars → list them and tell the user *"Run
     `/instagram:configure <key>=<value>` for each, or paste a `.env`
     block."*
   - All env vars set, no allowed usernames → *"Configure your webhook
     URL in the Meta App Dashboard pointing to a public tunnel
     (cloudflared/ngrok) of `http://localhost:<INSTAGRAM_PORT>/webhook`,
     then add allowed contacts with `/instagram:access allow <username>`
     (no `@`)."*
   - Token + at least one allowed username → *"Ready. Comments from those
     usernames on your Instagram posts will reach the assistant."*

**Note about WhatsApp parity**: unlike Telegram/Discord, Instagram doesn't
expose private messaging through this plugin's v0.1 — it focuses on
**comments only**. DMs need `instagram_manage_messages` and a separate
Messenger Platform setup (planned for v0.2).

### `<key>=<value>` — save one credential

1. Treat each whitespace-separated arg matching `KEY=VALUE` as a credential
   to save. Trim whitespace and surrounding quotes from the value.
2. Validate `KEY` is one of the recognized vars (see tables above). Reject
   unknown keys with a list of accepted names.
3. `mkdir -p ~/.claude/channels/instagram`
4. Read existing `.env` if present. Update or insert each `KEY=VALUE` line,
   preserving other keys. Write back, no quotes around values.
5. `chmod 600 ~/.claude/channels/instagram/.env` — these are credentials.
6. Confirm what was set (mask values), then show no-args status.

### Multi-line paste — bulk save

If `$ARGUMENTS` contains multiple `KEY=VALUE` pairs, save each in one pass.

### `clear` — remove all credentials

Delete `~/.claude/channels/instagram/.env` (or all `INSTAGRAM_*` lines if
other unrelated keys are in the file).

---

## Implementation notes

- The channels dir might not exist if the server hasn't run yet. Missing
  file = not configured, not an error.
- The server reads `.env` once at boot. Credential changes require a
  session restart or `/reload-plugins`. Say so after saving.
- `access.json` is re-read on every inbound comment — policy changes via
  `/instagram:access` take effect immediately, no restart.
- Never log full token values. Always mask in output.
- The webhook URL configured in Meta must point to a publicly reachable
  HTTPS endpoint (cloudflared, ngrok, or similar tunnel). The server
  itself binds to localhost on `INSTAGRAM_PORT`.
- Meta Apps in **Development Mode** only deliver webhook events for users
  with a role on the app (Admin / Developer / Tester). Going Live
  requires App Review for `instagram_manage_comments`.
