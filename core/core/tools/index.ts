import type { Tool, ToolCall } from 'ollama'

import { spotifyToolDefinitions } from './spotify/definitions'
import { spotifyToolHandlers } from './spotify/handlers'
import type { ToolHandler, ToolModule } from './types'

/**
 * Domains that contribute tool definitions + handlers to the runtime. Extend this list to
 * onboard additional providers.
 */
const toolModules: ToolModule[] = [
    {
        definitions: spotifyToolDefinitions,
        handlers: spotifyToolHandlers,
    },
]

/**
 * Flattened view of every tool schema exposed to the LLM.
 */
export const toolDefinitions: Tool[] = toolModules.flatMap((toolset) => toolset.definitions)

const toolHandlers: Record<string, ToolHandler> = {}
for (const module of toolModules) {
    for (const [name, handler] of Object.entries(module.handlers)) {
        if (toolHandlers[name]) {
            throw new Error(`Duplicate handler registered for tool ${name}`)
        }
        toolHandlers[name] = handler
    }
}

/**
 * Execute an Ollama tool call by routing it to the corresponding handler.
 */
export async function executeToolCall(call: ToolCall): Promise<unknown> {
    const name = call.function.name
    const handler = toolHandlers[name]

    if (!handler) {
        throw new Error(`No handler registered for tool ${name}`)
    }

    return handler(call.function.arguments ?? {})
}
