# Ollama Spotify Tools

Un toolkit TypeScript che collega agenti locali (es. Ollama) all'API Web di Spotify tramite strumenti già pronti. L'obiettivo è tenere il core riutilizzabile e agganciare diverse interfacce (CLI, app, web) che condividono la stessa logica.

## Requisiti
- Node.js 18+
- Un'istanza Ollama raggiungibile (default `http://127.0.0.1:11434`)
- Una Spotify App con `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` e un redirect `http://localhost:3000/callback`

## Configurazione
1. Copia le variabili richieste in `.env` o nel tuo ambiente:
   ```bash
   cat <<'EOF' > .env
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   OLLAMA_HOST=http://127.0.0.1:11434
   EOF
   ```
2. Installa le dipendenze e compila:
   ```bash
   npm install
   npm run build
   ```

## CLI
La CLI (`ollama-spotify-cli`) avvia l'autenticazione Spotify **solo** alla prima esecuzione della sessione, poi riutilizza i token per tutte le richieste successive.

### Esecuzione rapida (prompt singolo)
```bash
npm run cli -- "Metti in pausa il mio Spotify"
```
Puoi cambiare modello con `-m`:
```bash
npm run cli -- --model llama3.1 "Che playlist mi consigli?"
```

### Modalità interattiva
Avvia la CLI senza prompt per entrare in un REPL:
```bash
npm run cli
```
Comandi disponibili:
- `/help` mostra i comandi
- `/exit` chiude la sessione

### Binario pubblicato
Dopo `npm run build`, il pacchetto espone il bin `ollama-spotify-cli`:
```bash
npx ollama-spotify-cli --help
```

## Script di supporto
- `npm run auth:url` stampa l'URL di autorizzazione
- `npm run auth:token -- --code <CODE>` scambia il codice per i token
- `npm run auth:refresh` rinnova il token di accesso usando `SPOTIFY_REFRESH_TOKEN`

## Estensioni
Le funzioni esportate in `src/index.ts` (`ensureSpotifyUserTokens`, `runChatWithTools`) permettono di costruire UI alternative condividendo gli stessi strumenti Spotify.
