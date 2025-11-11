import { authenticateSpotifyClient } from '../../clients/spotifyClient'
import type { ToolHandler } from '../types'

// TODO: Refactor duplicated code across modules
/**
 * Runtime implementations for each Spotify tool definition. Handlers return structured
 * payloads that the LLM can reason about, including serialized errors when operations fail.
 */
export const spotifyToolHandlers: Record<string, ToolHandler> = {
    get_spotify_me: async (_args) => {
        const spotify = await authenticateSpotifyClient()
        try {
            const response = await spotify.getMe()
            return {
                user: response.body,
                fetchedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                error: error,
                fetchedAt: new Date().toISOString(),
            }
        }
    },
    get_spotify_current_playback: async (_args) => {
        const spotify = await authenticateSpotifyClient()
        try {
            const { body } = await spotify.getMyCurrentPlayingTrack()
            return {
                info: body,
                fetchedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                error: error,
                fetchedAt: new Date().toISOString(),
            }
        }
    },
    pause_spotify_playback: async (args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()
        try {
            await spotify.pause({ device_id: deviceId })
            return {
                status: 'paused',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                deviceId,
                error: error,
                completedAt: new Date().toISOString(),
            }
        }
    },
    skip_spotify_next: async (args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()
        try {
            await spotify.skipToNext({ device_id: deviceId })
            return {
                status: 'skipped',
                direction: 'next',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                direction: 'next',
                deviceId,
                error: error,
                completedAt: new Date().toISOString(),
            }
        }
    },
    skip_spotify_previous: async (args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()
        try {
            await spotify.skipToPrevious({ device_id: deviceId })
            return {
                status: 'skipped',
                direction: 'previous',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                direction: 'previous',
                deviceId,
                error: error,
                completedAt: new Date().toISOString(),
            }
        }
    },
    resume_spotify_playback: async (args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()
        try {
            await spotify.play({ device_id: deviceId })
            return {
                status: 'playing',
                deviceId,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                deviceId,
                error: error,
                completedAt: new Date().toISOString(),
            }
        }
    },
    search_spotify_tracks: async (args) => {
        const query = typeof args.query === 'string' ? args.query.trim() : ''
        if (!query) {
            return {
                status: 'failed',
                error: 'The "query" argument must be a non-empty string.',
                completedAt: new Date().toISOString(),
            }
        }

        const spotify = await authenticateSpotifyClient()
        try {
            const { body } = await spotify.searchTracks(query)
            return {
                status: 'ok',
                results: body,
                fetchedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                error: error,
                fetchedAt: new Date().toISOString(),
            }
        }
    },
    play_spotify_track_by_query: async (args) => {
        const query = typeof args.query === 'string' ? args.query.trim() : ''
        if (!query) {
            return {
                status: 'failed',
                error: 'The "query" argument must be a non-empty string.',
                completedAt: new Date().toISOString(),
            }
        }

        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
        const spotify = await authenticateSpotifyClient()

        try {
            const { body } = await spotify.searchTracks(query);

            const tracks = body.tracks?.items ?? []
            const selectedTrack = tracks[0]

            if (!selectedTrack) {
                return {
                    status: 'no_match',
                    query,
                    deviceId,
                    fetchedAt: new Date().toISOString(),
                }
            }

            const trackUri = selectedTrack.uri ?? (selectedTrack.id ? `spotify:track:${selectedTrack.id}` : undefined)
            if (!trackUri) {
                return {
                    status: 'failed',
                    query,
                    deviceId,
                    error: 'Matched track does not expose a URI.',
                    fetchedAt: new Date().toISOString(),
                }
            }

            await spotify.play({
                device_id: deviceId,
                uris: [trackUri],
            })

            return {
                status: 'playing',
                query,
                deviceId,
                matchedTrack: selectedTrack,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                query,
                deviceId,
                error: error,
                completedAt: new Date().toISOString(),
            }
        }
    },
}
