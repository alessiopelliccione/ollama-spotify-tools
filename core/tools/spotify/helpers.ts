import {authenticateSpotifyClient, SpotifyClient} from "../../clients/spotifyClient";
import type {ToolHandler} from "../types";

export const withSpotifyClient = (
    callback: (spotify: SpotifyClient, args: Record<string, unknown>) => Promise<unknown>
): ToolHandler => {
    return async (args) => {
        const spotify = await authenticateSpotifyClient()
        return callback(spotify, args)
    }
}