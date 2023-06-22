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
    }),
    DISCORD_BOT_CLIENT_ID: str({
    }),
});
