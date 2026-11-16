# Privacy Policy

Last updated: 2026-11-16

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
- If you connect Instagram, RIA Systems keeps your account ID, username,
  granted permissions and an encrypted Instagram access token, plus the
  direct messages of the connected accounts, which you agree to on the
  connection screen. Comments are read from Meta only when a tool runs and
  aren't stored.

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
- When and in which version you accepted, for each connected account, that
  its conversations are kept.
- A log of each action Claude took on your behalf (DM sent, comment reply,
  private reply, comment hidden): which account, which tool, when, and the
  Instagram IDs involved. It doesn't include the text.
- The direct messages of each connected account, received and sent,
  including the sender's Instagram-scoped ID, as described below.
- Short-lived technical data to enforce Meta's sending limits and avoid
  duplicate sends.

**Your conversations**

The connection screen tells you that RIA Systems keeps the direct messages
of the connected accounts. Once you accept, Meta delivers each DM the
account receives or sends (from Claude or from the Instagram app) to RIA
Systems, which stores it in your RIA Systems account. It's used to show the
history to Claude and, only if you later turn on Lia's automatic replies
(a separate paid service), so that Lia can answer. Turning that on doesn't
ask you to accept again; the replies themselves only start when you
contract the service. Media files aren't downloaded: only the type of an
attachment is kept.

Comments, post captions and the names of the people who wrote them are
fetched from Meta when a tool runs, passed to your Claude conversation and
not stored. No message or comment content is written to logs.

Conversations are kept while the account stays connected. [PENDING LEGAL
REVIEW: retention period after an account is removed or disconnected.]
You can ask for them to be deleted at any time at the privacy address
below.

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
Claude's access. Removing an account on the connection screen stops it
from being used. Removing "RIA Social" under Instagram → Settings → Website
permissions → Apps and websites also revokes Meta's access. To have the stored data
deleted, including kept conversations, write to the privacy address below.

## Other people's data

Instagram conversations and comments hold other people's personal data.
Only connect an account you manage, and only paste what you're allowed to
share. For the conversations it keeps, RIA Systems processes your
customers' data on your behalf; you remain responsible for having a legal
basis to keep and answer them. The skills ask Claude not to repeat more of it than a reply needs.

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
