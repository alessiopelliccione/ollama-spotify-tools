import { ensureSpotifyUserTokens } from './auth/interactiveAuth'
import { runChatWithTools } from './features/chatExample'

async function main() {
    await ensureSpotifyUserTokens()
    console.log('[app] Spotify authentication ready, starting chat...')
    await runChatWithTools('Metti in pausa il mio spotify')
}

main().catch((error) => {
    console.error('Failed to run chat example:', error)
    process.exit(1)
})
