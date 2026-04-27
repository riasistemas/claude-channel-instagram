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

const GRAPH_API_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION ?? 'v24.0'
const API = process.env.INSTAGRAM_API_BASE ?? `https://graph.instagram.com/${GRAPH_API_VERSION}`

export interface AccountInfo {
  id: string
  username: string
  name?: string
  followers_count?: number
  media_count?: number
  profile_picture_url?: string
}

export interface Comment {
  id: string
  text: string
  username: string
  timestamp: string
  user?: { id: string }
  like_count?: number
  hidden?: boolean
  parent_id?: string
  media?: { id: string; permalink?: string }
}

export interface MediaItem {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS'
  media_url?: string
  permalink: string
  timestamp: string
  comments_count?: number
  like_count?: number
}

export class GraphApiError extends Error {
  constructor(public code: number | undefined, message: string, public fbtrace_id?: string) {
    super(message)
    this.name = 'GraphApiError'
  }
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  const data = (await res.json()) as any
  if (data.error) {
    throw new GraphApiError(data.error.code, data.error.message ?? 'Unknown error', data.error.fbtrace_id)
  }
  return data as T
}

/** Fetch account profile info for the configured Instagram Business account. */
export async function getAccountInfo(igAccountId: string, accessToken: string): Promise<AccountInfo> {
  const fields = 'id,username,name,followers_count,media_count,profile_picture_url'
  return call(`${API}/${igAccountId}?fields=${fields}&access_token=${accessToken}`)
}

/** List recent media (posts, Reels, carousels) for the account. */
export async function listRecentMedia(
  igAccountId: string,
  accessToken: string,
  limit = 20,
): Promise<MediaItem[]> {
  const fields = 'id,caption,media_type,media_url,permalink,timestamp,comments_count,like_count'
  const data = await call<{ data: MediaItem[] }>(
    `${API}/${igAccountId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`,
  )
  return data.data ?? []
}

/** List comments on a specific media (post / Reel). Includes nested replies. */
export async function listComments(
  mediaId: string,
  accessToken: string,
  limit = 50,
): Promise<Comment[]> {
  const fields = 'id,text,username,timestamp,user,like_count,hidden,parent_id'
  const data = await call<{ data: Comment[] }>(
    `${API}/${mediaId}/comments?fields=${fields}&limit=${limit}&access_token=${accessToken}`,
  )
  return data.data ?? []
}

/** Reply to a specific comment. Returns the new comment id. */
export async function replyToComment(
  commentId: string,
  message: string,
  accessToken: string,
): Promise<{ id: string }> {
  const body = new URLSearchParams({ message, access_token: accessToken })
  return call(`${API}/${commentId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

/** Delete a comment (must be on media owned by the IG account). */
export async function deleteComment(commentId: string, accessToken: string): Promise<{ success: boolean }> {
  return call(`${API}/${commentId}?access_token=${accessToken}`, { method: 'DELETE' })
}

/** Hide or show a comment publicly. */
export async function setCommentHidden(
  commentId: string,
  hide: boolean,
  accessToken: string,
): Promise<{ success: boolean }> {
  const body = new URLSearchParams({ hide: String(hide), access_token: accessToken })
  return call(`${API}/${commentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

/** Fetch a single comment with full context (parent media, parent comment if any). */
export async function getComment(commentId: string, accessToken: string): Promise<Comment> {
  const fields = 'id,text,username,timestamp,user,like_count,hidden,parent_id,media{id,permalink}'
  return call(`${API}/${commentId}?fields=${fields}&access_token=${accessToken}`)
}
