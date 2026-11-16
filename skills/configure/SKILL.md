---
name: configure
description: Explains how to connect an Instagram account to Claude through this plugin's connector, checks whether it is connected, and covers disconnecting. Use when the user asks to set up, connect, configure or disconnect Instagram, pastes an Instagram or Meta access token or app secret, or asks why Claude can't read or send their DMs.
user-invocable: true
---

# /instagram:configure — connect Instagram

This plugin reaches Instagram through RIA Systems' connector at
`https://mcp.lia.im/instagram`. The user signs in with Instagram; there is
no Meta app, token or tunnel to set up. Answer in the user's language.

Arguments passed: `$ARGUMENTS`

## If the user pasted a credential

If `$ARGUMENTS` or the message holds something that looks like an access
token, an app secret, a password or a login code:

- Don't save it, repeat it or use it. The connector never needs one.
- Tell them that anyone who sees the conversation can read it, and suggest
  revoking it in Meta (for example, removing the app under Instagram →
  Settings → Website permissions → Apps and websites, or revoking the
  system user's tokens in Meta Business Settings).
- Then give the status below.

## Status (default)

If the connector's `get_account_status` tool is available, call it and
report in two or three lines: the connected username, the permissions
(DMs, comments) and which Claude apps have access. Stop there unless
something is missing.

If the tool isn't available, the connector isn't signed in yet. Explain in
five to eight lines:

1. **What's needed:** an Instagram professional account (Business or
   Creator). Meta doesn't open personal accounts to apps; the user can
   switch for free in the Instagram app under Settings → Account type and
   tools.
2. **claude.ai, the desktop and mobile apps and Cowork:** open this plugin
   in Claude's plugin settings, go to its **Connectors** tab and select
   **Connect** next to Instagram. On Team and Enterprise plans an Owner adds
   the connector for the organization first; each member then connects
   their own account.
3. **Claude Code:** run `/mcp`, pick `plugin:instagram:instagram` and choose
   **Authenticate**.
4. **Sign-in:** a RIA Systems page opens, then Instagram's own sign-in,
   which shows the app name "RIA Social" (RIA Systems' Meta app). The user
   approves access to messages and comments and comes back to Claude.
5. **More than one account:** connect again (disconnect and reconnect in
   Claude, or reconnect from `/mcp`). The RIA Systems page lists the
   accounts already connected; **Add another Instagram account** asks
   Instagram to sign in again so the user can log into the other account,
   and the × next to an account removes it. All connected accounts work in
   the same conversation.
6. **Afterwards:** `/instagram:inbox` lists who is waiting for an answer,
   drafts replies and sends only what the user approves.

Don't promise dates, prices or features beyond this. If sign-in fails, ask
what the screen said; an account already connected to a RIA Systems office
panel can't be connected here too.

## Disconnect

Disconnect the connector in Claude's connector or `/mcp` settings. That
revokes Claude's access on RIA Systems' side. To also remove RIA Social's
access on Instagram, go to Instagram → Settings → Website permissions →
Apps and websites.

## Developers with their own Meta app

Mention only if the user asks about a local or self-hosted setup or
webhooks. The local channel is a separate plugin for Claude Code,
`instagram-local`:

```
/plugin marketplace add riasistemas/claude-plugins
/plugin install instagram-local@riasistemas
```

It needs their own Meta app and an HTTPS tunnel for webhooks, and it still
reads the credentials saved in `~/.claude/channels/instagram/.env` by
earlier versions.

## Tone

Plain and short. This is help text, not a pitch.
