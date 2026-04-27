# Privacy Policy

Last updated: 2026-04-26

This privacy policy describes how the **`instagram` plugin for Claude Code** (the "plugin") handles data. It applies to anyone who installs and uses the plugin.

The plugin is open-source software distributed under Apache-2.0 and maintained by RIA Systems. The maintainer does **not** operate any backend that the plugin connects to. All data flow is between the user's own machine, the user's own Instagram Business account, and Meta Platforms, Inc.

## TL;DR

- The plugin runs entirely on the user's machine.
- The maintainer (RIA Systems) does **not** receive, store, or have any access to comments, contacts, tokens, or any other data the plugin handles.
- The plugin talks to **Meta's Instagram Graph API** using the user's own credentials. Meta's privacy practices apply to that traffic — see [Meta's Privacy Policy](https://privacycenter.instagram.com/policy).

## Data the plugin handles

### Stored locally

The plugin reads and writes the following on the user's machine:

| Data | Location | Purpose |
| --- | --- | --- |
| Comment history (inbound + replies) | `~/.claude/channels/instagram/messages.db` (SQLite) | Lets the `chat_messages` tool surface recent context to the assistant |
| Allowlist, policy, media whitelist, mention patterns | `~/.claude/channels/instagram/access.json` | Access control state |
| Graph API credentials | `~/.claude/channels/instagram/.env` (mode 600) | Required to talk to the Instagram Graph API |
| PID lock and operational logs | `~/.claude/channels/instagram/plugin.pid`, `plugin.log` | Lifecycle management |

The state directory can be moved with the `INSTAGRAM_STATE_DIR` environment variable. None of this data ever leaves the user's machine through any path controlled by the plugin maintainer.

### Sent to third parties

The plugin makes outbound network calls only to:

1. **Meta Graph API** (default `https://graph.instagram.com/v24.0/...`, overridable to `https://graph.facebook.com/v24.0/...`). Outbound: comment replies, list-comments queries, comment moderation. Inbound: webhook deliveries received by the plugin's local HTTP server. Authenticated with the `INSTAGRAM_ACCESS_TOKEN` provided by the user. Meta's privacy practices govern this traffic.

2. **The user's chosen tunnel provider** (cloudflared, ngrok, or any other HTTPS tunnel the user configures). The tunnel forwards Meta's webhook POSTs to the plugin's local server. The tunnel provider's privacy practices govern this traffic.

The plugin does **not** make any network calls to RIA Systems infrastructure or to any other third party not explicitly configured by the user.

### Optional extensions module

If the user sets `INSTAGRAM_EXTENSIONS_DIR`, the plugin loads a separate module that can implement hooks for CRM enrichment, prospect auto-registration, and permission relay. That code runs in the same process as the plugin and is **not** controlled by RIA Systems unless the user installs an RIA-provided extensions module. Each extension's privacy practices are governed by its own author.

## What RIA Systems can see

Nothing.

There is no telemetry, no error reporting, no usage analytics, and no remote logging in this plugin. RIA Systems is the maintainer of the open-source code; it is not an operator of any service that the plugin uses.

If a user opens an issue or pull request on the [GitHub repository](https://github.com/riasistemas/claude-channel-instagram), the information they choose to share is processed by GitHub under [GitHub's privacy policy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

## Data subject rights

Because all plugin data lives on the user's local machine, the user is in full control:

- **Access**: open `~/.claude/channels/instagram/messages.db` with any SQLite client.
- **Export**: copy the state directory.
- **Delete**: remove the state directory (`rm -rf ~/.claude/channels/instagram/`). The plugin recreates an empty state on next start.
- **Rectification**: edit `access.json` directly or use the `/instagram:access` skill.

For data held by Meta (the comments themselves, account metadata, etc.), refer to [Meta's Privacy Policy](https://privacycenter.instagram.com/policy) and the rights it grants under applicable law.

## Children

The plugin is a developer tool intended for adult use. It is not directed to anyone under the age of 13.

## Changes to this policy

Changes to this policy are tracked in the repository's git history. The "Last updated" date at the top of this file reflects the most recent change.

## Contact

For questions about this policy or about RIA Systems' role as maintainer:

- Email: ti@riasistemas.com.br
- GitHub Issues: https://github.com/riasistemas/claude-channel-instagram/issues
