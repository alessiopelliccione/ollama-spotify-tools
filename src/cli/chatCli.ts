import readline from 'node:readline/promises'
import { stdin as input, stdout as output, stderr } from 'node:process'
import { parseArgs } from 'node:util'

import { ensureSpotifyUserTokens } from '../auth/interactiveAuth'
import { runChatWithTools } from '../core/chatRunner'

type CliOptions = {
    model?: string
}

type ParsedCliArgs = CliOptions & {
    helpRequested: boolean
    prompt?: string
}

/**
 * Parse positional arguments and flags supported by the CLI.
 */
function parseCliArguments(): ParsedCliArgs {
    const { values, positionals } = parseArgs({
        options: {
            model: { type: 'string', short: 'm' },
            help: { type: 'boolean', short: 'h' },
        },
        allowPositionals: true,
    })

    return {
        model: values.model,
        helpRequested: Boolean(values.help),
        prompt: positionals.length ? positionals.join(' ').trim() : undefined,
    }
}

/**
 * Print detailed usage instructions for the CLI.
 */
function printHelp() {
    const helpMessage = `
Usage: spotify-tools [options] [prompt]

Options:
  -m, --model <name>   Override the default Ollama model (default: gpt-oss:120b)
  -h, --help           Show this help message

Examples:
  spotify-tools "Pause my Spotify music"
  spotify-tools --model llama3.1 "Recommend me a spotify playlist"

If no prompt is provided, an interactive REPL session will start. Use /exit to quit.`.trim()
    output.write(`${helpMessage}\n`)
}

/**
 * Start a REPL loop that forwards every user message to runChatWithTools.
 */
async function runInteractiveLoop(options: CliOptions) {
    const rl = readline.createInterface({ input, output })
    output.write('Type a message to send it to runChatWithTools. Use /help for commands.\n')

    rl.on('SIGINT', () => {
        output.write('\nUse /exit to quit.\n')
    })

    while (true) {
        const message = (await rl.question('spotify-tools> ')).trim()

        if (!message) {
            continue
        }

        const normalized = message.toLowerCase()
        if (normalized === '/exit' || normalized === '/quit') {
            break
        }
        if (normalized === '/help') {
            output.write('Commands: /exit (quit), /help (show this message)\n')
            continue
        }

        try {
            await runChatWithTools(message, options.model)
        } catch (error) {
            output.write(`[cli] runChatWithTools failed: ${error instanceof Error ? error.message : String(error)}\n`)
        }
    }

    rl.close()
}

/**
 * Entry point executed when the CLI runs from the command line.
 */
async function main() {
    const parsed = parseCliArguments()
    if (parsed.helpRequested) {
        printHelp()
        return
    }

    output.write('[cli] Preparing Spotify authentication...\n')
    await ensureSpotifyUserTokens()
    output.write('[cli] Ready! Spotify access tokens available.\n')

    if (parsed.prompt) {
        await runChatWithTools(parsed.prompt, parsed.model)
        return
    }

    await runInteractiveLoop(parsed)
}

main().catch((error) => {
    stderr.write(`[cli] Unexpected error: ${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
})
