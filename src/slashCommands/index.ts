import { REST, Routes, ChatInputCommandInteraction, CacheType, RESTPutAPIApplicationCommandsJSONBody, ApplicationCommandOptionType, } from 'discord.js'
import { logger } from '../utils/logger'
import { env } from '../utils/env'
import "@total-typescript/ts-reset"
import { CurrenciesResponse, CurrencyErrMsg } from '../type/exchange/currencies'
import { sampleCurrenciesResponse } from '../sampleData/currencies'
import { existsSync, readFileSync, writeFileSync, mkdir } from 'fs'
import path from 'path'
import { CronJob } from 'cron';
import { filePath } from './utils/getExchangeFilePath'
import { setupExchangeSync } from './utils/syncExchange'

enum CmdName {
    GET_JPY_EXCHANGE = 'jpy_exchange'
}

enum FXNameMapping {
    TWD = "新台幣",
    MYR = "馬來西亞林吉特",
    HKD = "港元"
}

const commands = [
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
                name: 'target',
                description: '目標幣別',
                type: ApplicationCommandOptionType.String,
                autocomplete: false,
                choices: Object.entries(FXNameMapping).map((currency) => ({
                    name: currency[1],
                    value: currency[0]
                }))
            },
            {
                name: 'unit',
                description: '請輸入兌換單位，預設為1',
                type: ApplicationCommandOptionType.Number,
            },
        ]
    }
] satisfies RESTPutAPIApplicationCommandsJSONBody

export async function getSlashCmds() {
    try {
        logger.info('registering slash cmds')
        // required functions before register slash cmds 
        await setupExchangeSync()
        return commands
    } catch (err) {
        logger.error(`regiester slash cmds error: ${err}`)
    }
}

async function handleGetJPYExchange(interacrtion: ChatInputCommandInteraction<CacheType>) {
    // fetch current fx 
    const args = interacrtion.options.data;
    const modifiedArgs = args.reduce<Record<string, string | boolean | number>>((pre, cur) => {
        return (cur.value === null || cur.value === undefined) ? pre : {
            ...pre,
            [cur.name]: cur.value
        }
    }, {});
    const { is_from_jpy = true, target = 'TWD', unit = 1 } = modifiedArgs as {
        is_from_jpy: boolean,
        target: string,
        unit: number
    };
    const targetCurrency = target.toUpperCase() as keyof typeof FXNameMapping;
    const targetCurName = FXNameMapping[targetCurrency];
    // https://api.currencyapi.com/v3/latest?apikey=the_key&currencies=TWD%2CHKD%2CMYR&base_currency=JPY
    try {
        const fileData = JSON.parse(readFileSync(filePath, 'utf8')) as CurrenciesResponse;
        const exchangeRate = fileData.data[targetCurrency]?.value;
        const outputUnit = is_from_jpy ? (unit * exchangeRate).toFixed(2) : (unit / exchangeRate).toFixed(2)
        interacrtion.reply(`${unit} ${is_from_jpy ? "日幣" : targetCurName}換算 ${outputUnit} ${is_from_jpy ? targetCurName : "日幣"}`)
    } catch (err) {
        logger.error(`err: ${err}`)
    }
}

export async function handleSlashCmds(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.commandName === CmdName.GET_JPY_EXCHANGE) {
        await handleGetJPYExchange(interaction)
    }
}

