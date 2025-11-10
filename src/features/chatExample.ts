import { ollamaClient } from '../clients/ollamaClient'

const DEFAULT_MODEL = 'gpt-oss:120b'

export async function streamChat(prompt: string, model = DEFAULT_MODEL): Promise<void> {
    const response = await ollamaClient.chat({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
    })

    for await (const part of response) {
        const chunk = part.message?.content
        if (chunk) {
            process.stdout.write(chunk)
        }
    }

    process.stdout.write('\n')
}
