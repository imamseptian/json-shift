import { env } from "@/lib/env";
import { rateLimiter } from "hono-rate-limiter";

export const limiterMiddleware = rateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  limit: 10, // Limit each IP to 10 requests per 1 minute window.
  standardHeaders: "draft-6", // Use draft-6 RateLimit headers
  keyGenerator: (c) => "user",
  // // in case want to limit by IP
  // keyGenerator: (c) => {
  //   const info = getConnInfo(c);
  //   return info.remote.address || "unknown";
  // },
  skip: (c) => env.NODE_ENV === "development",
  handler: (c) =>
    c.json(
      {
        code: "TOO_MANY_REQUESTS",
        title: "Too Many Requests",
        message: "Too many requests, please try again later.",
      },
      429
    ),
});
