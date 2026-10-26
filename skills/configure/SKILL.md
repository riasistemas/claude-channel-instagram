---
name: configure
description: Explains what the Instagram plugin does on each Claude app and the options to connect an Instagram account. Use when the user asks to set up, connect or configure Instagram, pastes an Instagram or Meta access token or app secret, asks why Claude can't read or send their DMs, or asks about the connected version.
user-invocable: true
---

# /instagram:configure — what this plugin does and how to connect

This plugin has nothing to configure: it runs no server and stores no
credentials. This skill tells the user what works today and what their
options are. Answer in the user's language.

Arguments passed: `$ARGUMENTS`

## If the user pasted a credential

If `$ARGUMENTS` or the message holds something that looks like an access
token, an app secret, a password or a login code:

- Don't save it, repeat it or use it.
- Tell them that anyone who sees the conversation can read it, and suggest
  revoking it in Meta (for example, removing the app under Instagram →
  Settings → Website permissions → Apps and websites, or revoking the
  system user's tokens in Meta Business Settings).
- Then give the status below.

## Status (default)

Keep it to five to eight lines:

1. **Works now on claude.ai, the desktop and mobile apps, Cowork and Claude
   Code**: `/instagram:inbox`. The user pastes a DM or comment, as text or a
   screenshot, and gets a reply ready to send, a short read of the lead and
   a next step. Nothing is sent and no Instagram login is needed.
2. **Claude reading and answering DMs by itself**: not part of this plugin
   today. RIA Systems is building a connected version where the user signs
   in with Instagram, with no Meta app or token. If they want to know when
   it opens, share the waitlist:
   https://claude-plugins.riasistemas.com.br/en/instagram?src=plugin-configure#cloud
   (Portuguese:
   https://claude-plugins.riasistemas.com.br/instagram?src=plugin-configure#cloud).
   Don't promise dates, prices or features beyond this.
3. **Developers with their own Meta app**: mention only if the user asks
   about a local or self-hosted setup, webhooks, or the tools this plugin
   had before v0.4.0. The local channel is now a separate plugin for Claude
   Code, `instagram-local`:

   ```
   /plugin marketplace add riasistemas/claude-plugins
   /plugin install instagram-local@riasistemas
   ```

   It needs their own Meta app and an HTTPS tunnel for webhooks, and it
   still reads the credentials saved in `~/.claude/channels/instagram/.env`
   by earlier versions.

## Tone

Plain and short. This is help text, not a pitch: mention the connected
version once, as an option.
