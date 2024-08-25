import { deleteAllStoredDocuments } from "@/lib/embed-utils";
import { env } from "@/lib/env";
import { Context, Hono } from "hono";

const vectorStoreRoute = new Hono();

/**
 * Handle POST requests to clear-vectorstore endpoint
 * @param {Context} c - The Hono context
 * @returns {Promise<Response>} Text response indicating success or error
 * @throws {Error} If the access token is invalid
 */
vectorStoreRoute.post("clear", async (c: Context) => {
  const accessToken = c.req.header("accessToken");
  if (accessToken !== env.CLEAR_UPSTASH_VECTOR_STORE_TOKEN) {
    throw new Error("Unauthorized: Invalid access token");
  }

  await deleteAllStoredDocuments();
  return c.text("Vector store cleared successfully", { status: 200 });
});

export default vectorStoreRoute;
