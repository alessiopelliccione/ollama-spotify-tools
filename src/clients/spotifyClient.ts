import SpotifyWebApi from 'spotify-web-api-node'
import { stdout } from 'node:process'

import { env, getRequiredEnv } from '../config/env'
import { ensureSpotifyUserTokens } from '../auth/interactiveAuth'

export type SpotifyClient = SpotifyWebApi

let cachedClient: SpotifyClient | null = null

/**
 * Create or return a cached Spotify Web API client configured with env credentials.
 */
export function getSpotifyClient(): SpotifyClient {
    if (cachedClient) {
        return cachedClient
    }

    stdout.write('[spotify] Creating API client\n')
    cachedClient = new SpotifyWebApi({
        clientId: getRequiredEnv('SPOTIFY_CLIENT_ID'),
        clientSecret: getRequiredEnv('SPOTIFY_CLIENT_SECRET'),
        redirectUri: env.spotifyRedirectUri,
    })

    if (env.spotifyAccessToken) {
        stdout.write('[spotify] Using access token from environment\n')
        cachedClient.setAccessToken(env.spotifyAccessToken)
    }

    if (env.spotifyRefreshToken) {
        stdout.write('[spotify] Using refresh token from environment\n')
        cachedClient.setRefreshToken(env.spotifyRefreshToken)
    }

    return cachedClient
}

/**
 * Ensure a Spotify Web API client carries valid user tokens, refreshing as needed.
 */
export async function authenticateSpotifyClient(client: SpotifyClient = getSpotifyClient()): Promise<SpotifyClient> {
    await ensureSpotifyUserTokens()

    if (client.getAccessToken()) {
        return client
    }

    if (env.spotifyAccessToken) {
        client.setAccessToken(env.spotifyAccessToken)
        return client
    }

    if (env.spotifyRefreshToken) {
        stdout.write('[spotify] Refreshing access token using stored refresh token\n')
        client.setRefreshToken(env.spotifyRefreshToken)
        const { body } = await client.refreshAccessToken()
        client.setAccessToken(body.access_token)
        stdout.write('[spotify] Received refreshed access token (update your env to persist it)\n')
        return client
    }

    stdout.write('[spotify] Requesting client credentials token\n')
    const { body } = await client.clientCredentialsGrant()
    client.setAccessToken(body.access_token)

    return client
}
