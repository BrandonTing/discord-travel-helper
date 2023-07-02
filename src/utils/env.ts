import { str, envsafe, port, bool, } from 'envsafe';

export const env = envsafe({
    NODE_ENV: str({
        devDefault: 'dev',
        choices: ['dev', 'test', 'production'],
    }),
    PORT: port({
        devDefault: 3000,
        desc: 'The port the app is running on',
        example: 80,
    }),
    // add discord keys
    DISCORD_BOT_TOKEN: str({
        desc: 'DISCORD Application 的token'
    }),
    DISCORD_BOT_CLIENT_ID: str({
        desc: 'ID of bot'
    }),
    CALL_CURRENCY_API: bool({
        desc: '是否實際呼叫currencyapi'
    }),
    CURRENCY_KEY: str({
        desc: 'key used to call api from https://app.currencyapi.com/'
    }),
    CURRENCIES: str({
        desc: '要知道匯率的貨幣代碼們'
    }),
    SYNC_EXCHANGE_CRON: str({
        desc: '排程同步匯率資料的時間'
    }),
});
