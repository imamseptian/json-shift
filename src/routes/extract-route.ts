import { extractController } from "@/controllers/extract-controller";
import RequestTimeoutError from "@/errors/request-timeout-error";
import { limiterMiddleware } from "@/middlewares/rate-limiter-middleware";
import { Context, Hono } from "hono";

const extractRoute = new Hono();

const TIMEOUT_DURATION = 30 * 1000;

extractRoute.use("*", limiterMiddleware);

/**
 * Handle POST requests to /extract endpoint
 * @param {Context} c - The Hono context
 * @returns {Promise<Response>} JSON response with extraction results or error
 */
extractRoute.post("/", async (c: Context) => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new RequestTimeoutError("Request timeout after 30 seconds"));
    }, TIMEOUT_DURATION);
  });

  try {
    const result = await Promise.race([
      extractController.scrape(c),
      timeoutPromise,
    ]);
    return result;
  } catch (error) {
    if (error instanceof RequestTimeoutError) {
      return c.json(
        {
          code  : "REQUEST_TIMEOUT",
          title : "Request Timeout",
          message:
            "The request took too long to process. Please try again later.",
        },
        504,
      );
    }
    throw error;
  }
});

export default extractRoute;
