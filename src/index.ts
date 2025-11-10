import { runChatWithTools } from './features/chatExample'

async function main() {
    await runChatWithTools("Com'e il tempo oggi a Barcellona?")
}

main().catch((error) => {
    console.error('Failed to run chat example:', error)
    process.exit(1)
})
