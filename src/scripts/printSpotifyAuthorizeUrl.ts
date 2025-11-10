import { stdout, stderr } from 'node:process'

import { createSpotifyAuthorizeUrl } from '../auth/spotifyAuthorization'

async function main() {
    const { url, scopes, state } = createSpotifyAuthorizeUrl()
    stdout.write('Spotify authorization URL:\n')
    stdout.write(`${url}\n`)
    stdout.write(`\nScopes: ${scopes.join(', ')}\n`)
    stdout.write(`State: ${state}\n`)
}

main().catch((error) => {
    stderr.write(`Failed to generate Spotify authorization URL: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
})
