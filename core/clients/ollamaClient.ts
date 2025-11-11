import { Ollama } from 'ollama'

import { env } from '../config/env'

const headers = env.ollamaApiKey
    ? { Authorization: `Bearer ${env.ollamaApiKey}` }
    : undefined

/**
 * Shared Ollama client configured with the CLI/API host and optional API key so every
 * module interacts with the same HTTP connection pool.
 */
export const ollamaClient = new Ollama({
    host: env.ollamaHost,
    headers,
})
