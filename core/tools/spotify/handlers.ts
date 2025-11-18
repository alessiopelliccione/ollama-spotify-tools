import type { ToolHandler } from '../types'
import { withSpotifyClient } from "./helpers";

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
    get_spotify_recommendations: withSpotifyClient(async (spotify, args) => {
        // Validate that at least one seed is provided
        const seedGenres = Array.isArray(args.seed_genres) ? args.seed_genres : []
        const seedTracks = Array.isArray(args.seed_tracks) ? args.seed_tracks : []
        const seedArtists = Array.isArray(args.seed_artists) ? args.seed_artists : []

        if (seedGenres.length === 0 && seedTracks.length === 0 && seedArtists.length === 0) {
            return {
                status: 'failed',
                error: 'At least one seed (seed_genres, seed_tracks, or seed_artists) must be provided.',
                completedAt: new Date().toISOString(),
            }
        }

        // Build options object with all provided parameters
        const options: any = {}

        if (seedGenres.length > 0) options.seed_genres = seedGenres
        if (seedTracks.length > 0) options.seed_tracks = seedTracks
        if (seedArtists.length > 0) options.seed_artists = seedArtists

        // Add tunable track attributes if provided
        if (typeof args.target_valence === 'number') options.target_valence = args.target_valence
        if (typeof args.target_energy === 'number') options.target_energy = args.target_energy
        if (typeof args.target_danceability === 'number') options.target_danceability = args.target_danceability
        if (typeof args.target_acousticness === 'number') options.target_acousticness = args.target_acousticness
        if (typeof args.target_instrumentalness === 'number') options.target_instrumentalness = args.target_instrumentalness
        if (typeof args.target_tempo === 'number') options.target_tempo = args.target_tempo
        if (typeof args.limit === 'number') options.limit = args.limit

        try {
            const { body } = await spotify.getRecommendations(options)
            return {
                status: 'ok',
                recommendations: body.tracks,
                seeds: body.seeds,
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
    create_spotify_playlist: withSpotifyClient(async (spotify, args) => {
        const name = typeof args.name === 'string' ? args.name.trim() : ''
        if (!name) {
            return {
                status: 'failed',
                error: 'The "name" argument must be a non-empty string.',
                completedAt: new Date().toISOString(),
            }
        }

        const description = typeof args.description === 'string' ? args.description : undefined
        const isPublic = typeof args.public === 'boolean' ? args.public : false

        try {
            // Create the playlist (no need to get user ID in v5)
            const { body: playlist } = await spotify.createPlaylist(name, {
                description,
                public: isPublic,
            })

            return {
                status: 'created',
                playlist: {
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description,
                    public: playlist.public,
                    external_urls: playlist.external_urls,
                    uri: playlist.uri,
                },
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                error: error,
                completedAt: new Date().toISOString(),
            }
        }
    }),
    add_tracks_to_playlist: withSpotifyClient(async (spotify, args) => {
        const playlistId = typeof args.playlistId === 'string' ? args.playlistId.trim() : ''
        if (!playlistId) {
            return {
                status: 'failed',
                error: 'The "playlistId" argument must be a non-empty string.',
                completedAt: new Date().toISOString(),
            }
        }

        const trackUris = Array.isArray(args.trackUris) ? args.trackUris : []
        if (trackUris.length === 0) {
            return {
                status: 'failed',
                error: 'The "trackUris" argument must be a non-empty array.',
                completedAt: new Date().toISOString(),
            }
        }

        // Validate track URI format
        const validUris = trackUris.filter((uri: any) =>
            typeof uri === 'string' && uri.startsWith('spotify:track:')
        )

        if (validUris.length === 0) {
            return {
                status: 'failed',
                error: 'No valid Spotify track URIs found. URIs must start with "spotify:track:".',
                completedAt: new Date().toISOString(),
            }
        }

        try {
            const { body } = await spotify.addTracksToPlaylist(playlistId, validUris)
            return {
                status: 'added',
                playlistId,
                tracksAdded: validUris.length,
                snapshotId: body.snapshot_id,
                completedAt: new Date().toISOString(),
            }
        } catch (error) {
            return {
                status: 'failed',
                playlistId,
                error: error,
                completedAt: new Date().toISOString(),
            }
        }
    }),
}
