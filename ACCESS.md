# Instagram — Access & Delivery

An Instagram Business account is publicly addressable: anyone can comment on your posts. Without a gate, every public comment would flow into your Claude Code session. The access model described here decides which comments come through.

By default, the channel uses **`allowlist`** mode: comments from usernames not in `allowFrom` are dropped silently. You add usernames explicitly with `/instagram-local:access allow <username>` from your assistant session.

If you'd rather have every comment forwarded (e.g. on a small account where you want to triage everything), flip to **`open`** — every comment passes through, regardless of author. Combine with `mediaWhitelist` to scope to specific posts, or with `mentionPatterns` to only forward comments that match certain regexes.

All state lives in `~/.claude/channels/instagram/access.json`. The `/instagram-local:access` skill commands edit this file; the server re-reads it on every inbound comment, so changes take effect immediately.

## At a glance

| | |
| --- | --- |
| Default policy | `allowlist` |
| Sender ID | Instagram username (no `@`) |
| Inbound transport | Meta webhook → HTTP receiver (HMAC-SHA256) |
| Outbound transport | Instagram Graph API |
| Config file | `~/.claude/channels/instagram/access.json` |

## Policies

| Policy | Behavior |
| --- | --- |
| `allowlist` (default) | Drop silently. No reply. Cheapest option — costs zero outbound calls. Recommended when you want a curated set of accounts reaching you. |
| `open` | Every comment passes through. Useful on small accounts or test setups; risky on accounts with many followers. |
| `disabled` | Drop everything, including allowlisted users. Use to mute the channel without uninstalling. |

```
/instagram-local:access policy allowlist
```

## Usernames

Usernames are stored as digit-only strings without `@`. Examples:

```
/instagram-local:access allow briefing.juridico
/instagram-local:access allow some_user_123
/instagram-local:access remove some_user_123
```

The match is case-insensitive against the `username` field of the inbound webhook. Instagram allows users to change usernames over time — the allowlist will not auto-follow renames.

## Media whitelist

Sometimes you only want comments on certain posts to reach you (e.g. a post you specifically want feedback on, while ignoring unrelated comments on older posts). Add media ids:

```
/instagram-local:access set mediaWhitelist '["17951102274078000", "18108695863648615"]'
```

Empty list (default) means **all media** are in scope.

## Mention detection

If `mentionPatterns` is non-empty, comments matching any regex pass through **regardless of allowlist**. Useful for "anyone who tags me with `#help`":

```
/instagram-local:access set mentionPatterns '["#help\\b", "@briefing.juridico\\b", "(?i)urgente"]'
```

## Skill reference

| Command | Effect |
| --- | --- |
| `/instagram-local:access` | Print current state: policy, allowlist, mediaWhitelist count, mentionPatterns count. |
| `/instagram-local:access allow <username>` | Add a username to `allowFrom`. |
| `/instagram-local:access remove <username>` | Remove a username. |
| `/instagram-local:access policy <mode>` | Set `policy`: `allowlist`, `open`, or `disabled`. |
| `/instagram-local:access set <key> <value>` | Set a config key: `mediaWhitelist`, `mentionPatterns`. |

## Config file

`~/.claude/channels/instagram/access.json`. Absent file is equivalent to `allowlist` policy with empty lists.

```jsonc
{
  // Handling for comments from senders not in allowFrom.
  "policy": "allowlist",

  // Usernames (without @) allowed through.
  "allowFrom": ["briefing.juridico"],

  // Optional: only forward comments on these media ids. Empty = all.
  "mediaWhitelist": [],

  // Case-insensitive regexes that count as "directed at the bot".
  // Match overrides the allowlist (passes through).
  "mentionPatterns": ["@briefing\\.juridico\\b", "#help\\b"]
}
```
