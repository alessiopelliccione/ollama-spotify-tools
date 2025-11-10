import { authenticateSpotifyClient, type SpotifyClient } from './clients/spotifyClient'

async function main() {
    const spotify = await authenticateSpotifyClient()
    const featured = await spotify.getFeaturedPlaylists({ limit: 5 })

    logFeaturedPlaylists(featured.body)
}

type FeaturedPlaylistsResponse = Awaited<ReturnType<SpotifyClient['getFeaturedPlaylists']>>['body']

function logFeaturedPlaylists(response: FeaturedPlaylistsResponse) {
    const playlists = response.playlists.items
    if (!playlists.length) {
        console.log('No featured playlists found. Double-check your Spotify credentials.')
        return
    }

    console.log(`Showing ${playlists.length} featured playlists:`)
    for (const playlist of playlists) {
        console.log(`- ${playlist.name} (${playlist.tracks.total} tracks) – ${playlist.external_urls.spotify}`)
    }
}

main().catch((error) => {
    console.error('Spotify example failed:', error)
    process.exit(1)
})
