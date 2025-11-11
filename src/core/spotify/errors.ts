type SpotifyApiError = {
    statusCode?: number
    body?: unknown
    message?: string
}

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
