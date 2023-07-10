import { ApplicationCommandType, MessageContextMenuCommandInteraction, RESTPutAPIApplicationCommandsJSONBody } from "discord.js";
import { logger } from "../../utils/logger";
import { translate } from "../../utils/googleCloud";
import { toKatakana, toRomaji } from 'wanakana';
import { kuromojiBuilder } from "../utils/koromoji";

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
    const content = interacrtion.targetMessage.content;
    const [translation] = await translate.translate(content, 'ja');

    try {
        // 把日文轉羅馬拼音
        kuromojiBuilder.build(function (err, tokenizer) {
            if (err) throw err;

            // Tokenize the Kanji text
            const tokens = tokenizer.tokenize(translation);

            const romaji = tokens.map(token => toRomaji(token.reading || token.surface_form)).join(' ')

            interacrtion.reply(`${translation}(${romaji})`)
        })
    } catch (err) {
        logger.error(`[google clound translate] translate to ja failed: ${err}`)
        interacrtion.reply('[google clound translate] translate to ja failed')
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