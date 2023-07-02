import { ApplicationCommandType, MessageContextMenuCommandInteraction, RESTPutAPIApplicationCommandsJSONBody } from "discord.js";
import { logger } from "../utils/logger";
import { openai } from "../utils/openai";

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
        // FIXME always return 429
        const translateResponse = await openai.createCompletion({
            model: "gpt-3.5-turbo",
            prompt: `Translate this into Japanese:\n\n${content}\n\n`,
            temperature: 0.3,
            max_tokens: 100,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });
        logger.info(translateResponse.data);
    } catch (err) {
        logger.error(`[openai] translate failed: ${err}`)
    }
}

export async function handleMsgContextMenuCmds(interaction: MessageContextMenuCommandInteraction) {
    if (interaction.commandName === CmdName.TRANSLATE_TO_JP) {
        await handleTranslateToJP(interaction)
    }
}