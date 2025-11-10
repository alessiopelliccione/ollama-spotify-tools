import SpotifyWebApi from 'spotify-web-api-node'

import { env, getRequiredEnv } from '../config/env'

export type SpotifyClient = SpotifyWebApi

let cachedClient: SpotifyClient | null = null

export function getSpotifyClient(): SpotifyClient {
    if (cachedClient) {
        return cachedClient
    }

    cachedClient = new SpotifyWebApi({
        clientId: getRequiredEnv('SPOTIFY_CLIENT_ID'),
        clientSecret: getRequiredEnv('SPOTIFY_CLIENT_SECRET'),
        redirectUri: env.spotifyRedirectUri,
    })

    return cachedClient
}

export async function authenticateSpotifyClient(client: SpotifyClient = getSpotifyClient()): Promise<SpotifyClient> {
    if (client.getAccessToken()) {
        return client
    }

    const { body } = await client.clientCredentialsGrant()
    client.setAccessToken(body.access_token)

    return client
}
