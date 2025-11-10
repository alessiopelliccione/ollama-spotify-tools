import type { Tool, ToolCall } from 'ollama'
import { stderr } from 'node:process'

import { authenticateSpotifyClient } from '../clients/spotifyClient'

type SpotifyApiError = {
    statusCode?: number
    body?: unknown
    message?: string
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
    {
        type: 'function',
        function: {
            name: 'skip_spotify_next',
            description: "Skip the user's current Spotify playback to the next track",
            parameters: {
                type: 'object',
                properties: {
                    deviceId: {
                        type: 'string',
                        description: 'Optional device ID. If omitted, Spotify skips on the active device.',
                    },
                },
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'skip_spotify_previous',
            description: "Skip the user's current Spotify playback to the previous track",
            parameters: {
                type: 'object',
                properties: {
                    deviceId: {
                        type: 'string',
                        description: 'Optional device ID. If omitted, Spotify skips on the active device.',
                    },
                },
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'resume_spotify_playback',
            description: "Start or resume the user's Spotify playback",
            parameters: {
                type: 'object',
                properties: {
                    deviceId: {
                        type: 'string',
                        description: 'Optional device ID. If omitted, Spotify resumes the active device.',
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
        try {
            const response = await spotify.getMe()
            return {
                user: response.body,
                fetchedAt: new Date().toISOString(),
            }
            } catch (error) {
                const message = formatSpotifyError(error)
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
        try {
            await spotify.pause({ device_id: deviceId })
            return {
                status: 'paused',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            const message = formatSpotifyError(error)
            return {
                status: 'failed',
                deviceId,
                error: message,
                completedAt: new Date().toISOString(),
            }
        }
    },
    skip_spotify_next: async (args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()
        const path = `/v1/me/player/next${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`
        try {
            await spotify.skipToNext({ device_id: deviceId })
            return {
                status: 'skipped',
                direction: 'next',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            const message = formatSpotifyError(error)
            return {
                status: 'failed',
                direction: 'next',
                deviceId,
                error: message,
                completedAt: new Date().toISOString(),
            }
        }
    },
    skip_spotify_previous: async (args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()
        const path = `/v1/me/player/previous${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`
        try {
            await spotify.skipToPrevious({ device_id: deviceId })
            return {
                status: 'skipped',
                direction: 'previous',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            const message = formatSpotifyError(error)
            return {
                status: 'failed',
                direction: 'previous',
                deviceId,
                error: message,
                completedAt: new Date().toISOString(),
            }
        }
    },
    resume_spotify_playback: async (args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()
        const path = `/v1/me/player/play${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`
        try {
            await spotify.play({ device_id: deviceId })
            return {
                status: 'playing',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            const message = formatSpotifyError(error)
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
