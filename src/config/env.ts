import { config } from 'dotenv'

config()

const DEFAULT_OLLAMA_HOST = 'http://127.0.0.1:11434'
const DEFAULT_SPOTIFY_REDIRECT_URI = 'http://localhost:3000/callback'

function formatMissingEnvMessage(name: string) {
    return `Missing required environment variable ${name}. Add it to your shell or .env file.`
}

/**
 * Retrieve a required environment variable or throw a descriptive error.
 */
export function getRequiredEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(formatMissingEnvMessage(name))
    }
    return value
}

export const env = {
    ollamaHost: process.env.OLLAMA_HOST ?? DEFAULT_OLLAMA_HOST,
    ollamaApiKey: process.env.OLLAMA_API_KEY,
    spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI ?? DEFAULT_SPOTIFY_REDIRECT_URI,
    spotifyAccessToken: process.env.SPOTIFY_ACCESS_TOKEN,
    spotifyRefreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
}
