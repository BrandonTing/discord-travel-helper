import { REST, Routes, ChatInputCommandInteraction, CacheType } from 'discord.js'
import { logger } from '../utils/logger'
import { env } from '../utils/env'

enum CmdName {
    GET_JPY_EXCHANGE = 'jpy_exchange'
}

const commands = [
    {
        name: CmdName.GET_JPY_EXCHANGE,
        description: 'replies with cur jpy/ntd exchange rate'
    }
]
const rest = new REST({ version: '10' }).setToken(env.DISCORD_BOT_TOKEN)

export async function registerSlashCmds() {
    try {
        logger.info('registering')
        await rest.put(Routes.applicationCommands(env.DISCORD_BOT_CLIENT_ID), {
            body: commands
        })
    } catch (err) {
        logger.error(`regiester slash cmds error: ${err}`)
    }
}

export function handleSlashCmds(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.commandName === CmdName.GET_JPY_EXCHANGE) {
        // TODO fetch current fx 
    }
}

