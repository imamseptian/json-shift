export const LLM_MODEL_OPTIONS = {
  gemini : ["gemini-pro", "gemini-1.5-flash"],
  groq   : ["mixtral-8x7b-32768"],
};

export type LLMProvider = "gemini" | "groq";

export type LLMModel = "gemini-pro" | "gemini-1.5-flash" | "mixtral-8x7b-32768";

export const DEFAULT_LLM_MODEL = "mixtral-8x7b-32768";

export const MAX_CONTEXT_LENGTH = 15000;
export const REDIS_EXPIRATION_TIME = 3600;
