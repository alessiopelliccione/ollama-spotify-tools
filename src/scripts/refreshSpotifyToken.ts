import { stdout, stderr } from 'node:process'

import { env } from '../config/env'
import { persistSpotifyTokens, refreshAccessTokenWith } from '../auth/tokenManager'

async function main() {
    const refreshToken = env.spotifyRefreshToken
    if (!refreshToken) {
        throw new Error('SPOTIFY_REFRESH_TOKEN is not set. Run npm run auth:token first.')
    }

    stdout.write('[spotify] Refreshing access token...\n')
    const tokens = await refreshAccessTokenWith(refreshToken)
    persistSpotifyTokens(tokens)

    stdout.write(`access_token: ${tokens.accessToken}\n`)
    if (tokens.refreshToken) {
        stdout.write(`refresh_token: ${tokens.refreshToken}\n`)
    }
    stdout.write(`expires_in: ${tokens.expiresIn} seconds\n`)
    stdout.write('\nTokens saved to .env.local and environment variables.\n')
}

main().catch((error) => {
    stderr.write(`Failed to refresh access token: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
})
