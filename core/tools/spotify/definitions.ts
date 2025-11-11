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
]
