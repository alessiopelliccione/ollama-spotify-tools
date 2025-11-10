import { stdout, stderr } from 'node:process'

import { env } from '../config/env'
import { persistSpotifyTokens, refreshAccessTokenWith } from '../auth/tokenManager'

async function main() {
    const refreshToken = env.spotifyRefreshToken
    if (!refreshToken) {
        throw new Error('SPOTIFY_REFRESH_TOKEN is not set. Run npm run auth:token first.')
    }

    const tokens = await refreshAccessTokenWith(refreshToken)
    persistSpotifyTokens(tokens)
}

main().catch((error) => {
    process.exit(1)
})
