import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { LLM_MODEL_OPTIONS } from "./constants";
import { env } from "./env";

/**
 * Type for supported LLM models
 */
type SupportedModel =
  (typeof LLM_MODEL_OPTIONS)[keyof typeof LLM_MODEL_OPTIONS][number];

/**
 * Mapping of providers to their respective model creation functions
 */
const MODEL_CREATORS = {
  groq: (model: string) =>
    new ChatGroq({
      apiKey: env.GROQ_API_KEY,
      modelName: model,
    }),
  gemini: (model: string) =>
    new ChatGoogleGenerativeAI({
      apiKey: env.GOOGLE_AI_STUDIO_API_KEY,
      modelName: model,
    }),
};

/**
 * Gets the appropriate LLM model instance based on the provided model name.
 *
 * @param model - The name of the model to instantiate
 * @returns An instance of the specified LLM model
 * @throws Error if the model provider is unknown
 */
export function getModel(model: SupportedModel) {
  const provider = Object.entries(LLM_MODEL_OPTIONS).find(([, models]) =>
    models.includes(model)
  )?.[0] as keyof typeof MODEL_CREATORS | undefined;

  if (!provider || !(provider in MODEL_CREATORS)) {
    throw new Error(`Unknown model provider for model: ${model}`);
  }

  return MODEL_CREATORS[provider](model);
}
