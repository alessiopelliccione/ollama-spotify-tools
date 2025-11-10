import { env } from '../config/env'
import { exchangeAuthorizationCode, persistSpotifyTokens } from '../auth/tokenManager'

type CliArgs = {
    code: string
    redirectUri?: string
}

function parseArgs(): CliArgs {
    const args = process.argv.slice(2)
    const result: Partial<CliArgs> = {}
    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (!arg.startsWith('--')) {
            continue
        }
        const key = arg.slice(2)
        const value = args[i + 1]
        if (!value || value.startsWith('--')) {
            continue
        }
        result[key as keyof CliArgs] = value
        i++
    }

    if (!result.code) {
        throw new Error('Missing --code argument')
    }

    return {
        code: result.code,
        redirectUri: result.redirectUri ?? env.spotifyRedirectUri,
    }
}

async function main() {
    const { code, redirectUri } = parseArgs()
    console.log('[spotify] Exchanging authorization code for tokens...')
    const tokens = await exchangeAuthorizationCode(code, redirectUri)
    persistSpotifyTokens(tokens)

    console.log('access_token:', tokens.accessToken)
    if (tokens.refreshToken) {
        console.log('refresh_token:', tokens.refreshToken)
    }
    console.log('expires_in:', tokens.expiresIn, 'seconds')
    console.log('\nTokens saved to .env.local and environment variables.')
}

main().catch((error) => {
    console.error('Failed to exchange code for tokens:', error)
    process.exit(1)
})
