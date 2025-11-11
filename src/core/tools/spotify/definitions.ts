import type { Tool } from 'ollama'

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
