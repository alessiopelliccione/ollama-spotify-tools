import SpotifyWebApi from 'spotify-web-api-node'
import { env, getRequiredEnv } from '../../config/env'
import { ensureSpotifyUserTokens } from '../../auth/interactiveAuth'

/**
 * Convenient alias around the Spotify Web API SDK so downstream code can remain agnostic
 * to the underlying library while still benefiting from its typings.
 */
export type SpotifyClient = SpotifyWebApi

let cachedClient: SpotifyClient | null = null

/**
 * Create (and memoize) a Spotify client pre-configured with client credentials and any
 * persisted access/refresh tokens found in the environment.
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
 * Ensure a Spotify Web API client carries a usable access token by leveraging stored
 * user tokens, refreshing them when available, and ultimately falling back to the
 * client credentials flow as a last resort.
 *
 * @param client Optional client instance to authenticate; defaults to the cached
 *               singleton returned by {@link getSpotifyClient}.
 * @returns A Spotify client guaranteed to have a valid access token set.
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
