import crypto from 'node:crypto'

import SpotifyWebApi from 'spotify-web-api-node'

import { env, getRequiredEnv } from '../config/env'

export const DEFAULT_SPOTIFY_SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
]

/**
 * Build the Spotify OAuth authorize URL with sane defaults for scopes and state.
 */
export function createSpotifyAuthorizeUrl(options?: {
    scopes?: string[]
    state?: string
    showDialog?: boolean
}) {
    const clientId = getRequiredEnv('SPOTIFY_CLIENT_ID')
    const redirectUri = env.spotifyRedirectUri
    const scopes = options?.scopes?.length ? options.scopes : DEFAULT_SPOTIFY_SCOPES
    const state = options?.state ?? crypto.randomBytes(8).toString('hex')

    const spotifyApi = new SpotifyWebApi({
        clientId,
        redirectUri,
    })

    const url = spotifyApi.createAuthorizeURL(scopes, state, options?.showDialog)

    return {
        url,
        state,
        scopes,
    }
}
