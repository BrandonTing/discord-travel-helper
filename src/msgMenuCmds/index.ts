import { ApplicationCommandType, MessageContextMenuCommandInteraction, RESTPutAPIApplicationCommandsJSONBody } from "discord.js";
import { logger } from "../utils/logger";
import { translate } from "../utils/googleCloud";

enum CmdName {
    TRANSLATE_TO_JP = 'translate to Japanese'
}

const commands = [
    {
        name: CmdName.TRANSLATE_TO_JP,
        type: ApplicationCommandType.Message
    }
] satisfies RESTPutAPIApplicationCommandsJSONBody

export function getMsgContextCmds() {
    try {
        logger.info('registering msg menu cmds')
        // required functions before register slash cmds 
        // await setupExchangeSync()
        return commands
    } catch (err) {
        logger.error(`regiester msg menu cmds error: ${err}`)
    }
}

export async function handleTranslateToJP(interacrtion: MessageContextMenuCommandInteraction) {
    const content = interacrtion.targetMessage.content
    try {
        const [translation] = await translate.translate(content, 'ja');
        interacrtion.reply(translation)
    } catch (err) {
        logger.error(`[openai] translate failed: ${err}`)
    }
}

export async function handleMsgContextMenuCmds(interaction: MessageContextMenuCommandInteraction) {
    if (interaction.commandName === CmdName.TRANSLATE_TO_JP) {
        await handleTranslateToJP(interaction)
    }
}