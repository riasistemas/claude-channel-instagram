# Instagram Plugin — Full Setup Walkthrough

Step-by-step guide to get the plugin receiving Instagram comments and DMs end-to-end. Complements the [`/instagram:configure`](skills/configure/SKILL.md) skill with the missing operational steps (tunnel, webhook registration, owner / permission flow, gotchas) that bite first-time users.

---

## Prerequisites

- A Meta Business account that owns an Instagram Business or Creator account
- A Meta App in Business Manager with Instagram Graph API product enabled
- Node.js / Bun runtime for the plugin
- A tunneling tool — **ngrok** (quickstart) or **Cloudflare Tunnel** (recommended for production, has stable URL)
- (Optional) A second Meta App with WhatsApp Business API if you want **proactive tool-permission approvals over WhatsApp** (see *Owner & permission flow* below)

---

## Quick start (5 steps)

```bash
# 1. Install plugin via Claude plugins catalog (or clone source)
# 2. Generate Meta credentials (see "Credentials" below)
# 3. Save them with the configure skill:
/instagram:configure INSTAGRAM_ACCESS_TOKEN=IGAAN... INSTAGRAM_BUSINESS_ACCOUNT_ID=178... INSTAGRAM_VERIFY_TOKEN=$(openssl rand -hex 32) INSTAGRAM_APP_SECRET=...

# 4. Start a public tunnel pointing at the plugin's port (default 3790):
ngrok http 3790
# copy the https URL (e.g. https://c61e-xxxx.ngrok-free.app)

# 5. Register the webhook URL in the Meta App Dashboard:
#    Developer console → Webhooks → Instagram (or Instagram Messenger)
#    Callback URL:   https://<your-tunnel>.ngrok-free.app/webhook
#    Verify Token:   <the same INSTAGRAM_VERIFY_TOKEN you saved in step 3>
#    Click "Verify and Save"
```

If the verify step succeeds, send a test comment from an allowed account on any of your IG posts. The plugin should log the inbound and notify Claude.

---

## Detailed setup

### 1. Credentials

Generate these in Meta Business Manager / App Dashboard:

| Var | Where |
|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | Business Settings → System Users → pick/create user → **Generate Token**. Pick the app, then enable scopes: `instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`. For Marketing API access (read dark-post comments), also add `ads_read`, `ads_management`, `business_management`. System User tokens **don't expire**, regular User tokens last ~60 days. |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | Meta App Dashboard → Instagram Graph API → Generate Token panel shows the IG Business account ID, or query `GET /me?fields=id` with the token. |
| `INSTAGRAM_VERIFY_TOKEN` | You choose. `openssl rand -hex 32` is enough. **Save this value** — you'll paste the exact same string into the Meta webhook config in step 5. |
| `INSTAGRAM_APP_SECRET` | Meta App Dashboard → App Settings → Basic → App Secret. Used for HMAC-SHA256 signature verification on incoming webhooks. |

Save them via the configure skill (`/instagram:configure KEY=VALUE`) which writes to `~/.claude/channels/instagram/.env` with `chmod 600`.

### 2. Start the tunnel

The plugin binds to `localhost:3790` by default. Meta only delivers webhooks to a public HTTPS endpoint, so you need a tunnel.

**ngrok (quickstart, free tier)**

```bash
ngrok http 3790
```

Copy the `https://...ngrok-free.app` URL from the output.

> ⚠️ **ngrok free tier changes the URL on every restart.** When that happens, webhook delivery silently breaks until you update the URL in the Meta console. See *Gotchas* below.

**Cloudflare Tunnel (recommended for production)**

```bash
cloudflared tunnel create instagram-plugin
cloudflared tunnel route dns instagram-plugin ig-webhook.yourdomain.com
cloudflared tunnel run --url http://localhost:3790 instagram-plugin
```

Stable URL across restarts, free.

### 3. Register the webhook in Meta

1. Go to https://developers.facebook.com/apps/&lt;APP_ID&gt;/webhooks/
2. Choose **Instagram** product (or **Instagram Messenger** if configuring DMs).
3. Set:
   - **Callback URL**: `https://<tunnel-host>/webhook`
   - **Verify Token**: paste the EXACT value of `INSTAGRAM_VERIFY_TOKEN` from your `.env`
4. Click **Verify and Save**. Meta does a `GET /webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...` — the plugin echoes the challenge if the token matches.
5. Subscribe to fields:
   - For comments: `comments`, `mentions`
   - For DMs: `messages`, `messaging_postbacks`, `messaging_seen`

### 4. Subscribe the IG Business Account to the webhook

This step is easy to miss. Even after webhook URL is verified, Meta won't push events for a specific IG account until you subscribe it:

```bash
curl -X POST "https://graph.instagram.com/v24.0/<INSTAGRAM_BUSINESS_ACCOUNT_ID>/subscribed_apps" \
  -d "subscribed_fields=comments,messages,mentions" \
  -d "access_token=<INSTAGRAM_ACCESS_TOKEN>"
```

Verify with:

```bash
curl "https://graph.instagram.com/v24.0/<INSTAGRAM_BUSINESS_ACCOUNT_ID>/subscribed_apps?access_token=<TOKEN>"
```

### 5. Verify end-to-end

1. Make sure plugin is running (`pgrep -fl server.ts` should show one process).
2. Make sure tunnel is up (`pgrep -fl ngrok` or `pgrep -fl cloudflared`).
3. Hit your own webhook from a terminal:
   ```bash
   curl "https://<tunnel-host>/webhook?hub.mode=subscribe&hub.verify_token=<INSTAGRAM_VERIFY_TOKEN>&hub.challenge=test123"
   # expect: test123 (200)
   ```
4. From an allowed account, comment on one of your IG posts. Plugin log should show `>>> @username (comment): "..."` within seconds.
5. Reply via Claude using the `reply_comment` tool.

---

## Owner & permission flow

This section answers two questions:
- **Who is "the owner"?** — the human who decides which tool calls are allowed.
- **Where do approvals happen?** — terminal by default; WhatsApp or other channel if you configure relay.

### How permissions work in this plugin (v0.3.0+)

The plugin core (`server.ts`) does **not** prompt for permission inline. Whenever a tool call needs approval, **two things happen in parallel**:

1. **Claude Code's terminal prompt** appears in the terminal where Claude is running (Allow / Always / Deny on the keyboard).
2. **The `permissionRelay` extension hook fires async**, if you have one configured. Common implementations notify a remote owner (WhatsApp button, Slack, email, etc.).

Whichever resolves first wins. If the relay returns a decision before the terminal user presses a key, the plugin emits the MCP `permission` notification, which closes the local prompt and tells Claude what to do. If the relay times out or returns `null`, the terminal prompt remains the sole path. The plugin core **never** auto-denies — a no-op extension (or no extension at all) is safe; it just means terminal-only.

> ⚠️ **Older versions (≤ v0.2.0)** had a different design: the relay was bloqueante and the core defaulted to `'deny'` if no extension was loaded. That race-killed the terminal prompt and was a footgun. v0.3.0 changes the contract — `permissionRelay` may return `null` to mean "no override", and the relay runs as a side-channel without blocking. If you fork an older version, see `server.ts:638-688` for the new contract.

### Option 0 — Terminal prompt (default; works out of the box)

If you run Claude in a terminal that's always open, you don't need to configure anything special. Out of the box, every tool-permission prompt shows up in the terminal where Claude is running.

**Setup:** nothing to do. Don't load `permissionRelay` and the terminal is your sole approval path.

**Reference patch (already applied in v0.3.0+, kept here for forks of older versions):**

```diff
   async ({ params }) => {
     const { request_id, tool_name, description, input_preview } = params
     const pattern = `${tool_name}:${description.split(/\s+/)[0] ?? ''}`

     const decision = extensions.permissionRelay
       ? await runHook(log, 'permissionRelay', () =>
           extensions.permissionRelay!({
             request_id,
             tool_name,
             description,
             input_preview,
             pattern,
           }),
         )
       : undefined

-    const behavior = decision?.behavior ?? 'deny'
-    void mcp.notification({
-      method: 'notifications/claude/channel/permission',
-      params: { request_id, behavior },
-    })
-    log(`permission ${request_id} (${tool_name}): ${behavior}`)
+    if (decision) {
+      void mcp.notification({
+        method: 'notifications/claude/channel/permission',
+        params: { request_id, behavior: decision.behavior },
+      })
+      log(`permission ${request_id} (${tool_name}): ${decision.behavior}`)
+    } else {
+      log(`permission ${request_id} (${tool_name}): no relay configured — falling through to terminal prompt`)
+      // Do NOT emit the decision notification. Claude Code will prompt the user locally.
+    }
   },
```

Tool wants to run → Claude Code shows the standard "Allow / Always / Deny" prompt in the terminal → user decides on the keyboard. No further configuration needed.

### Option A — WhatsApp-relayed approvals as a side-channel (terminal still works in parallel)

Use this when the owner isn't always sitting at the terminal — e.g. operations team approving from their phones. The reference extensions module ships a `permission_relay.ts` that:

1. Sends a WhatsApp message with three interactive buttons (✅ Sim / 🔁 Sempre aqui / ❌ Não) to the owner's phone.
2. Writes a pending entry to `~/.claude/channels/permission-relay.json` keyed by `request_id`.
3. Polls that file every 1s, up to 90s, waiting for the WhatsApp plugin to record the owner's choice.
4. Returns `null` on timeout or send failure — the plugin core then leaves the terminal prompt as the only path (no auto-deny).

The terminal prompt continues to render in parallel. First answer (terminal or WhatsApp) wins.

**Required env vars (in addition to the Instagram ones):**

| Var | Default | Purpose |
|---|---|---|
| `WHATSAPP_ACCESS_TOKEN` | (none) | Bearer token for the WhatsApp Business API. **No default** — without this, the relay returns `null` on every request (no override) and the terminal prompt stays the sole path. |
| `WHATSAPP_PHONE_NUMBER_ID` | (upstream-baked default) | The WABA Phone Number ID that **sends** the buttons. The default in the reference extensions module points to the upstream maintainer's WABA — **always override** for any other org. |
| `WHATSAPP_PERMISSION_TARGET` | (upstream-baked default) | The recipient phone in E.164 (no `+`). The default in the reference extensions module points to the upstream maintainer's personal WhatsApp — **always override** for non-upstream installs. |

**Add to `~/.claude/channels/instagram/.env`:**

```
WHATSAPP_ACCESS_TOKEN=EAAJ...
WHATSAPP_PHONE_NUMBER_ID=<your-phone-number-id>
WHATSAPP_PERMISSION_TARGET=<owner-phone-e164-no-plus>
```

The companion WhatsApp plugin must be running and have access to the **same** `permission-relay.json` file, so it can read button replies and write the decision. See `extensions/README.md` for the cherry-picked WhatsApp-side handler.

### Option B — Pre-approve everything in `settings.json` (full autonomy)

For headless / fully trusted setups where Claude should run tools without asking:

```jsonc
// ~/.claude/settings.json
{
  "permissions": {
    "allow": [
      "mcp__plugin_instagram_instagram__reply_comment",
      "mcp__plugin_instagram_instagram__send_dm",
      "mcp__plugin_instagram_instagram__send_private_reply",
      "mcp__plugin_instagram_instagram__chat_messages",
      "mcp__plugin_instagram_instagram__list_comments"
    ]
  }
}
```

This skips the permission prompt entirely for those tools. Combine with the `/instagram:access` allowlist (which controls **who** can reach the assistant) for safety.

### Option C — Custom `permissionRelay` (Slack, email, push, etc.)

Write your own extensions module. The interface is exported in `lib/extensions.ts`:

```typescript
import type { InstagramExtensions, PermissionPrompt, PermissionDecision } from './lib/extensions.ts'

const ext: InstagramExtensions = {
  async permissionRelay(prompt: PermissionPrompt): Promise<PermissionDecision> {
    // your own logic here — Slack, push, email, file-based, etc.
    return { behavior: 'allow' }  // or 'deny'
  },
}
export default ext
```

Point `INSTAGRAM_EXTENSIONS_DIR` at the directory containing `index.ts` and the plugin will load it at boot.

> ⚠️ Why **not** use Instagram itself as the relay? You might think *"my owner is on Instagram, just DM them the prompt."* Three constraints make this fragile:
> 1. The Graph API does not allow self-DM (the Business account can't message itself). The owner needs a separate IG account.
> 2. The 24h DM window applies — if the owner doesn't message the Business account within 24h, the prompt won't deliver.
> 3. Instagram supports `quick_reply` (chips) but not the rich 3-button payload of WhatsApp; the inbound parser has to handle plain-text replies.
>
> Possible, but brittle. Use Option 0 (terminal) or A (WhatsApp) when you can.

### Quick decision tree

```
Is Claude running in a terminal you watch?
├─ Yes → Option 0: terminal prompts (apply patch, no relay extension)
│
└─ No, you need remote approval
    ├─ Operations team on WhatsApp? → Option A: WhatsApp relay
    ├─ Slack/email/push preferred?  → Option C: custom permissionRelay
    └─ Fully autonomous, no human? → Option B: pre-approve in settings.json
```

---

## Gotchas (lessons learned the hard way)

### A. Verify token mismatch
Meta returns *"Não foi possível validar a URL de callback ou o token de verificação"* when the verify token in the Meta console doesn't match the one in `.env`. The error message doesn't say which side is wrong. **Always copy from `.env` to the console, never the reverse**, and double-check you're not confusing it with the WhatsApp plugin's verify token (different value).

### B. ngrok free URL rotates on restart
Each `ngrok http 3790` invocation gives you a new random URL. Closing the terminal or rebooting your laptop kills the tunnel. When that happens:
- Webhook URL in Meta console is now stale → all events drop silently
- The plugin shows no errors (it just doesn't receive anything)
- Your prospects' DMs go into the void

**Detection**: `pgrep ngrok` returns empty AND your old tunnel URL responds with the ngrok offline HTML page.

**Mitigation**: use Cloudflare Tunnel with a custom domain (free, stable URL), or upgrade to ngrok paid for a static domain.

### C. Outbound audio format — IG ≠ WhatsApp
Even though the `send_dm` tool description says *"OGG opus recommended"*, Instagram's Messaging API actually rejects OGG with a generic *"An unknown error has occurred"*. Use **M4A/AAC** instead:

```bash
ffmpeg -i input.mp3 -c:a aac -b:a 64k output.m4a
```

Then `send_dm(chat_id, audio_path: "output.m4a")` works. (WhatsApp continues using OGG opus — the formats are not interchangeable.)

### D. 24h DM window counts from user's last inbound
Instagram's policy closes the DM window 24 hours after the **prospect's last inbound message**, not after your last outbound. Sending more outbound messages does NOT extend the window. After 24h with no inbound, `send_dm` returns *"24h DM window expired"* and there is no template-based reopening like WhatsApp has.

**Implication**: cadence-based follow-ups in IG must all happen within 24h of the last user message. After that, you wait for the user to comment on another post (re-opens via comment-to-DM, gives you 1 fresh send).

### E. Comment-to-DM does NOT open the DM window for proactive follow-ups
After `send_private_reply` (the comment-to-DM tool), you've delivered ONE message via Meta's exception. But the regular DM window stays closed until the user replies in DM. Your follow-up `send_dm` calls will fail with *"has not DM'd us yet"* until they engage.

**Implication**: prospects who never respond to the first private_reply DM are unreachable proactively. Either wait for them to comment again (lets you use comment-to-DM with a new comment), or accept the loss.

### F. Anonymous commenters
The Instagram Graph API only returns `username` for users who follow you or have public profiles. Most commenters return as `username: null`. You can still reply via `reply_comment` and `send_private_reply` using the `comment_id`, but you won't have their handle.

If multiple anonymous commenters get grouped under the same `chat_id` (`any;-;@unknown`) in the local DB, sending DMs there is risky — they'd land on the wrong recipient. Filter `unknown` out of automated outbound until the plugin can disambiguate by `ig_user_id`.

### G. Meta App in Development Mode = whitelist-only
While your app is in **Development Mode**, webhooks fire only for users with a role on the app (Admin / Developer / Tester). Going **Live** requires App Review approval for `instagram_manage_comments` (and `instagram_manage_messages` for DMs). Test users from a different IG account won't trigger events until you go Live or add them as Testers.

### H. Two access tokens to keep separate
1. **Graph API (Instagram messaging)** token — uses `instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`. Goes in `INSTAGRAM_ACCESS_TOKEN`.
2. **Marketing API** token (optional, for reading dark-post comments) — needs `ads_read`, `ads_management`, `business_management`. Different env var, different code path.

A single System User token CAN have all 8 scopes if you grant them all when generating, but the System User must be assigned to both the IG Business asset AND the Ad Account assets in Business Manager.

### I. Restart required after `.env` changes
The server reads `.env` once at boot. Run the configure skill, then **restart the plugin** (`pkill -f server.ts && bun server.ts` or use Claude's `/reload-plugins`). Webhook URL changes in the Meta console take effect immediately, but verify token and other env vars only after restart.

### J. Reference extension carries upstream-baked defaults
The reference `permission_relay.ts` (in the companion `*-extensions` repo) ships with `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_PERMISSION_TARGET` defaults pointing to the upstream maintainer's WABA and personal phone.

If you install the plugin in a different organization and forget to override these env vars, **every tool-approval request will be sent to the upstream maintainer's phone instead of yours**. Always set both env vars explicitly before going live, or fork the extension and remove the defaults entirely.

---

## Common errors quick reference

| Error | Cause | Fix |
|---|---|---|
| Meta verify fails ("URL inválida") | Verify token mismatch OR tunnel offline | Compare token in Meta console vs `.env`, restart tunnel |
| `403 forbidden` on local webhook | Verify token in plugin doesn't match request | Update `.env` and restart plugin |
| Plugin running but no inbound logs | Tunnel killed / URL changed / not subscribed to fields | `pgrep ngrok`, recheck Meta webhook config, run subscribed_apps POST |
| `send_dm`: "24h window expired" | Last inbound from user > 24h ago | Wait for user to message; can't reopen via API |
| `send_dm`: "has not DM'd us yet" | User came via `send_private_reply` but never replied | Wait for engagement, can't bypass |
| `send_dm`: "Invalid keys 'url' in attachment" | Plugin version with media bug (pre-fix) | Update plugin to ≥0.2.0 |
| `send_dm` audio fails generically | OGG format used | Convert to M4A/AAC |
| Outbound audio chega como anexo, não voice message | Plugin doesn't set `is_voice` flag | Open issue / patch graph-api.ts |
| All tool calls auto-denied | You're on plugin v0.2.0 or earlier (legacy bloqueante design) | Upgrade to v0.3.0+ or apply the side-channel patch |
| Approval prompts arrive on the wrong phone | Default `WHATSAPP_PERMISSION_TARGET` not overridden | Set the env var to your real owner phone |
| WhatsApp button sent but terminal also prompts | Expected behavior — both run in parallel, first answer wins | No fix; tap the button or press a key, the other side closes |

---

## Post-setup smoke test checklist

- [ ] `/instagram:configure` shows all 4 required env vars set
- [ ] Tunnel is up and `curl https://<tunnel>/webhook?hub.challenge=...&hub.verify_token=...` returns the challenge
- [ ] Meta webhook console shows the URL as **Verified**
- [ ] `subscribed_apps` GET returns the IG Business account with subscribed fields
- [ ] (If using Option 0) Patch applied to `server.ts` and no extensions with `permissionRelay` are loaded
- [ ] (If using Option A) `WHATSAPP_PERMISSION_TARGET` is your real phone, not the upstream default baked into the reference extension
- [ ] (If using Option B) `settings.json` allowlist covers all `mcp__plugin_instagram_instagram__*` tools you'll use
- [ ] Test comment from allowed account triggers `>>> @username (comment): "..."` in plugin log
- [ ] Reply with `reply_comment` and the reply appears on Instagram
- [ ] (For DMs) Allowed user sends a DM, plugin logs `>>> @username (dm): "..."`
- [ ] Reply with `send_dm` and the message arrives on the other end
- [ ] (If using Option A) A tool-permission prompt arrives on the owner WhatsApp with three buttons

If all 10 boxes are checked, you're operational.

---

## See also

- [`README.md`](README.md) — plugin overview
- [`ACCESS.md`](ACCESS.md) — allowlist policy and `/instagram:access`
- [`skills/configure/SKILL.md`](skills/configure/SKILL.md) — credential management skill
- [`skills/access/SKILL.md`](skills/access/SKILL.md) — allowlist management skill
- [`extensions/README.md`](extensions/README.md) — extension hooks contract (`permissionRelay`, `onInboundDm`, etc.)
- [Meta Webhooks docs](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
- [Instagram Graph API docs](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api)
