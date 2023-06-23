import { REST, Routes, ChatInputCommandInteraction, CacheType } from 'discord.js'
import { logger } from '../utils/logger'
import { env } from '../utils/env'
import { sampleCurrenciesResponse } from '../sampleData/currencies'

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

async function handleGetJPYExchange(interacrtion: ChatInputCommandInteraction<CacheType>) {
    // fetch current fx 
    // https://api.currencyapi.com/v3/latest?apikey=the_key&currencies=TWD%2CHKD%2CMYR&base_currency=JPY
    const data = (await (await fetch(`https://api.currencyapi.com/v3/latest?apikey=${env.CURRENCY_KEY}&currencies=${encodeURIComponent(env.CURRENCIES)}&base_currency=JPY`)).json()) as typeof sampleCurrenciesResponse
    function formatFx(key: keyof typeof data.data, val: typeof data.data) {
        return val[key].value.toFixed(3)
    }
    interacrtion.reply(`
一日幣兌換
${formatFx('TWD', data.data)} 新台幣
${formatFx('MYR', data.data)} 馬來西亞林吉特
${formatFx('HKD', data.data)} 港元
    `)
}

export async function handleSlashCmds(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.commandName === CmdName.GET_JPY_EXCHANGE) {
        await handleGetJPYExchange(interaction)
    }
}

