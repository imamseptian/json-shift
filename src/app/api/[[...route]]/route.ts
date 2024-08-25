import { Context, Hono } from "hono";

import RequestTimeoutError from "@/errors/request-timeout-error";
import ValidationError from "@/errors/validation-error";
import { env } from "@/lib/env";
import extractRoute from "@/routes/extract-route";
import vectorStoreRoute from "@/routes/vectorstore-routes";
import { cors } from "hono/cors";
import { StatusCode } from "hono/utils/http-status";
import { handle } from "hono/vercel";

/**
 * Set maximum duration for serverless function
 */
export const maxDuration = 60;

/**
 * Initialize Hono app with base path
 */
const app = new Hono().basePath("/api");

app.use(
  "/api/*",
  cors({
    origin: env.NODE_ENV === "production" ? env.BASE_URL : "*",
    allowMethods: ["POST", "GET", "OPTIONS"],
    maxAge: 600,
    credentials: true,
  })
);

const errorResponse = (c: Context, status: StatusCode, error: any) => {
  return c.json(
    {
      code: error?.code || "INTERNAL_SERVER_ERROR",
      title: error.name.replace(/([A-Z])/g, " $1").trim(),
      message: error.message,
      details: error.details,
    },
    status
  );
};

/**
 * Global error handler
 * @param {Error} err - The error object
 * @param {Context} c - The Hono context
 * @returns {Response} JSON response with error details
 */
app.onError((err, c) => {
  if (err instanceof ValidationError) {
    return errorResponse(c, 422, err);
  }
  if (err instanceof RequestTimeoutError) {
    return errorResponse(c, 504, err);
  }
  return errorResponse(c, 500, new Error("Internal Server Error"));
});

app.route("/extract", extractRoute);
app.route("/vectorstore", vectorStoreRoute);

export const GET = handle(app);
export const POST = handle(app);
