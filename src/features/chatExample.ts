import type { Message } from 'ollama'

import { ollamaClient } from '../clients/ollamaClient'
import { executeToolCall, toolDefinitions } from '../tools'

const DEFAULT_MODEL = 'gpt-oss:120b'

/**
 * Run an Ollama chat loop capable of executing Spotify-related tool calls.
 * The conversation continues until the assistant emits a final message without tool calls.
 */
export async function runChatWithTools(prompt: string, model = DEFAULT_MODEL): Promise<void> {
    const messages: Message[] = [{ role: 'user', content: prompt }]

    while (true) {
        const response = await ollamaClient.chat({
            model,
            messages,
            tools: toolDefinitions,
        })

        const assistantMessage = response.message
        messages.push(assistantMessage)

        if (assistantMessage.tool_calls?.length) {
            for (const call of assistantMessage.tool_calls) {
                try {
                    const result = await executeToolCall(call)
                    messages.push({
                        role: 'tool',
                        tool_name: call.function.name,
                        content: JSON.stringify(result),
                    })
                } catch (error) {
                    const message = error instanceof Error ? error.stack ?? error.message : String(error)
                    process.stderr.write(`[tool] ${call.function.name} failed: ${message}\n`)
                    messages.push({
                        role: 'tool',
                        tool_name: call.function.name,
                        content: JSON.stringify({
                            error: error instanceof Error ? error.message : String(error),
                        }),
                    })
                }
            }
            continue
        }

        if (assistantMessage.content) {
            process.stdout.write(`${assistantMessage.content}\n`)
        }
        break
    }
}
