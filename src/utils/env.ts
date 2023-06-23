import { str, envsafe, port, } from 'envsafe';

export const env = envsafe({
    NODE_ENV: str({
        devDefault: 'development',
        choices: ['development', 'test', 'production'],
    }),
    PORT: port({
        devDefault: 3000,
        desc: 'The port the app is running on',
        example: 80,
    }),
    // TODO add discord keys
    DISCORD_BOT_TOKEN: str({
        desc: 'DISCORD Application 的token'
    }),
    DISCORD_BOT_CLIENT_ID: str({
        desc: 'ID of bot'
    }),
    CURRENCY_KEY: str({
        desc: 'key used to call api from https://app.currencyapi.com/'
    }),
    CURRENCIES: str({
        desc: '要知道匯率的貨幣代碼們'
    })
});
