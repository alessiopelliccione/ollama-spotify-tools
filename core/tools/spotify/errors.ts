/**
 * Slim representation matching the shape of errors thrown by `spotify-web-api-node`.
 */
type SpotifyApiError = {
    statusCode?: number
    body?: unknown
    message?: string
}

/**
 * Serialized error payload returned to the LLM so it can reason about the failure cause.
 */
export type SerializedSpotifyError =
    | {
          source: 'spotify'
          statusCode?: number
          body?: unknown
          message?: string
      }
    | {
          source: 'system'
          name?: string
          message: string
          stack?: string
      }

/**
 * Normalize unknown runtime errors into a consistent machine-readable structure that the LLM
 * can inspect when Spotify operations fail.
 *
 * @param error Any thrown error value from the Spotify SDK or runtime.
 * @returns Structured data describing the failure source and details.
 */
// TODO try to remove
export function serializeSpotifyError(error: unknown): SerializedSpotifyError {
    if (error && typeof error === 'object') {
        const { statusCode, body, message } = error as SpotifyApiError
        const hasSpotifyShape =
            typeof statusCode === 'number' || body !== undefined || typeof message === 'string'

        if (hasSpotifyShape) {
            return {
                source: 'spotify',
                statusCode,
                body,
                message: message ?? (error instanceof Error ? error.message : undefined),
            }
        }
    }

    if (error instanceof Error) {
        return {
            source: 'system',
            name: error.name,
            message: error.message,
            stack: error.stack,
        }
    }

    return {
        source: 'system',
        message: String(error),
    }
}
