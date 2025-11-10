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

    cachedClient = new SpotifyWebApi({
        clientId: getRequiredEnv('SPOTIFY_CLIENT_ID'),
        clientSecret: getRequiredEnv('SPOTIFY_CLIENT_SECRET'),
        redirectUri: env.spotifyRedirectUri,
    })

    if (env.spotifyAccessToken) {
        cachedClient.setAccessToken(env.spotifyAccessToken)
    }

    if (env.spotifyRefreshToken) {
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
        client.setRefreshToken(env.spotifyRefreshToken)
        const { body } = await client.refreshAccessToken()
        client.setAccessToken(body.access_token)
        return client
    }

    const { body } = await client.clientCredentialsGrant()
    client.setAccessToken(body.access_token)

    return client
}
