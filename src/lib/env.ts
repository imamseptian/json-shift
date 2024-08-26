import { z } from "zod";

const envSchema = z.object({
  // llm providers
  // https://console.groq.com/keys
  GROQ_API_KEY                     : z.string().min(1),
  // https://aistudio.google.com/app/apikey
  GOOGLE_AI_STUDIO_API_KEY         : z.string().min(1),
  // embedding, get from https://dashboard.cohere.com/api-keys
  COHERE_API_KEY                   : z.string().min(1),
  // upstash vectorstore, get from https://console.upstash.com/
  UPSTASH_VECTOR_REST_URL          : z.string().url(),
  UPSTASH_VECTOR_REST_TOKEN        : z.string().min(1),
  // upstash redis, get from https://console.upstash.com/
  UPSTASH_REDIS_REST_URL           : z.string().url(),
  UPSTASH_REDIS_REST_TOKEN         : z.string().min(1),
  // just put random string or generate with command `openssl rand -base64 32`
  CLEAR_UPSTASH_VECTOR_STORE_TOKEN : z.string().min(1),
  BASE_URL                         : z.string().url(),
  NODE_ENV                         : z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .default("development"),
});
export const env = envSchema.parse(process.env);
