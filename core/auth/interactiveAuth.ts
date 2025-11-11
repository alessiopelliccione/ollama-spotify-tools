import crypto from 'node:crypto'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { URL } from 'node:url'

import { env } from '../config/env'
import { createSpotifyAuthorizeUrl } from './spotifyAuthorization'
import { exchangeAuthorizationCode, persistSpotifyTokens } from './tokenManager'

/**
 * Ensure Spotify user tokens exist by starting an interactive OAuth flow whenever neither an
 * access token nor a refresh token is present. The helper spins up a temporary HTTP server on
 * the configured redirect URI so the CLI can capture the authorization code locally.
 *
 * @returns Resolves once credentials are guaranteed to exist (either because they were already
 *          present or because the interactive flow completed successfully).
 */
export async function ensureSpotifyUserTokens(): Promise<void> {
    if (env.spotifyAccessToken || env.spotifyRefreshToken) {
        return
    }

    const redirect = new URL(env.spotifyRedirectUri)
    const allowedHosts = new Set(['localhost', '127.0.0.1', '::1'])
    if (!allowedHosts.has(redirect.hostname)) {
        throw new Error('Interactive Spotify auth requires a localhost redirect URI')
    }

    const state = crypto.randomBytes(16).toString('hex')
    const { url } = createSpotifyAuthorizeUrl({ state, showDialog: true })

    const port = Number(redirect.port) || (redirect.protocol === 'https:' ? 443 : 80)

    await new Promise<void>((resolve, reject) => {
        let settled = false
        const finish = (cb: () => void) => {
            if (!settled) {
                settled = true
                cb()
            }
        }

        const server = http.createServer(async (req, res) => {
            try {
                const handled = await handleCallbackRequest({
                    req,
                    res,
                    state,
                    redirect,
                })
                if (handled) {
                    finish(resolve)
                    server.close()
                }
            } catch (error) {
                finish(() => reject(error))
                server.close()
            }
        })

        server.on('error', (error) => {
            finish(() => reject(error))
        })

        server.listen(port, redirect.hostname, () => {
            openInBrowser(url)
        })
    })
}

/**
 * Validate the OAuth redirect request, enforce state matching, exchange the authorization code
 * for tokens and persist them. Responses are written directly to the HTTP connection so the
 * user receives immediate feedback in their browser.
 *
 * @param req Node HTTP request produced by the local callback server.
 * @param res Node HTTP response used to acknowledge the browser.
 * @param state CSRF protection token sent during authorization.
 * @param redirect Parsed redirect URL used to validate hosts/paths.
 * @returns `true` when the request targets the redirect route (regardless of success) so the
 *          caller can decide whether to keep the server alive.
 */
async function handleCallbackRequest({
    req,
    res,
    state,
    redirect,
}: {
    req: http.IncomingMessage
    res: http.ServerResponse
    state: string
    redirect: URL
}): Promise<boolean> {
    if (!req.url) {
        return false
    }

    const requestUrl = new URL(req.url, redirect)
    if (requestUrl.pathname !== redirect.pathname) {
        return false
    }

    const returnedState = requestUrl.searchParams.get('state')
    const code = requestUrl.searchParams.get('code')
    if (!code || !returnedState) {
        res.writeHead(400).end('Missing code or state')
        return true
    }

    if (returnedState !== state) {
        res.writeHead(400).end('State mismatch. Please retry the authorization flow.')
        return true
    }

    try {
        const tokens = await exchangeAuthorizationCode(code, redirect.toString())
        persistSpotifyTokens(tokens)
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<html><body><h1>Spotify authorization complete</h1><p>You can return to the terminal.</p></body></html>')
    } catch (error) {
        const message = error instanceof Error ? error.stack ?? error.message : String(error)
        res.writeHead(500).end('Failed to exchange code. Check terminal output for details.')
    }

    return true
}

/**
 * Attempt to open the Spotify authorization URL in the user's default browser. The command
 * varies between platforms but runs detached to avoid blocking the CLI.
 *
 * @param targetUrl The authorization URL to launch.
 */
function openInBrowser(targetUrl: string) {
    const platform = process.platform
    let command: string
    let args: string[]

    if (platform === 'darwin') {
        command = 'open'
        args = [targetUrl]
    } else if (platform === 'win32') {
        command = 'cmd'
        args = ['/c', 'start', '', targetUrl]
    } else {
        command = 'xdg-open'
        args = [targetUrl]
    }

    const child = spawn(command, args, { stdio: 'ignore', detached: true })
    child.unref()
}
