import type { Tool, ToolCall } from 'ollama'

export const toolDefinitions: Tool[] = [
    {
        type: 'function',
        function: {
            name: 'get_current_weather',
            description: 'Get the current weather for a city',
            parameters: {
                type: 'object',
                properties: {
                    city: {
                        type: 'string',
                        description: 'The name of the city to look up',
                    },
                    units: {
                        type: 'string',
                        enum: ['metric', 'imperial'],
                        description: 'Preferred temperature units',
                    },
                },
                required: ['city'],
            },
        },
    },
]

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>

const toolHandlers: Record<string, ToolHandler> = {
    get_current_weather: async (args) => {
        const city = typeof args.city === 'string' ? args.city : ''
        if (!city) {
            throw new Error('city argument is required')
        }

        const units = args.units === 'imperial' ? 'imperial' : 'metric'
        const baseTemp = 12 + (city.length % 10)
        const temperatureC = units === 'metric' ? baseTemp : (baseTemp * 9) / 5 + 32

        return {
            location: city,
            description: city.length % 2 === 0 ? 'Partly cloudy' : 'Sunny',
            temperature: {
                value: Number(temperatureC.toFixed(1)),
                units: units === 'metric' ? 'celsius' : 'fahrenheit',
            },
            humidity: 40 + (city.length % 20),
            windKph: 10 + (city.length % 5),
            observedAt: new Date().toISOString(),
            dataSource: 'demo-weather-service',
        }
    },
}

export async function executeToolCall(call: ToolCall): Promise<unknown> {
    const name = call.function.name
    const handler = toolHandlers[name]

    if (!handler) {
        throw new Error(`No handler registered for tool ${name}`)
    }

    return handler(call.function.arguments ?? {})
}
