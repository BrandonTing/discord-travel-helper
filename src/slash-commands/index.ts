import { REST, Routes, ChatInputCommandInteraction, CacheType, RESTPutAPIApplicationCommandsJSONBody, ApplicationCommandOptionType } from 'discord.js'
import { logger } from '../utils/logger'
import { env } from '../utils/env'
import "@total-typescript/ts-reset"
import { CurrenciesResponse, CurrencyErrMsg } from '../type/exchange/currencies'
import { sampleCurrenciesResponse } from '../sampleData/currencies'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { CronJob } from 'cron';

const filePath = path.join(__dirname, '..', '..', 'data', 'exchange.json')

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
                name: 'target',
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

async function syncExchange() {
    if (!existsSync(path.join(__dirname, '..', '..', 'data', 'exchange.json'))) {
        logger.info('create initital data...')
        const currencyApiUrl = `https://api.currencyapi.com/v3/latest?apikey=${env.CURRENCY_KEY}&currencies=${encodeURIComponent(env.CURRENCIES)}&base_currency=JPY`
        try {
            const data = await (await fetch(currencyApiUrl)).json();
            writeFileSync(filePath, JSON.stringify(data));
        } catch (err) {
            logger.error(`init currency file failed: ${err}`)
        }
    } else {
        logger.info('fetch and compare last updated time')
        const fileData = JSON.parse(readFileSync(filePath, 'utf8')) as CurrenciesResponse;
        try {
            const currencyApiUrl = `https://api.currencyapi.com/v3/latest?apikey=${env.CURRENCY_KEY}&currencies=${encodeURIComponent(env.CURRENCIES)}&base_currency=JPY`
            const data = await (await fetch(currencyApiUrl)).json() as CurrencyErrMsg | CurrenciesResponse;
            if ("errors" in data) {
                logger.error(`轉換匯率錯誤：${Object.entries(data.errors).reduce((pre, cur) => {
                    return pre + `
                        ${cur[0]}: ${cur[1]}
                    `
                }, '')}`);
                return
            }
            if (fileData.meta.last_updated_at !== data.meta.last_updated_at) {
                writeFileSync(filePath, JSON.stringify(data));
            }
        } catch (err) {
            logger.error(`init currency file failed: ${err}`)
        }
    }
}

async function setupExchangeSync() {
    // 排程抓匯率存local
    if (!env.CALL_CURRENCY_API) {
        if (!existsSync(filePath)) {
            writeFileSync(filePath, JSON.stringify(sampleCurrenciesResponse));
        }
        return
    }
    await syncExchange()
    // create cron job
    const syncExhchangeJob = new CronJob(env.SYNC_EXCHANGE_CRON, async () => {
        await syncExchange()
    });
    syncExhchangeJob.start();
    logger.info(`sync exchange job started, cron: ${env.SYNC_EXCHANGE_CRON}`)
}

export async function registerSlashCmds() {
    try {
        logger.info('registering slash cmds')
        await setupExchangeSync()
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
        const outputUnit = is_from_jpy ? Math.floor(unit * exchangeRate) : Math.floor(unit / exchangeRate)
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

