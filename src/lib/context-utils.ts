import { Redis } from "@upstash/redis";

import { MAX_CONTEXT_LENGTH, REDIS_EXPIRATION_TIME } from "@/lib/constants";
import {
  embedAndStoreGroupedWebContent,
  embedAndStoreWebContent,
  retrieveSimilarContext,
} from "@/lib/embed-utils";
import { env } from "@/lib/env";
import { delay, measureExecutionTime } from "@/lib/time-utils";
import {
  Content,
  extractContentsFromWeb,
  extractGroupedContentFromWeb,
  GroupedContent,
} from "@/lib/web-scraper";
import { AttributeType } from "@/schemas/template-schema";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL!,
  token: env.UPSTASH_REDIS_REST_TOKEN!,
});

const generateRedisKey = (uuid: string, url: string): string => {
  return `${uuid}-${url}`;
};

export async function getContext({
  id = "sadasd",
  url,
  attributes,
  isGroupScraping = true,
  ignoreCache = false,
}: {
  id?: string;
  url: string;
  attributes: AttributeType[];
  isGroupScraping?: boolean;
  ignoreCache?: boolean;
}) {
  const redisKey = generateRedisKey(id, url);

  // Check Redis cache
  if (!ignoreCache) {
    const cachedContext = await redis.get(redisKey);
    if (cachedContext) {
      return {
        scrapeExecutionTime: 0,
        embeddingTime: 0,
        context: cachedContext as string,
        storedDocumentIds: [],
      };
    }
  }

  // Scrape web content
  const scrapeStartTime = Date.now();
  const contents = isGroupScraping
    ? await extractGroupedContentFromWeb(url)
    : await extractContentsFromWeb(url);
  const scrapeExecutionTime = measureExecutionTime(scrapeStartTime);

  if (!contents) {
    throw new Error("Failed to extract contents from the webpage");
  }

  // Embed and store content
  const embeddingStartTime = Date.now();
  const storedDocumentIds = isGroupScraping
    ? await embedAndStoreGroupedWebContent(contents as GroupedContent[], url)
    : await embedAndStoreWebContent(contents as Content[], url);

  await delay(1000);
  const context = await retrieveSimilarContext(
    url,
    attributes as AttributeType[]
  );
  const embeddingTime = measureExecutionTime(embeddingStartTime);

  // Clean and truncate context
  const cleanedContext = context.replace(/\s+/g, " ").trim();
  const truncatedContext = truncateString(cleanedContext);

  // Cache the context
  await redis.set(redisKey, truncatedContext);
  await redis.expire(redisKey, REDIS_EXPIRATION_TIME);

  return {
    scrapeExecutionTime,
    embeddingTime,
    context: truncatedContext,
    storedDocumentIds,
  };
}

/**
 * Truncate string to prevent exceeding LLM token limit
 * @param {string} str - The input string to truncate
 * @returns {string} Truncated string
 */
function truncateString(str: string): string {
  return str.length > MAX_CONTEXT_LENGTH
    ? str.substring(0, MAX_CONTEXT_LENGTH)
    : str;
}
