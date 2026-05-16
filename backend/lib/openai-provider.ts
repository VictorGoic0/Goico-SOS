import { createOpenAI } from "@ai-sdk/openai";
import { config } from "./config";

export const openai = createOpenAI({ apiKey: config.OPENAI_API_KEY });
