import { existsSync, readFileSync, writeFileSync } from "fs";
import { filePath } from "./getExchangeFilePath";
import { logger } from "../../utils/logger";
import { CurrenciesResponse, CurrencyErrMsg } from "../../type/exchange/currencies";
import { env } from "../../utils/env";
import { sampleCurrenciesResponse } from "../../sampleData/currencies";
import { CronJob } from "cron";

async function syncExchange() {
    if (!existsSync(filePath)) {
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

export async function setupExchangeSync() {
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