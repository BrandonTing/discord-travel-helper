import { REST, Routes, ChatInputCommandInteraction, CacheType, RESTPutAPIApplicationCommandsJSONBody, ApplicationCommandOptionType } from 'discord.js'
import { logger } from '../utils/logger'
import { env } from '../utils/env'
enum CmdName {
    GET_JPY_EXCHANGE = 'jpy_exchange'
}

enum FXNameMapping {
    TWD = "新台幣",
    MYR = "馬來西亞林吉特",
    HKD = "港元"
}

const commands: RESTPutAPIApplicationCommandsJSONBody = [
    {
        name: CmdName.GET_JPY_EXCHANGE,
        description: 'replies with cur jpy/ntd exchange rate',
        options: [
            {
                name: 'is_from_jpy',
                description: 'True為日幣換指定幣別',
                type: ApplicationCommandOptionType.Boolean,
            },
            {
                name: 't',
                description: '請輸入幣別代碼，預設為TWD，大小寫不影響。',
                type: ApplicationCommandOptionType.String,
            },
            {
                name: 'unit',
                description: '請輸入兌換單位，預設為一',
                type: ApplicationCommandOptionType.Number,
            },
        ]
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
    const args = interacrtion.options.data;
    logger.info(args)
    const modifiedArgs = args.reduce<Record<string, string | boolean | number>>((pre, cur) => {
        logger.info(cur.value)
        if (!cur.value) return pre
        pre[cur.name] = cur.value
        return pre
    }, {});
    logger.info(modifiedArgs)
    const { is_from_jpy = true, target = 'TWD', unit = 1 } = modifiedArgs as {
        is_from_jpy: boolean,
        target: keyof typeof FXNameMapping,
        unit: number
    };
    logger.info(is_from_jpy)
    interacrtion.reply(`${unit}單位${is_from_jpy ? "日幣" : FXNameMapping[target]}換算 20 ${is_from_jpy ? FXNameMapping[target] : "日幣"}`)
    // https://api.currencyapi.com/v3/latest?apikey=the_key&currencies=TWD%2CHKD%2CMYR&base_currency=JPY
    //     const data = (await (await fetch(`https://api.currencyapi.com/v3/latest?apikey=${env.CURRENCY_KEY}&currencies=${encodeURIComponent(env.CURRENCIES)}&base_currency=JPY`)).json()) as typeof sampleCurrenciesResponse
    //     function formatFx(key: keyof typeof data.data, val: typeof data.data) {
    //         return val[key].value.toFixed(3)
    //     }
    //     interacrtion.reply(`
    // 一日幣兌換
    // ${formatFx('TWD', data.data)} 新台幣
    // ${formatFx('MYR', data.data)} 馬來西亞林吉特
    // ${formatFx('HKD', data.data)} 港元
    //     `)
}

export async function handleSlashCmds(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.commandName === CmdName.GET_JPY_EXCHANGE) {
        await handleGetJPYExchange(interaction)
    }
}

