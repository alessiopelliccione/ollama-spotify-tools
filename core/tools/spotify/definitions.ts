import type { Tool } from 'ollama'

/**
 * Spotify tool schemas exposed to the LLM. Each definition mirrors a deterministic playback
 * action that the CLI can service through the Web API.
 */
export const spotifyToolDefinitions: Tool[] = [
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
            name: 'get_spotify_current_playback',
            description: 'Retrieve information about the track currently playing for the user, if any',
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
    {
        type: 'function',
        function: {
            name: 'search_spotify_tracks',
            description:
                'Search Spotify tracks matching a free-text query or advanced field filters (e.g., artist:Love track:Alright)',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search expression that follows the Spotify Search API syntax. Required.',
                    }
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'play_spotify_track_by_query',
            description:
                'Search Spotify for the best-matching track and immediately start playback with that track on the chosen device.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'User utterance describing what to play (song name, artist, etc.). Required.',
                    },
                    deviceId: {
                        type: 'string',
                        description: 'Optional Spotify device ID to target. Defaults to the actively playing device.',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_spotify_recommendations',
            description:
                'Get personalized track recommendations based on seed entities (genres, artists, tracks) and tunable audio features. Use this to discover music matching specific moods, vibes, or characteristics. At least one seed must be provided.',
            parameters: {
                type: 'object',
                properties: {
                    seed_genres: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of genre seeds (e.g., ["lo-fi", "chill", "indie"]). Use getAvailableGenreSeeds to see valid genres.',
                    },
                    seed_tracks: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of Spotify track IDs to use as seeds.',
                    },
                    seed_artists: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of Spotify artist IDs to use as seeds.',
                    },
                    target_valence: {
                        type: 'number',
                        description: 'Target valence (0.0-1.0). Low values = sad/melancholic, high values = happy/cheerful.',
                    },
                    target_energy: {
                        type: 'number',
                        description: 'Target energy level (0.0-1.0). Low = calm/relaxed, high = intense/energetic.',
                    },
                    target_danceability: {
                        type: 'number',
                        description: 'Target danceability (0.0-1.0). How suitable the track is for dancing.',
                    },
                    target_acousticness: {
                        type: 'number',
                        description: 'Target acousticness (0.0-1.0). Confidence measure of whether the track is acoustic.',
                    },
                    target_instrumentalness: {
                        type: 'number',
                        description: 'Target instrumentalness (0.0-1.0). Predicts whether a track contains no vocals.',
                    },
                    target_tempo: {
                        type: 'number',
                        description: 'Target tempo in BPM (beats per minute).',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of recommendations to return (1-100). Default is 20.',
                    },
                },
                required: [],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_spotify_playlist',
            description:
                'Create a new Spotify playlist for the authenticated user. Returns the playlist ID which can be used to add tracks.',
            parameters: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Name of the playlist. Required.',
                    },
                    description: {
                        type: 'string',
                        description: 'Optional description for the playlist.',
                    },
                    public: {
                        type: 'boolean',
                        description: 'Whether the playlist should be public. Default is false (private).',
                    },
                },
                required: ['name'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'add_tracks_to_playlist',
            description:
                'Add one or more tracks to an existing Spotify playlist. Track URIs must be in the format "spotify:track:xxxxx".',
            parameters: {
                type: 'object',
                properties: {
                    playlistId: {
                        type: 'string',
                        description: 'Spotify playlist ID where tracks will be added. Required.',
                    },
                    trackUris: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Array of Spotify track URIs (e.g., ["spotify:track:xxxxx", "spotify:track:yyyyy"]). Required.',
                    },
                },
                required: ['playlistId', 'trackUris'],
            },
        },
    },
]
