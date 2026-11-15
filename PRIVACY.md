# Privacy Policy

Last updated: 2026-11-15

This policy describes how the **`instagram` plugin** (the "plugin") and the
Instagram connector it uses (the "connector") handle data. It applies to
anyone who installs and uses the plugin on claude.ai, the Claude desktop and
mobile apps, Cowork or Claude Code.

The plugin is open-source software distributed under Apache-2.0. The plugin
and the connector are maintained by RIA SYSTEMS LTDA ("RIA Systems").

## TL;DR

- The plugin is a set of instructions (skills) for Claude plus the address
  of one remote server, the connector at `https://mcp.lia.im/instagram`.
  It runs nothing on your machine.
- If you don't connect Instagram, nothing leaves your Claude conversation:
  what you paste is processed by Anthropic under the terms and privacy
  policy of your Claude account.
- If you connect Instagram, the connector keeps your account ID, username,
  granted permissions and an encrypted Instagram access token, and reads
  DMs and comments from Meta only when a tool runs. It doesn't store their
  content.

## Without the connector

When you use `/instagram:inbox` with a pasted conversation or screenshot,
it stays in that Claude conversation. The plugin doesn't send it anywhere
else, doesn't log in to Instagram and doesn't call Meta's APIs.

## With the connector

You connect by signing in with Instagram from Claude, through RIA Systems'
Meta app "RIA Social". You choose which permissions to grant.

**What the connector stores**

- Your Instagram professional account ID and username, and the permissions
  you granted.
- The Instagram access token Meta issues, encrypted with a key used only by
  the connector, so it can call Meta on your behalf.
- A record of each Claude app you authorized (when it connected and was
  last used), so you can see and revoke access.
- Short-lived technical data to enforce Meta's sending limits and avoid
  duplicate sends.

**What it reads and doesn't keep**

DMs, comments, post captions and the names of the people who wrote them
are fetched from Meta's Instagram API when a tool runs, passed to your
Claude conversation and not stored by the connector. They are not written
to the connector's logs.

**What it sends**

Only replies, private replies or hide/unhide actions that a tool call
makes, which the skills ask you to approve first. Meta's rules apply: 24
hours after the customer's last message, up to 1000 bytes, text only.

**Who else receives data**

- Meta, which runs Instagram and its API, under Meta's own terms.
- Anthropic, which runs Claude: tool results become part of your Claude
  conversation under the terms and privacy policy of your Claude account.

RIA Systems doesn't sell this data or use it for advertising.

**Disconnecting and deletion**

Disconnecting the connector in Claude's connector or `/mcp` settings revokes
Claude's access. Removing "RIA Social" under Instagram → Settings → Website
permissions → Apps and websites also revokes Meta's access. To have the
stored data deleted, write to the privacy address below.

## Other people's data

Instagram conversations and comments hold other people's personal data.
Only connect an account you manage, and only paste what you're allowed to
share. The skills ask Claude not to repeat more of it than a reply needs.

## What else RIA Systems can see

The plugin has no telemetry, error reporting or analytics. Anthropic's
directory shows us aggregate usage figures (such as installs and how often
each skill runs), which don't include the content of your conversations.

If you open an issue or pull request on the
[GitHub repository](https://github.com/riasistemas/claude-channel-instagram),
what you choose to share there is processed by GitHub under
[GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement).

## Children

The plugin is meant for businesses and adults. It is not directed to anyone
under 18.

## Changes to this policy

Changes are tracked in the repository's git history, and the date at the top
reflects the latest one.

## Contact

RIA SYSTEMS LTDA, CNPJ 50.936.395/0001-07, São Paulo, Brazil.

- Privacy: privacidade@riasistemas.com.br
- GitHub Issues: https://github.com/riasistemas/claude-channel-instagram/issues
