# Ollama Spotify Tools

A lightweight TypeScript toolkit that connects local agents (e.g., Ollama) to the Spotify Web API through ready-to-use tool definitions. The core is framework-agnostic so different interfaces (CLI, desktop app, web UI, custom agents) can share the same logic.

## Requirements
- Node.js 18+
- Access to Ollama (local or via Ollama Cloud; supply `OLLAMA_HOST`/`OLLAMA_API_KEY` only when using the cloud endpoint)
- A Spotify application with `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and redirect URI `http://localhost:3000/callback`

## Setup
1. Provide the required env vars via `.env` or your shell:
   ```bash
   cat <<'EOF' > .env
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   # Uncomment the two lines below only when using Ollama Cloud
   # OLLAMA_HOST=https://api.ollama.cloud/v1
   # OLLAMA_API_KEY=...
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

## Extending
`core/index.ts` re-exports `ensureSpotifyUserTokens` and `runChatWithTools`, so any interface can import and reuse the same Spotify-enabled core without depending on the CLI.
The shared helper automatically launches the Spotify OAuth flow whenever tokens are missing, so UIs do not need bespoke authorization logic.
