# Instagram

A Claude plugin that helps you answer Instagram DMs and comments. Sign in
with Instagram and Claude lists who is waiting for an answer, reads the
conversation, drafts the reply in your voice and sends it once you approve.
Without signing in, paste a conversation or a screenshot and Claude drafts
the reply for you to send.

Works on claude.ai, the Claude desktop and mobile apps, Cowork and Claude
Code. You need an Instagram professional account (Business or Creator) to
connect; no Meta app, token or tunnel.

## Skills

| Skill | What it does |
| --- | --- |
| `/instagram:inbox` | Lists DMs and comments waiting for an answer, drafts replies with a short lead read and a next step, and sends the ones you approve. Without the connector, drafts a reply to a DM or comment you paste (text or screenshot). |
| `/instagram:configure` | Shows whether Instagram is connected and how to connect or disconnect it. |

Example:

> **You:** /instagram:inbox who's waiting for an answer?
>
> **Claude:** three DMs inside the 24-hour window, the oldest a question
> about the 3-month plan. A two-sentence reply with a `[price]` placeholder
> for you to fill in, then: *Lead: warm, asking about price, goal unknown.
> Next step: answer, then offer a 10-minute call.* Send it?

## Install

Find "instagram" in the [Claude directory](https://claude.ai/directory) and
add it. A plugin added on claude.ai also loads in Claude Code through
account sync.

In Claude Code you can also install it from RIA Systems' catalog:

```
/plugin marketplace add riasistemas/claude-plugins
/plugin install instagram@riasistemas
```

## Connect Instagram

- **claude.ai, desktop, mobile and Cowork:** open the plugin in Claude's
  plugin settings, go to its **Connectors** tab and select **Connect**. On
  Team and Enterprise plans an Owner adds the connector for the
  organization first; each member connects their own account.
- **Claude Code:** run `/mcp`, pick `plugin:instagram:instagram` and choose
  **Authenticate**.
- **Several accounts:** connect again and choose **Add another Instagram
  account** on the RIA Systems page. Every connected account is available
  in the same conversation; tell Claude which @ to use.

Instagram's sign-in screen shows the app name "RIA Social", RIA Systems'
Meta app. To disconnect, use Claude's connector or `/mcp` settings; to also
remove the app's access on Instagram, go to Settings → Website permissions
→ Apps and websites.

## What the connector does

The plugin declares one remote MCP server, `https://mcp.lia.im/instagram`,
run by RIA Systems. It is the only network endpoint the plugin uses; the
plugin runs nothing on your machine.

| Tool | What it does |
| --- | --- |
| `get_account_status` | Connected accounts, granted permissions and which Claude apps have access |
| `list_dm_conversations` | Recent DM conversations, newest first, with the 24-hour reply window |
| `read_dm_conversation` | Up to the last 20 messages of one conversation (a Meta limit) |
| `send_dm_reply` | One text reply to the customer who wrote last |
| `list_recent_posts` | Your recent posts |
| `list_post_comments` | Comments and replies on your posts |
| `reply_to_comment` | One public reply to a comment |
| `send_private_reply` | One DM to a person who commented (once per comment, within 7 days) |
| `hide_comment` | Hides or unhides a comment on your post |

The server reads DMs and comments from Meta's Instagram API when a tool
runs and doesn't keep their content. It keeps your Instagram account ID,
username, granted permissions and the Instagram access token, encrypted,
so it can call Meta for you. Replies go out only within Meta's rules: 24
hours after the customer's last message, up to 1000 bytes, text only, no
links. The skills ask for your approval of the exact text before each send.

## Local channel for developers

Up to v0.3.5 this plugin also ran a local MCP server that received Meta's
webhooks with your own Meta app. That channel is now a separate plugin,
`instagram-local`, for Claude Code:

```
/plugin marketplace add riasistemas/claude-plugins
/plugin install instagram-local@riasistemas
```

Its code and docs live on the [`local` branch](https://github.com/riasistemas/claude-channel-instagram/tree/local).
Credentials saved by earlier versions in `~/.claude/channels/instagram/.env`
keep working there.

## Privacy

See [PRIVACY.md](./PRIVACY.md).

## License

Apache-2.0.

## Maintainer

Maintained by [RIA Systems](https://github.com/riasistemas). Not affiliated
with or endorsed by Meta or Anthropic. Instagram is a trademark of Meta
Platforms, Inc. Issues and pull requests are welcome in the
[repository](https://github.com/riasistemas/claude-channel-instagram).
