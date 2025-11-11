import type { Tool } from 'ollama'

export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>

export type ToolModule = {
    definitions: Tool[]
    handlers: Record<string, ToolHandler>
}
