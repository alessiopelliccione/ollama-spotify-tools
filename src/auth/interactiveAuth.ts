import crypto from 'node:crypto'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { URL } from 'node:url'

import { env } from '../config/env'
import { createSpotifyAuthorizeUrl } from './spotifyAuthorization'
import { exchangeAuthorizationCode, persistSpotifyTokens } from './tokenManager'

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

    console.log('[spotify] Starting temporary callback server on', redirect.toString())
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
            console.log('[spotify] Please complete the authorization in your browser.')
            openInBrowser(url)
            console.log('[spotify] If the browser did not open automatically, visit:', url)
        })
    })
}

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
        console.log('[spotify] Authorization successful. Tokens saved to .env.local')
    } catch (error) {
        console.error('[spotify] Failed to exchange code for tokens', error)
        res.writeHead(500).end('Failed to exchange code. Check terminal output for details.')
    }

    return true
}

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
    child.on('error', () => {
        console.log('Unable to open browser automatically. Please visit:', targetUrl)
    })
    child.unref()
}
