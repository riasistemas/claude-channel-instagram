---
name: inbox
description: Draft replies to Instagram DMs and comments that the user pastes as text or a screenshot, with a short read of the lead and a suggested next step. Use when the user pastes an Instagram conversation or comment, shares a screenshot of their Instagram inbox, or asks how to answer a follower or customer on Instagram.
user-invocable: true
---

# /instagram:inbox — draft Instagram replies

The user brings a conversation from their Instagram inbox; you draft the
reply they will send themselves. This skill has no Instagram tools: it never
reads the account and never sends anything.

Arguments passed: `$ARGUMENTS`

## 1. Get the conversation

- Use what the user pasted: text, a screenshot, or several screenshots in
  order. If `$ARGUMENTS` is empty and nothing is pasted, ask them to paste
  the conversation or a screenshot of it, and stop there.
- In Claude Code, a file path to a screenshot is fine; read the file.
- Never ask for the Instagram password, a Meta token, an app secret or a
  login code. If the user pastes one, tell them not to share it in a chat,
  suggest revoking it in Meta, and don't repeat or store it.

## 2. Read it

Work out, without writing it all out:

- Who is writing (a customer, a lead, a partner, a friend, spam) and what
  they want.
- Where the conversation stands: first contact, a question waiting for an
  answer, an objection, ready to buy, or gone cold.
- The language and tone they use. Reply in the same language.
- For a comment: whether a short public reply is enough or the topic should
  move to DMs (price, personal data, a complaint).

If it looks like a scam or phishing (fake "account verification", a login
link, a request for codes), say so and don't draft a reply.

## 3. Draft the reply

- Write the message ready to copy, in the user's voice. If you know their
  brand, tone or offer from the conversation, their instructions or project
  files, use it; otherwise keep a friendly, plain tone.
- Short: one to three sentences per message, plain text, no markdown, at
  most one emoji and only if the customer uses them.
- Don't make up facts about the business. Where a price, date, address or
  policy is needed and you don't know it, leave a bracketed placeholder such
  as `[price]` and tell the user what to fill in.
- End with one clear question or next step, not several.
- For a public comment: one short public reply. If the topic belongs in
  DMs, add the DM opener as a second draft.
- Offer one alternative only when there is a real choice (for example, a
  direct answer versus a qualifying question).

## 4. Lead read and next step

After the draft, add two or three short lines:

- **Lead:** what they want, how warm they are, and what is still unknown
  (budget, timing, who decides).
- **Next step:** what the user should do after sending (wait for the answer,
  offer a call, send a link, follow up in a day).
- **Heads-up**, only when it applies: Meta lets business tools send a
  free-form DM only within 24 hours of the customer's last message, so a
  reply sent through an automation tool after that window fails. Replying by
  hand in the Instagram app isn't limited by it.

## 5. Don'ts

- Don't say or imply that you sent, scheduled or posted anything.
- Don't copy more personal data from the screenshot than the reply needs.
- Don't bring up other products or services unless the user asks. If they
  ask whether this can read or send DMs by itself, point them to
  `/instagram:configure`.
