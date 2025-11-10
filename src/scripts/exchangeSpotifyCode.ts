import { stdout, stderr } from 'node:process'

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
    stdout.write('[spotify] Exchanging authorization code for tokens...\n')
    const tokens = await exchangeAuthorizationCode(code, redirectUri)
    persistSpotifyTokens(tokens)

    stdout.write(`access_token: ${tokens.accessToken}\n`)
    if (tokens.refreshToken) {
        stdout.write(`refresh_token: ${tokens.refreshToken}\n`)
    }
    stdout.write(`expires_in: ${tokens.expiresIn} seconds\n`)
    stdout.write('\nTokens saved to .env.local and environment variables.\n')
}

main().catch((error) => {
    stderr.write(`Failed to exchange code for tokens: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
})
