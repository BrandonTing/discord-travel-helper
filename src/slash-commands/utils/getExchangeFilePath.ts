import { existsSync, mkdir } from "fs";
import path from "path";
import { logger } from "../../utils/logger";

export const dataFolder = path.join(__dirname, '..', '..', 'data');
if (!existsSync(dataFolder)) {
    mkdir(dataFolder, (err) => {
        if (err) {
            logger.error(err)
        }
        console.log('Directory created successfully!');
    });
}
export const filePath = path.join(dataFolder, 'exchange.json')
