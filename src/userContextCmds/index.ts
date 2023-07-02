import { ApplicationCommandType, RESTPutAPIApplicationCommandsJSONBody } from "discord.js";
import { logger } from "../utils/logger";

enum CmdName {
    GET_BOOKMARKED_MSGS = 'Get Personal Recommands'
}

const commands = [
    {
        name: CmdName.GET_BOOKMARKED_MSGS,
        type: ApplicationCommandType.User
    }
] satisfies RESTPutAPIApplicationCommandsJSONBody

export function getUserContextCmds() {
    try {
        logger.info('registering user context cmds')
        // required functions before register slash cmds 
        // await setupExchangeSync()
        return commands
    } catch (err) {
        logger.error(`regiester user context cmds error: ${err}`)
    }

}