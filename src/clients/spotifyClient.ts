import SpotifyWebApi from 'spotify-web-api-node'

import { env, getRequiredEnv } from '../config/env'
import { ensureSpotifyUserTokens } from '../auth/interactiveAuth'

export type SpotifyClient = SpotifyWebApi

let cachedClient: SpotifyClient | null = null

export function getSpotifyClient(): SpotifyClient {
    if (cachedClient) {
        return cachedClient
    }

    console.log('[spotify] Creating API client')
    cachedClient = new SpotifyWebApi({
        clientId: getRequiredEnv('SPOTIFY_CLIENT_ID'),
        clientSecret: getRequiredEnv('SPOTIFY_CLIENT_SECRET'),
        redirectUri: env.spotifyRedirectUri,
    })

    if (env.spotifyAccessToken) {
        console.log('[spotify] Using access token from environment')
        cachedClient.setAccessToken(env.spotifyAccessToken)
    }

    if (env.spotifyRefreshToken) {
        console.log('[spotify] Using refresh token from environment')
        cachedClient.setRefreshToken(env.spotifyRefreshToken)
    }

    return cachedClient
}

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
        console.log('[spotify] Refreshing access token using stored refresh token')
        client.setRefreshToken(env.spotifyRefreshToken)
        const { body } = await client.refreshAccessToken()
        client.setAccessToken(body.access_token)
        console.log('[spotify] Received refreshed access token (update your env to persist it)')
        return client
    }

    console.log('[spotify] Requesting client credentials token')
    const { body } = await client.clientCredentialsGrant()
    client.setAccessToken(body.access_token)

    return client
}
