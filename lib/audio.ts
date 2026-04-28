/**
 * Audio transcription helpers (Groq Whisper).
 *
 * Public plugin keeps a tiny dependency-free wrapper. If `GROQ_API_KEY` is
 * not set, transcription is skipped silently — the plugin still surfaces
 * the audio file path so the user / extension can decide what to do.
 */

import { readFileSync } from 'fs'
import { extname } from 'path'

const ENDPOINT = 'https://api.groq.com/openai/v1/audio/transcriptions'
const DEFAULT_MODEL = 'whisper-large-v3'

const MIME_BY_EXT: Record<string, string> = {
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.webm': 'audio/webm',
}

export interface TranscribeOptions {
  apiKey: string
  language?: string
  model?: string
  /** Hard cap on file size — defaults to Groq's 25 MB cap. */
  maxBytes?: number
}

/**
 * Transcribe an audio file at `path`. Returns trimmed text or null when:
 *  - the api key is missing
 *  - the file is too big (Groq rejects > ~25MB)
 *  - the API returns an error (logged via the supplied logger but never thrown)
 */
export async function transcribeAudioFile(
  path: string,
  opts: TranscribeOptions,
  logger?: (msg: string) => void,
): Promise<string | null> {
  if (!opts.apiKey) return null
  let buf: Buffer
  try {
    buf = readFileSync(path)
  } catch (err) {
    logger?.(`audio: failed to read ${path}: ${err}`)
    return null
  }

  const cap = opts.maxBytes ?? 25 * 1024 * 1024
  if (buf.byteLength > cap) {
    logger?.(`audio: ${path} too large (${buf.byteLength}b > ${cap}b) — skipping transcription`)
    return null
  }

  const ext = extname(path).toLowerCase()
  const mime = MIME_BY_EXT[ext] ?? 'audio/ogg'
  const blob = new Blob([buf], { type: mime })
  const form = new FormData()
  form.append('file', blob, `audio${ext || '.ogg'}`)
  form.append('model', opts.model ?? DEFAULT_MODEL)
  if (opts.language) form.append('language', opts.language)

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${opts.apiKey}` },
      body: form,
    })
    const data = (await res.json()) as { text?: string; error?: { message?: string } }
    if (data.error) {
      logger?.(`audio: groq error ${data.error.message}`)
      return null
    }
    return (data.text ?? '').trim() || null
  } catch (err) {
    logger?.(`audio: transcription request failed: ${err}`)
    return null
  }
}
