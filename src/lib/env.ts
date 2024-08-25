import { z } from "zod";

const envSchema = z.object({
  // llm providers
  GROQ_API_KEY: z.string().min(1),
  GOOGLE_AI_STUDIO_API_KEY: z.string().min(1),
  // embedding
  COHERE_API_KEY: z.string().min(1),
  // upstash vectorstore
  UPSTASH_VECTOR_REST_URL: z.string().url(),
  UPSTASH_VECTOR_REST_TOKEN: z.string().min(1),
  // upstash redis
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  CLEAR_UPSTASH_VECTOR_STORE_TOKEN: z.string().min(1),
  BASE_URL: z.string().url(),
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("testing"),
      z.literal("production"),
    ])
    .default("development"),
});
export const env = envSchema.parse(process.env);
