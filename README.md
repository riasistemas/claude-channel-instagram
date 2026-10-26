# Instagram

A Claude plugin that helps you answer Instagram DMs and comments. Paste a
conversation or a screenshot and Claude drafts the reply in your voice, reads
where the lead stands and suggests the next step. You send the reply yourself.

Works on claude.ai, the Claude desktop and mobile apps, Cowork and Claude
Code. No Instagram login, no Meta app, no tokens.

## Skills

| Skill | What it does |
| --- | --- |
| `/instagram:inbox` | Drafts a reply to a DM or comment you paste (text or screenshot), with a short lead read and a next step. Claude also uses it on its own when you paste an Instagram conversation. |
| `/instagram:configure` | Explains what the plugin does on each Claude app and the options to connect an account. |

Example:

> **You:** /instagram:inbox *(screenshot of a DM: "hi! how much is the
> 3-month plan? does it include the app?")*
>
> **Claude:** a two-sentence reply with a `[price]` placeholder and one
> qualifying question, then: *Lead: warm, asking about price, goal unknown.
> Next step: answer, then offer a 10-minute call.*

## Install

Find "instagram" in the [Claude directory](https://claude.ai/directory) and
add it. A plugin added on claude.ai also loads in Claude Code through
account sync.

In Claude Code you can also install it from RIA Systems' catalog:

```
/plugin marketplace add riasistemas/claude-plugins
/plugin install instagram@riasistemas
```

## Connected version

This plugin doesn't read or send DMs by itself. RIA Systems is building a
connected version where you sign in with Instagram and Claude reads and
answers your DMs. To hear when it opens, join the
[waitlist](https://claude-plugins.riasistemas.com.br/en/instagram#cloud).

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

The plugin has no server, makes no network calls and stores nothing. See
[PRIVACY.md](./PRIVACY.md).

## License

Apache-2.0.

## Maintainer

Maintained by [RIA Systems](https://github.com/riasistemas). Not affiliated
with or endorsed by Meta or Anthropic. Instagram is a trademark of Meta
Platforms, Inc. Issues and pull requests are welcome in the
[repository](https://github.com/riasistemas/claude-channel-instagram).
