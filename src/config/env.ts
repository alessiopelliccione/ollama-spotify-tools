import { config } from 'dotenv'

config()

const DEFAULT_OLLAMA_HOST = 'https://ollama.com'
const DEFAULT_SPOTIFY_REDIRECT_URI = 'http://localhost:3000/callback'

function formatMissingEnvMessage(name: string) {
    return `Missing required environment variable ${name}. Add it to your shell or .env file.`
}

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
}
