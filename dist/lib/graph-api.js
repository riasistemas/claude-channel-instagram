/**
 * Instagram API client (read + reply to comments).
 *
 * Uses the Instagram Login API base (`graph.instagram.com`) by default,
 * which is what tokens issued via Instagram Login are scoped to. Set
 * `INSTAGRAM_API_BASE=https://graph.facebook.com/v24.0` if you generated
 * your token through the older Facebook Login → Page flow.
 *
 * Reference:
 *  - https://developers.facebook.com/docs/instagram-platform/instagram-graph-api
 *  - https://developers.facebook.com/docs/instagram-platform
 *
 * Permissions required (Instagram Business):
 *  - instagram_business_basic            (account info, media listing)
 *  - instagram_business_manage_comments  (read + reply + delete)
 */
import { readFileSync, writeFileSync } from 'fs';
const GRAPH_API_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION ?? 'v24.0';
const API = process.env.INSTAGRAM_API_BASE ?? `https://graph.instagram.com/${GRAPH_API_VERSION}`;
export class GraphApiError extends Error {
    code;
    fbtrace_id;
    constructor(code, message, fbtrace_id) {
        super(message);
        this.code = code;
        this.fbtrace_id = fbtrace_id;
        this.name = 'GraphApiError';
    }
}
async function call(url, init) {
    const res = await fetch(url, init);
    const data = (await res.json());
    if (data.error) {
        throw new GraphApiError(data.error.code, data.error.message ?? 'Unknown error', data.error.fbtrace_id);
    }
    return data;
}
/** Fetch account profile info for the configured Instagram Business account. */
export async function getAccountInfo(igAccountId, accessToken) {
    const fields = 'id,username,name,followers_count,media_count,profile_picture_url';
    return call(`${API}/${igAccountId}?fields=${fields}&access_token=${accessToken}`);
}
/** List recent media (posts, Reels, carousels) for the account. */
export async function listRecentMedia(igAccountId, accessToken, limit = 20) {
    const fields = 'id,caption,media_type,media_url,permalink,timestamp,comments_count,like_count';
    const data = await call(`${API}/${igAccountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`);
    return data.data ?? [];
}
/** List comments on a specific media (post / Reel). Includes nested replies. */
export async function listComments(mediaId, accessToken, limit = 50) {
    const fields = 'id,text,username,timestamp,user,like_count,hidden,parent_id';
    const data = await call(`${API}/${mediaId}/comments?fields=${fields}&limit=${limit}&access_token=${accessToken}`);
    return data.data ?? [];
}
/** Reply to a specific comment. Returns the new comment id. */
export async function replyToComment(commentId, message, accessToken) {
    const body = new URLSearchParams({ message, access_token: accessToken });
    return call(`${API}/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
}
/** Delete a comment (must be on media owned by the IG account). */
export async function deleteComment(commentId, accessToken) {
    return call(`${API}/${commentId}?access_token=${accessToken}`, { method: 'DELETE' });
}
/** Hide or show a comment publicly. */
export async function setCommentHidden(commentId, hide, accessToken) {
    const body = new URLSearchParams({ hide: String(hide), access_token: accessToken });
    return call(`${API}/${commentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
}
/** Fetch a single comment with full context (parent media, parent comment if any). */
export async function getComment(commentId, accessToken) {
    const fields = 'id,text,username,timestamp,user,like_count,hidden,parent_id,media{id,permalink}';
    return call(`${API}/${commentId}?fields=${fields}&access_token=${accessToken}`);
}
/**
 * Send a Direct Message to an Instagram user inside the standard 24h window.
 * `recipientId` is the user's IG-scoped user id, captured from inbound DM
 * webhooks (`messaging.sender.id`). For follow-ups outside 24h, pass
 * `tag: 'HUMAN_AGENT'` (extends to 7 days, only for genuine human responses).
 */
export async function sendDm(igAccountId, recipientId, body, accessToken, opts = {}) {
    // The Graph API maps our `body.attachment.payload` to its own envelope.
    let messagePayload;
    if (body.attachment) {
        messagePayload = {
            attachment: {
                type: body.attachment.type,
                payload: body.attachment.payload,
            },
        };
    }
    else {
        messagePayload = { text: body.text ?? '' };
    }
    const payload = {
        recipient: { id: recipientId },
        message: messagePayload,
    };
    if (opts.tag) {
        payload.messaging_type = 'MESSAGE_TAG';
        payload.tag = opts.tag;
    }
    return call(`${API}/${igAccountId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
    });
}
/**
 * Upload a media file (image/audio/video) via the message_attachments
 * endpoint and get back a reusable attachment id. Sending DMs by
 * attachment_id avoids the "public URL must be reachable" requirement
 * entirely — Meta hosts the bytes itself.
 *
 * Per Meta docs, `is_reusable=true` keeps the asset available for repeat
 * sends. Files must be under 25MB and use a supported mime (image/jpeg,
 * image/png, audio/aac, audio/mpeg, audio/ogg, audio/mp4, video/mp4).
 */
export async function uploadMessageAttachment(igAccountId, filePath, type, contentType, accessToken) {
    const blob = new Blob([readFileSync(filePath)], { type: contentType });
    const form = new FormData();
    form.append('message', JSON.stringify({
        attachment: { type, payload: { is_reusable: true } },
    }));
    form.append('filedata', blob, filePath.split('/').pop() ?? 'file');
    const res = await fetch(`${API}/${igAccountId}/message_attachments?access_token=${accessToken}`, {
        method: 'POST',
        body: form,
    });
    const data = (await res.json());
    if (data.error) {
        throw new GraphApiError(data.error.code, data.error.message ?? 'upload failed');
    }
    if (!data.attachment_id) {
        throw new GraphApiError(undefined, 'upload returned no attachment_id');
    }
    return { attachment_id: data.attachment_id };
}
/**
 * Reply privately to a public comment (the "comment-to-DM" flow). Opens a
 * DM thread with the comment author even if they have never DM'd before.
 *
 *  - One private reply per comment (Meta engine limit).
 *  - 7-day window from when the comment was posted.
 *  - Token must have `instagram_manage_messages`.
 */
export async function sendPrivateReply(igAccountId, commentId, body, accessToken) {
    const payload = {
        recipient: { comment_id: commentId },
        message: body,
    };
    return call(`${API}/${igAccountId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
    });
}
/**
 * Resolve an Instagram-scoped user id (from a DM webhook's `sender.id`) into
 * `username`/`name`. Some IG accounts hide profile fields — the function
 * returns whatever Meta exposes, possibly only `id`.
 */
export async function resolveUserProfile(userId, accessToken) {
    try {
        const data = await call(`${API}/${userId}?fields=username,name&access_token=${accessToken}`);
        return { id: userId, username: data.username, name: data.name };
    }
    catch {
        return { id: userId };
    }
}
/**
 * Download a webhook attachment (image/audio/video) to disk. The webhook
 * gives us a temporary signed URL that expires within hours — call this
 * synchronously when the inbound message arrives.
 */
export async function downloadAttachment(url, destPath) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new GraphApiError(res.status, `attachment download failed: ${res.status} ${res.statusText}`);
    }
    const contentType = res.headers.get('content-type') ?? undefined;
    const buf = await res.arrayBuffer();
    writeFileSync(destPath, Buffer.from(buf));
    return { size: buf.byteLength, contentType };
}
/**
 * Look up a public Instagram Business or Creator account's profile by username.
 * Returns `null` for personal accounts or unknown handles (Meta refuses to
 * expose them through this endpoint by design).
 *
 * `igAccountId` is your own Instagram Business account id — Meta requires
 * an authenticated requester to scope the lookup.
 */
export async function getBusinessDiscovery(igAccountId, username, accessToken) {
    const fields = 'username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url,ig_id';
    const url = `${API}/${igAccountId}?fields=business_discovery.username(${encodeURIComponent(username)}){${fields}}&access_token=${accessToken}`;
    try {
        const data = await call(url);
        return data.business_discovery ?? null;
    }
    catch (err) {
        if (err instanceof GraphApiError && (err.code === 110 || err.code === 24 || err.code === 10 || err.code === 100)) {
            // 110: object does not exist (personal account / wrong handle)
            // 24:  business_discovery rate-limited or scope denied
            // 10:  app lacks Advanced Access for instagram_basic / business_discovery
            // 100: invalid parameter (private profile, deactivated, etc.)
            return null;
        }
        throw err;
    }
}
