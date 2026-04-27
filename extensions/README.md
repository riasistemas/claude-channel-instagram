# Extensions

The Instagram plugin keeps its public core minimal: receive a webhook, run
the access gate, deliver to Claude, send replies via the Graph API. Anything
beyond that — CRM lookups, prospect auto-registration, echo targets,
permission relay to a different surface — lives outside the core in an
**optional extensions module**.

## How it works

If you set the `INSTAGRAM_EXTENSIONS_DIR` environment variable to a directory
that exports a default implementation of `InstagramExtensions`, the plugin
loads it at boot and calls the hooks at the appropriate points:

| Hook | When it runs | What it can do |
| --- | --- | --- |
| `onInboundComment(ctx)` | After the access gate passes, before the MCP notification reaches Claude | Return a partial meta object to inject extra fields (e.g. `crm_name`, `crm_stage`) into the notification |
| `onFirstContact(ctx)` | The first time a previously unknown username comments | Auto-register a prospect, send a webhook elsewhere, emit a metric |
| `onReplySent(ctx)` | After the plugin successfully sent a reply via the Graph API | Echo the message to another system, write to an audit log, register a CRM event |
| `permissionRelay(prompt)` | When a permission prompt needs user approval and you want a different surface than Instagram | Forward to WhatsApp / Telegram / Slack / wherever, resolve to `allow` or `deny` |

Without the env var, the plugin runs as a pure generic Instagram channel.

## Interface

```typescript
import type { InstagramExtensions } from "claude-channel-instagram/lib/extensions"

let notify: (params: { content: string; meta: Record<string, string> }) => void

const extensions: InstagramExtensions = {
  // Optional. Called once at boot. Use it to capture `notify` and `log`
  // for use in background loops or asynchronous hooks.
  async init(ctx) {
    notify = ctx.notify
    // Example: start a 5-minute action-nudge loop
    setInterval(() => {
      notify({ content: "...", meta: { chat_id: "system;-;actions" } })
    }, 5 * 60 * 1000).unref()
  },

  async onInboundComment(ctx) {
    // ctx: { comment_id, text, username, ig_user_id, media_id,
    //        media_permalink, parent_comment_id, timestamp, is_first_contact }
    //
    // Return a partial meta object to inject into the notification:
    return {
      crm_name: "Acme Inc.",
      crm_stage: "lead",
    }
    // Or return undefined / nothing to leave the notification untouched.
  },

  async onFirstContact(ctx) {
    // ctx: { username, ig_user_id, comment_id, text }
    // Side-effect only. No return value used.
  },

  async onReplySent(ctx) {
    // ctx: { comment_id, reply_id, message,
    //        in_reply_to_username, in_reply_to_text, media_id }
  },

  async permissionRelay(prompt) {
    // prompt: { request_id, tool_name, description, input_preview, pattern }
    return { behavior: "allow" /* or "deny" */ }
    // Optionally include `pattern_remembered` to mark this pattern as
    // "always allow" for the rest of the session.
  },
}

export default extensions
```

All hooks are optional — implement only the ones you need.

## Quick start

```bash
mkdir -p ~/my-instagram-extensions
cd ~/my-instagram-extensions
npm init -y
# ... write index.ts implementing the interface above ...
INSTAGRAM_EXTENSIONS_DIR=~/my-instagram-extensions  claude --channels plugin:instagram@riasistemas
```

## Safety

- Hooks run inside the same process as the plugin core. Treat them as
  trusted code.
- Each hook is wrapped in a try/catch — a thrown error logs and is
  suppressed; it does not crash the plugin or block message delivery.
- Hooks are awaited inline. Heavy work (network calls, large CRM lookups)
  can delay the MCP notification reaching Claude. Keep them under ~500 ms
  ideally; for slower work, fire-and-forget asynchronously.

## Examples

The reference internal implementation used by RIA Systems lives at
[`riasistemas/ria-instagram-extensions`](https://github.com/riasistemas/ria-instagram-extensions)
*(private)*. It demonstrates CRM enrichment, prospect auto-registration,
and cross-channel permission relay.
