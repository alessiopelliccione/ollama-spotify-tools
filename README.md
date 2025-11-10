# Ollama Spotify Tools

A lightweight TypeScript toolkit that connects local agents (e.g., Ollama) to the Spotify Web API through ready-to-use tool definitions. The core is framework-agnostic so different interfaces (CLI, desktop app, web UI, custom agents) can share the same logic.

## Requirements
- Node.js 18+
- A reachable Ollama instance (default `http://127.0.0.1:11434`)
- A Spotify application with `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and redirect URI `http://localhost:3000/callback`

## Setup
1. Provide the required env vars via `.env` or your shell:
   ```bash
   cat <<'EOF' > .env
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   OLLAMA_HOST=http://127.0.0.1:11434
   EOF
   ```
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

## CLI
The CLI (`ollama-spotify-cli`) kicks off Spotify OAuth only once per session and reuses the tokens afterward.

### Single-prompt run
```bash
npm run cli -- "Pause my Spotify playback"
```
Override the model with `-m`:
```bash
npm run cli -- --model llama3.1 "Suggest a playlist"
```

### Interactive mode
Start the CLI without a prompt to enter a REPL:
```bash
npm run cli
```
Commands:
- `/help` prints available commands
- `/exit` terminates the REPL

### Installed binary
After `npm run build`, the package exposes the `ollama-spotify-cli` bin:
```bash
npx ollama-spotify-cli --help
```

## Support scripts
- `npm run auth:url` prints the Spotify authorize URL
- `npm run auth:token -- --code <CODE>` exchanges the auth code for tokens
- `npm run auth:refresh` refreshes the access token via `SPOTIFY_REFRESH_TOKEN`

## Extending
`src/index.ts` re-exports `ensureSpotifyUserTokens` and `runChatWithTools`, so any interface can import and reuse the same Spotify-enabled core without depending on the CLI.
