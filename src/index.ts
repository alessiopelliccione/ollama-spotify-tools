import { streamChat } from './features/chatExample'

async function main() {
    await streamChat('Explain quantum computing')
}

main().catch((error) => {
    console.error('Failed to run chat example:', error)
    process.exit(1)
})
