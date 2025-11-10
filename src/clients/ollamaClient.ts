import { Ollama } from 'ollama'

import { env } from '../config/env'

const headers = env.ollamaApiKey
    ? { Authorization: `Bearer ${env.ollamaApiKey}` }
    : undefined

export const ollamaClient = new Ollama({
    host: env.ollamaHost,
    headers,
})
