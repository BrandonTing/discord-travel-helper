import { ApplicationCommandType, MessageContextMenuCommandInteraction, RESTPutAPIApplicationCommandsJSONBody } from "discord.js";
import { logger } from "../../utils/logger";
import { translate } from "../../utils/googleCloud";
import { toRomaji } from 'wanakana';
enum CmdName {
    TRANSLATE_TO_JP = '翻譯至日文',
    TRANSLATE_FROM_JP_TO_ZHTW = '日文翻譯至繁體中文'
}

const commands = [
    {
        name: CmdName.TRANSLATE_TO_JP,
        type: ApplicationCommandType.Message
    },
    {
        name: CmdName.TRANSLATE_FROM_JP_TO_ZHTW,
        type: ApplicationCommandType.Message
    }

] satisfies RESTPutAPIApplicationCommandsJSONBody

export function getMsgContextCmds() {
    try {
        logger.info('registering msg menu cmds')
        // required functions before register msg menu cmds
        // await setupExchangeSync()
        return commands
    } catch (err) {
        logger.error(`regiester msg menu cmds error: ${err}`)
    }
}

async function handleTranslateToJP(interacrtion: MessageContextMenuCommandInteraction) {
    const content = interacrtion.targetMessage.content
    try {
        const [translation] = await translate.translate(content, 'ja');
        // 把日文轉羅馬拼音
        const targetRomaji = toRomaji(translation)
        interacrtion.reply(`
            ${translation}(${targetRomaji})
        `)
    } catch (err) {
        logger.error(`[google clound translate] translate to ja failed: ${err}`)
    }
}

async function handleTranslateFromJP(interacrtion: MessageContextMenuCommandInteraction) {
    const content = interacrtion.targetMessage.content
    try {
        const [translation] = await translate.translate(content, 'zh-TW');
        interacrtion.reply(translation)
    } catch (err) {
        logger.error(`[google clound translate] translate to zh-tw failed: ${err}`)
    }
}


export async function handleMsgContextMenuCmds(interaction: MessageContextMenuCommandInteraction) {
    if (interaction.commandName === CmdName.TRANSLATE_TO_JP) {
        await handleTranslateToJP(interaction)
    }
    if (interaction.commandName === CmdName.TRANSLATE_FROM_JP_TO_ZHTW) {
        await handleTranslateFromJP(interaction)
    }
}