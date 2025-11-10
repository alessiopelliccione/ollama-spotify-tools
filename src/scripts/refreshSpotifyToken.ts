import { env } from '../config/env'
import { persistSpotifyTokens, refreshAccessTokenWith } from '../auth/tokenManager'

async function main() {
    const refreshToken = env.spotifyRefreshToken
    if (!refreshToken) {
        throw new Error('SPOTIFY_REFRESH_TOKEN is not set. Run npm run auth:token first.')
    }

    console.log('[spotify] Refreshing access token...')
    const tokens = await refreshAccessTokenWith(refreshToken)
    persistSpotifyTokens(tokens)

    console.log('access_token:', tokens.accessToken)
    if (tokens.refreshToken) {
        console.log('refresh_token:', tokens.refreshToken)
    }
    console.log('expires_in:', tokens.expiresIn, 'seconds')
    console.log('\nTokens saved to .env.local and environment variables.')
}

main().catch((error) => {
    console.error('Failed to refresh access token:', error)
    process.exit(1)
})
