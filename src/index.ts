import "dotenv/config"
import { env } from "./utils/env"
import { Client, IntentsBitField, REST, RESTPutAPIApplicationCommandsJSONBody, Routes, } from "discord.js"
import { logger } from "./utils/logger"
import { getSlashCmds, handleSlashCmds, } from "./cmds/slashCommands";
import { getUserContextCmds, handlerUserContextCmds } from "./cmds/userContextCmds";
import { getMsgContextCmds, handleMsgContextMenuCmds } from "./cmds/msgMenuCmds";
import { preCmdFunctions } from "./cmds/preCmdFunctions";

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

async function registerCmds(rest: REST, cmds: RESTPutAPIApplicationCommandsJSONBody) {
    try {
        logger.info('registering cmds')
        // await setupExchangeSync()
        await rest.put(Routes.applicationCommands(env.DISCORD_BOT_CLIENT_ID), {
            body: cmds
        })
    } catch (err) {
        logger.error(`regiester cmds error: ${err}`)
    }
}


client.on('ready', async () => {
    const rest = new REST({ version: '10' }).setToken(env.DISCORD_BOT_TOKEN);
    await preCmdFunctions();
    const slashCmds = getSlashCmds();
    const userContextCmds = getUserContextCmds()
    const msgMenuCmds = getMsgContextCmds()
    await registerCmds(rest, [...slashCmds, ...userContextCmds, ...msgMenuCmds])
    logger.info('online ')
})

client.on('interactionCreate', async interaction => {
    // ignore other interacrtions for now except for slash cmds
    if (interaction.isMessageContextMenuCommand()) {
        await handleMsgContextMenuCmds(interaction)
    }
    if (interaction.isUserContextMenuCommand()) {
        await handlerUserContextCmds(interaction)
    }
    if (interaction.isChatInputCommand()) {
        await handleSlashCmds(interaction)
    }
})

// client.on('messageCreate', (message) => {
//     logger.info(message);
// })

client.login(env.DISCORD_BOT_TOKEN)
