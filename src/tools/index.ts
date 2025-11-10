import type { Tool, ToolCall } from 'ollama'
import { stdout, stderr } from 'node:process'

import { authenticateSpotifyClient } from '../clients/spotifyClient'

const SPOTIFY_API_BASE = 'https://api.spotify.com'

type SpotifyApiError = {
    statusCode?: number
    body?: unknown
    message?: string
}

function logCurlReplay(method: string, path: string, accessToken: string | null | undefined, body?: Record<string, unknown>) {
    const payload = body && Object.keys(body).length > 0 ? ` -H 'Content-Type: application/json' -d '${JSON.stringify(body)}'` : ''
    const token = accessToken ?? '<token>'
    stdout.write(`[curl] curl -X ${method.toUpperCase()} "${SPOTIFY_API_BASE}${path}" -H 'Authorization: Bearer ${token}'${payload}\n`)
}

function formatSpotifyError(error: unknown): string {
    if (error && typeof error === 'object') {
        const { statusCode, body, message } = error as SpotifyApiError
        const details = typeof body === 'object' && body !== null ? JSON.stringify(body) : body
        return [statusCode && `status=${statusCode}`, message, details]
            .filter(Boolean)
            .join(' | ')
    }
    if (error instanceof Error) {
        return error.message
    }
    return String(error)
}

export const toolDefinitions: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'get_spotify_me',
            description: 'Fetch profile information about the currently authenticated Spotify user',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'pause_spotify_playback',
            description: 'Pause the current Spotify playback for the authenticated user',
            parameters: {
                type: 'object',
                properties: {
                    deviceId: {
                        type: 'string',
                        description: 'Optional device ID. If omitted, Spotify pauses the active device.',
                    },
                },
                required: [],
            },
        },
    },
]

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>

const toolHandlers: Record<string, ToolHandler> = {
    get_spotify_me: async (_args) => {
        const spotify = await authenticateSpotifyClient()
        const path = '/v1/me'
        logCurlReplay('GET', path, spotify.getAccessToken())
        try {
            const response = await spotify.getMe()
            return {
                user: response.body,
                fetchedAt: new Date().toISOString(),
            }
            } catch (error) {
                const message = formatSpotifyError(error)
                stderr.write(`[tool] get_spotify_me failed: ${message}\n`)
            return {
                error: message,
                fetchedAt: new Date().toISOString(),
            }
        }
    },
    pause_spotify_playback: async (args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()
        const path = `/v1/me/player/pause${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`
        logCurlReplay('PUT', path, spotify.getAccessToken())
        try {
            await spotify.pause({ device_id: deviceId })
            return {
                status: 'paused',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            const message = formatSpotifyError(error)
            stderr.write(`[tool] pause_spotify_playback failed: ${message}\n`)
            return {
                status: 'failed',
                deviceId,
                error: message,
                completedAt: new Date().toISOString(),
            }
        }
    },
}

/**
 * Execute an Ollama tool call by routing it to the corresponding Spotify handler.
 */
export async function executeToolCall(call: ToolCall): Promise<unknown> {
    const name = call.function.name
    const handler = toolHandlers[name]

    if (!handler) {
        throw new Error(`No handler registered for tool ${name}`)
    }

    return handler(call.function.arguments ?? {})
}
