import "dotenv/config"
import { env } from "./utils/env"
import { Client, IntentsBitField, } from "discord.js"
import { logger } from "./utils/logger"
import { handleSlashCmds, registerSlashCmds } from "./slash-commands"
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

client.on('ready', () => {
    registerSlashCmds()
    logger.info('online ')
})

client.on('interactionCreate', interaction => {
    // ignore other interacrtions for now except for slash cmds
    if (!interaction.isChatInputCommand()) return
    handleSlashCmds(interaction)
})

client.on('messageCreate', (message) => {
    logger.info(message);
})

client.login(env.DISCORD_BOT_TOKEN)
