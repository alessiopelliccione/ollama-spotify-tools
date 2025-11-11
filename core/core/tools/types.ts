import type { Tool } from 'ollama'

/**
 * Function signature every tool implementation must follow.
 */
export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>

/**
 * Bundle of definitions plus handler map describing a logical tool domain.
 */
export type ToolModule = {
    definitions: Tool[]
    handlers: Record<string, ToolHandler>
}
