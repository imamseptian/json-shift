import { Context } from "hono";

import ValidationError from "@/errors/validation-error";
import { getContext } from "@/lib/context-utils";
import { deleteStoredDocuments } from "@/lib/embed-utils";
import { setupLangChain } from "@/lib/langchain-setup";
import { measureExecutionTime } from "@/lib/time-utils";
import { Template, TemplateSchema } from "@/schemas/template-schema";
import { z, ZodError } from "zod";

const TemplateSchemaWithRequiredId = TemplateSchema.extend({
  id: z.string().min(1, "ID is required"),
});

export const extractController = {
  scrape: async (c: Context) => {
    const { model, ignoreCache, ...restTemplate } = await c.req.json();

    // combine later with model and ignore cahce
    try {
      TemplateSchemaWithRequiredId.parse(restTemplate);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError("Invalid template input", error.errors);
      }
      throw error;
    }

    const template = restTemplate as Template;

    const scrapeStartTime = Date.now();

    try {
      const { scrapeExecutionTime, embeddingTime, context, storedDocumentIds } =
        await getContext({ ignoreCache: ignoreCache as boolean, ...template });

      const llmProcessingStartTime = Date.now();
      const chain = setupLangChain(template.attributes, model);
      const answer = await chain.invoke({ context });
      const llmProcessingTime = measureExecutionTime(llmProcessingStartTime);

      await deleteStoredDocuments(storedDocumentIds);

      return c.json({
        answer,
        context,
        scrapeExecutionTime,
        embeddingTime,
        llmProcessingTime,
        storedDocumentIds,
      });
    } catch (error) {
      console.error("Error in extractHandler:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      return c.json(
        {
          error: errorMessage,
          processingTime: measureExecutionTime(scrapeStartTime),
        },
        { status: 500 }
      );
    }
  },
};
