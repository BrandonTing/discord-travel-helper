import { setupExchangeSync } from "./utils/syncExchange";
import { logger } from "../utils/logger";

export async function preCmdFunctions() {
    try {
        await setupExchangeSync()
    } catch (err) {
        logger.error(`[execute pre cmds functions] error: ${err}`)
    }
}