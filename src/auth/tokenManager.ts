import fs from 'node:fs'
import path from 'node:path'

import SpotifyWebApi from 'spotify-web-api-node'

import { env, getRequiredEnv } from '../config/env'

export type SpotifyTokenSet = {
    accessToken: string
    refreshToken?: string
    expiresIn?: number
}

const LOCAL_ENV_PATH = path.resolve(process.cwd(), '.env.local')

/**
 * Exchange a Spotify authorization code for user tokens.
 */
export async function exchangeAuthorizationCode(code: string, redirectUri = env.spotifyRedirectUri): Promise<SpotifyTokenSet> {
    const spotify = new SpotifyWebApi({
        clientId: getRequiredEnv('SPOTIFY_CLIENT_ID'),
        clientSecret: getRequiredEnv('SPOTIFY_CLIENT_SECRET'),
        redirectUri,
    })

    const { body } = await spotify.authorizationCodeGrant(code)

    return {
        accessToken: body.access_token,
        refreshToken: body.refresh_token,
        expiresIn: body.expires_in,
    }
}

/**
 * Refresh an access token using the provided refresh token.
 */
export async function refreshAccessTokenWith(refreshToken: string): Promise<SpotifyTokenSet> {
    const spotify = new SpotifyWebApi({
        clientId: getRequiredEnv('SPOTIFY_CLIENT_ID'),
        clientSecret: getRequiredEnv('SPOTIFY_CLIENT_SECRET'),
        redirectUri: env.spotifyRedirectUri,
    })
    spotify.setRefreshToken(refreshToken)

    const { body } = await spotify.refreshAccessToken()

    return {
        accessToken: body.access_token,
        refreshToken: body.refresh_token ?? refreshToken,
        expiresIn: body.expires_in,
    }
}

/**
 * Persist Spotify tokens in memory, process env, and .env.local.
 */
export function persistSpotifyTokens(tokens: SpotifyTokenSet) {
    env.spotifyAccessToken = tokens.accessToken
    process.env.SPOTIFY_ACCESS_TOKEN = tokens.accessToken

    if (tokens.refreshToken) {
        env.spotifyRefreshToken = tokens.refreshToken
        process.env.SPOTIFY_REFRESH_TOKEN = tokens.refreshToken
    }

    upsertLocalEnv({
        SPOTIFY_ACCESS_TOKEN: tokens.accessToken,
        SPOTIFY_REFRESH_TOKEN: tokens.refreshToken,
    })
}

function upsertLocalEnv(values: Record<string, string | undefined>) {
    let lines: string[] = []
    if (fs.existsSync(LOCAL_ENV_PATH)) {
        const content = fs.readFileSync(LOCAL_ENV_PATH, 'utf8')
        lines = content.split(/\r?\n/)
    }

    const filtered = lines.filter(
        (line) =>
            line.trim() !== '' &&
            !line.startsWith('SPOTIFY_ACCESS_TOKEN=') &&
            !line.startsWith('SPOTIFY_REFRESH_TOKEN='),
    )

    if (values.SPOTIFY_ACCESS_TOKEN) {
        filtered.push(`SPOTIFY_ACCESS_TOKEN=${values.SPOTIFY_ACCESS_TOKEN}`)
    }
    if (values.SPOTIFY_REFRESH_TOKEN) {
        filtered.push(`SPOTIFY_REFRESH_TOKEN=${values.SPOTIFY_REFRESH_TOKEN}`)
    }

    const output = filtered.join('\n') + '\n'
    fs.writeFileSync(LOCAL_ENV_PATH, output)
}
