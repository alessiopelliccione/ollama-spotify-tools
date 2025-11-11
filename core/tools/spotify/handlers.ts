import type { ToolHandler } from '../types'
import {withSpotifyClient} from "./helpers";

export const spotifyToolHandlers: Record<string, ToolHandler> = {
    get_spotify_me: withSpotifyClient(async (spotify) => {
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
    }),
    get_spotify_current_playback: withSpotifyClient(async (spotify) => {
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
    }),
    pause_spotify_playback: withSpotifyClient(async (spotify, args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
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
    }),
    skip_spotify_next: withSpotifyClient(async (spotify, args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
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
    }),
    skip_spotify_previous: withSpotifyClient(async (spotify, args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
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
    }),
    resume_spotify_playback: withSpotifyClient(async (spotify, args) => {
        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined
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
    }),
    search_spotify_tracks: withSpotifyClient(async (spotify, args) => {
        const query = typeof args.query === 'string' ? args.query.trim() : ''
        if (!query) {
            return {
                status: 'failed',
                error: 'The "query" argument must be a non-empty string.',
                completedAt: new Date().toISOString(),
            }
        }

        try {
            const { body } = await spotify.searchTracks(query)
            return {
                status: 'ok',
                query,
                results: body,
                fetchedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                query,
                error: error,
                fetchedAt: new Date().toISOString(),
            }
        }
    }),
    play_spotify_track_by_query: withSpotifyClient(async (spotify, args) => {
        const query = typeof args.query === 'string' ? args.query.trim() : ''
        if (!query) {
            return {
                status: 'failed',
                error: 'The "query" argument must be a non-empty string.',
                completedAt: new Date().toISOString(),
            }
        }

        const deviceId = typeof args.deviceId === 'string' ? args.deviceId : undefined

        try {
            const { body } = await spotify.searchTracks(query)

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
    }),
}
