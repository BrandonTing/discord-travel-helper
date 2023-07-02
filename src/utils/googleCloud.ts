import { Translate } from "@google-cloud/translate/build/src/v2";
import { env } from "./env";

const projectId = env.GOOGLE_CLOUD_PROJECT_ID;

// Instantiates a client
export const translate = new Translate({ projectId, key: env.GOOGLE_CLOUD_KEY });

