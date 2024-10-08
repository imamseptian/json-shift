import { Context } from "hono";

import ValidationError from "@/errors/validation-error";
import { DEFAULT_LLM_MODEL } from "@/lib/constants";
import { getContext } from "@/lib/context-utils";
import { deleteStoredDocuments } from "@/lib/embed-utils";
import { setupLangChain } from "@/lib/langchain-setup";
import { measureExecutionTime } from "@/lib/time-utils";
import { Template, TemplateSchema } from "@/schemas/template-schema";
import { z, ZodError } from "zod";

const TemplateSchemaWithRequiredId = TemplateSchema.extend({
  id          : z.string().min(1, "ID is required"),
  ignoreCache : z.boolean().optional(),
  model       : z.string().optional(),
});

export const extractController = {
  scrape: async (c: Context) => {
    const { model = DEFAULT_LLM_MODEL, ignoreCache, ...restTemplate } = await c.req.json();

    // combine later with model and ignore cahce
    try {
      TemplateSchemaWithRequiredId.parse({
        ignoreCache,
        model,
        ...restTemplate,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError("Invalid template input", error.errors);
      }
      throw error;
    }

    const template = restTemplate as Template;

    const scrapeStartTime = Date.now();

    try {
      const {
        scrapeExecutionTime, embeddingTime, context, storedDocumentIds,
      } =        await getContext({ ignoreCache: ignoreCache as boolean, ...template });

      const llmProcessingStartTime = Date.now();
      const chain                  = setupLangChain(template.attributes, model);
      const answer                 = await chain.invoke({ context });
      const llmProcessingTime      = measureExecutionTime(llmProcessingStartTime);

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
      // eslint-disable-next-line no-console
      console.error("Error in extractHandler:", error);
      const errorMessage =        error instanceof Error ? error.message : "An unexpected error occurred";
      return c.json(
        {
          error          : errorMessage,
          processingTime : measureExecutionTime(scrapeStartTime),
        },
        { status: 500 },
      );
    }
  },
};
