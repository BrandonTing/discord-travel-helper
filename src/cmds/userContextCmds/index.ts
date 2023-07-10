import { ApplicationCommandType, RESTPutAPIApplicationCommandsJSONBody, UserContextMenuCommandInteraction } from "discord.js";
import { logger } from "../../utils/logger";
import { getExchange } from "../utils/syncExchange";

enum CmdName {
    GET_REALTIME_JPY_TO_TWD_EXCHANGE = '取得目前日幣對台幣匯率'
}

const commands = [
    {
        name: CmdName.GET_REALTIME_JPY_TO_TWD_EXCHANGE,
        type: ApplicationCommandType.User
    }
] satisfies RESTPutAPIApplicationCommandsJSONBody

export function getUserContextCmds() {
    try {
        logger.info('registering user context cmds')
        return commands
    } catch (err) {
        logger.error(`regiester user context cmds error: ${err}`)
    }
}

function getRealtimeJPYToTWDExchangeHandler(interacrtion: UserContextMenuCommandInteraction) {
    const exchangeRate = getExchange('TWD');
    interacrtion.reply(`目前1日圓兌換${exchangeRate.toFixed(3)}新台幣`)
}

export async function handlerUserContextCmds(interacrtion: UserContextMenuCommandInteraction) {
    if (interacrtion.commandName === CmdName.GET_REALTIME_JPY_TO_TWD_EXCHANGE) {
        getRealtimeJPYToTWDExchangeHandler(interacrtion)
    }
}