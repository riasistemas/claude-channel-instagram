# Instagram

Connect an Instagram Business account to your Claude Code via the official Instagram Graph API. Inbound comment events arrive as MCP channel notifications; replies post back through the Graph API.

The MCP server runs an HTTP webhook receiver with HMAC-SHA256 signature validation and exposes three tools to the assistant: `reply_comment`, `list_comments`, and `chat_messages`. **No Instagram Web reverse-engineering, no scraping** — uses Meta's official Graph API end-to-end.

> **Scope of v0.1**: comments only. DMs are routed through Meta's Messenger Platform, which requires a separate App Review for `instagram_manage_messages` and is on the v0.2 roadmap.

## Prerequisites

- [Bun](https://bun.sh) — the MCP server runs on Bun. Install with `curl -fsSL https://bun.sh/install | bash`.
- A [Meta Developer account](https://developers.facebook.com/) with a Meta App that has the **Instagram Graph API** product added.
- An Instagram Business account (or Creator account) connected through Business Manager — both the app and the Instagram account must live in the same business portfolio for tokens to work cleanly.
- A way to expose your local webhook over HTTPS: [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/installation/) or [ngrok](https://ngrok.com/), or any HTTPS tunnel.

## Quick Setup
> See [ACCESS.md](./ACCESS.md) for DM policies and access management details.

**1. Configure your Meta App.**

Go to [developers.facebook.com](https://developers.facebook.com/), open your app, and add the **Instagram Graph API** product.

You'll need five values from the Meta dashboard:

- **App Secret** — App Settings → Basic → App Secret (Show)
- **Instagram Business Account ID** — Instagram Graph API → API Setup, or via Business Manager
- **Access Token** — generated for a System User in Business Manager (recommended; long-lived, doesn't auto-expire) with these permissions:
  - `instagram_basic`
  - `instagram_manage_comments`
- A **Verify Token** of your own — any random string; you'll paste the same value into Meta when configuring the webhook URL.

```sh
# generate one with:
openssl rand -hex 32
```

> **Tip**: System User tokens issued from the same business portfolio as the Instagram account are long-lived and don't expire. Tokens generated through other flows (User Token Generator, embedded login) are short-lived (1 hour) and may not be exchangeable across portfolios.

**2. Install the plugin.**

```
/plugin marketplace add github://riasistemas/claude-channel-instagram
/plugin install instagram@riasistemas
/reload-plugins
```

**3. Save credentials.**

```
/instagram:configure INSTAGRAM_ACCESS_TOKEN=<token> INSTAGRAM_BUSINESS_ACCOUNT_ID=<id> INSTAGRAM_VERIFY_TOKEN=<random> INSTAGRAM_APP_SECRET=<secret>
```

Writes to `~/.claude/channels/instagram/.env` (mode 600).

**4. Expose the local webhook over HTTPS.**

In a separate terminal:

```sh
cloudflared tunnel --url http://localhost:3790
```

Cloudflared prints a public URL like `https://random-words.trycloudflare.com`. Copy it.

> The free anonymous tunnel URL changes every restart. For a stable setup, use a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/) or `ngrok http 3790` with a reserved domain.

**5. Configure the webhook in Meta.**

In your Meta App Dashboard → **Webhooks** → product **Instagram**:

- **Callback URL**: `<your-tunnel-url>/webhook`
- **Verify token**: same value you saved as `INSTAGRAM_VERIFY_TOKEN`

Click **Verify and save**, then subscribe to the **`comments`** field.

**6. Relaunch Claude Code with the channel flag.**

```sh
claude --channels plugin:instagram@riasistemas
```

**7. Allow accounts.**

Default `policy` is `allowlist` — comments from unknown usernames are dropped silently. Add the usernames that should reach you:

```
/instagram:access allow <username>
```

`<username>` is the Instagram handle without `@` (e.g. `briefing.juridico`). When that account comments on one of your posts, the comment reaches your Claude Code session.

For replies-by-mention only (no full passthrough), see [ACCESS.md](./ACCESS.md).

## Tools exposed to the assistant

| Tool | Purpose |
| --- | --- |
| `reply_comment` | Reply to an inbound comment. Pass the `comment_id` from the inbound notification meta and the reply text. The reply nests under the original. Auto-trims to 2200 chars. |
| `list_comments` | List recent comments on a specific media (post or Reel) by id. Useful when you want to read context beyond what the webhook delivered. |
| `chat_messages` | Read recent comment history from the local SQLite, optionally scoped to one username. |

Inbound comments arrive as `notifications/claude/channel` with meta containing `chat_id`, `message_id` (the comment id), `user` (`@username`), `media_id`, `media_permalink`, and an optional `parent_comment_id` if it's a reply within a thread.

## Environment variables

### Required

| Var | What it is |
| --- | --- |
| `INSTAGRAM_ACCESS_TOKEN` | Long-lived token with `instagram_basic` + `instagram_manage_comments` |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | The Instagram Business account ID |
| `INSTAGRAM_VERIFY_TOKEN` | Random string you choose; paste same value into Meta's webhook config |
| `INSTAGRAM_APP_SECRET` | Meta App Secret used for HMAC-SHA256 signature verification |

### Optional

| Var | Default | Purpose |
| --- | --- | --- |
| `INSTAGRAM_PORT` | `3790` | Local HTTP port for webhook receiver (different from the WhatsApp plugin's `3789`) |
| `INSTAGRAM_API_BASE` | `https://graph.instagram.com/v24.0` | Override if your token requires the `graph.facebook.com` endpoint (some Business Manager System User tokens) |
| `INSTAGRAM_GRAPH_API_VERSION` | `v24.0` | Graph API version (only used with the default `INSTAGRAM_API_BASE`) |
| `INSTAGRAM_TIMEZONE` | `UTC` | IANA timezone for `local_time` in notifications |
| `INSTAGRAM_STATE_DIR` | `~/.claude/channels/instagram` | Override state directory |
| `INSTAGRAM_EXTENSIONS_DIR` | (unset) | Path to a directory exporting `InstagramExtensions` — see [extensions/README.md](./extensions/README.md) |

## Extensions

The plugin core stays minimal: receive a webhook, gate, deliver, send replies. Anything beyond — CRM lookups, prospect auto-registration, echo targets, permission relay to a different surface — lives outside the core in an optional extensions module loaded via `INSTAGRAM_EXTENSIONS_DIR`.

See [extensions/README.md](./extensions/README.md) for the contract and an example.

## Access control

See **[ACCESS.md](./ACCESS.md)** for DM policies, mention detection, media-scoped access, skill commands, and the `access.json` schema.

Quick reference: usernames stored without `@`. Default policy is `allowlist`. Set `policy: "open"` to forward every comment (use carefully on public accounts).

## What you don't get

- **DMs** — `instagram_manage_messages` requires a separate App Review and Messenger Platform setup. Planned for v0.2.
- **Posting / publishing** — out of scope for a channel plugin. Use the [`/instagram` skill](https://github.com/anthropics/claude-plugins-official) or the Graph API directly for `instagram_content_publish`.
- **Buffered inbound when offline** — Meta retries webhook deliveries for up to 24 hours. Longer outages drop messages.

## Limitations

- **HTTPS required**: Meta delivers webhooks only to valid HTTPS URLs. Localhost direct doesn't work — use a tunnel.
- **Development Mode filter**: while your Meta App is in Development Mode, Instagram only delivers webhook events for users who have a role on the app (Admin / Developer / Tester). Users outside the role list have their comments silently filtered by Meta. To receive comments from any user, your app must be in Live Mode (which requires App Review for `instagram_manage_comments`).
- **Comment-only**: this plugin does not handle DMs, mentions on Stories, or Live comments. The `messages` and `live_comments` webhook fields are ignored if subscribed.
- **One plugin instance per machine**: the plugin uses a PID lock at `~/.claude/channels/instagram/plugin.pid` to kill stale instances.

## Privacy

All plugin data lives on the user's local machine. The maintainer does not operate any backend that this plugin talks to. See [PRIVACY.md](./PRIVACY.md) for the full policy.

## License

Apache-2.0.

## Maintainer

Maintained by [RIA Systems](https://github.com/riasistemas), a Meta Tech Provider. Issues and PRs welcome at the [standalone repo](https://github.com/riasistemas/claude-channel-instagram).
