import { createSpotifyAuthorizeUrl } from '../auth/spotifyAuthorization'

async function main() {
    const { url, scopes, state } = createSpotifyAuthorizeUrl()
    console.log('Spotify authorization URL:')
    console.log(url)
    console.log('\nScopes:', scopes.join(', '))
    console.log('State:', state)
}

main().catch((error) => {
    console.error('Failed to generate Spotify authorization URL:', error)
    process.exit(1)
})
