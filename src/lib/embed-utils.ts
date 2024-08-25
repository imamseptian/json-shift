import { AttributeType } from "@/schemas/template-schema";
import { CohereEmbeddings } from "@langchain/cohere";
import { UpstashVectorStore } from "@langchain/community/vectorstores/upstash";
import type { Document } from "@langchain/core/documents";
import { Index } from "@upstash/vector";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { formatDocumentsAsString } from "langchain/util/document";
import { v4 as uuidv4 } from "uuid";
import { env } from "./env";
import {
  Content,
  formatContentForLangChain,
  GroupedContent,
} from "./web-scraper";

/**
 * Configuration for the embeddings model.
 */
const EMBEDDINGS_CONFIG = {
  apiKey: env.COHERE_API_KEY,
  batchSize: 48,
  model: "embed-multilingual-v3.0",
};

/**
 * Configuration for the text splitter.
 */
const TEXT_SPLITTER_CONFIG = {
  chunkSize: 2000,
  chunkOverlap: 200,
};

/**
 * Creates and configures the embeddings model.
 */
const embeddings = new CohereEmbeddings(EMBEDDINGS_CONFIG);

/**
 * Creates and configures the Upstash index.
 */
const indexWithCredentials = new Index({
  url: env.UPSTASH_VECTOR_REST_URL,
  token: env.UPSTASH_VECTOR_REST_TOKEN,
});

/**
 * Creates and configures the vector store.
 */
const vectorStore = new UpstashVectorStore(embeddings, {
  index: indexWithCredentials,
});

/**
 * Processes and splits documents into chunks.
 * @param contents - The grouped content to process.
 * @param url - The source URL of the content.
 * @returns An array of processed and split documents.
 */
async function processDocuments(
  contents: GroupedContent[],
  url: string
): Promise<Document[]> {
  const textSplitter = new RecursiveCharacterTextSplitter(TEXT_SPLITTER_CONFIG);

  const splitDocuments = await Promise.all(
    contents.map(async (content) => {
      const contentString = formatContentForLangChain(content.blocks);
      const document: Document = {
        pageContent: contentString,
        metadata: { source: url, group_id: content.group_id },
      };
      return textSplitter.splitDocuments([document]);
    })
  );

  return splitDocuments.flat();
}

/**
 * Embeds and stores grouped web content.
 * @param contents - The grouped content to embed and store.
 * @param url - The source URL of the content.
 * @returns An array of stored document IDs.
 */
export async function embedAndStoreGroupedWebContent(
  contents: GroupedContent[],
  url: string
): Promise<string[]> {
  const groupedDocuments = await processDocuments(contents, url);
  return vectorStore.addDocuments(groupedDocuments, {
    ids: groupedDocuments.map(() => uuidv4()),
  });
}

/**
 * Embeds and stores web content.
 * @param contents - The content to embed and store.
 * @param url - The source URL of the content.
 * @returns An array of stored document IDs.
 */
export async function embedAndStoreWebContent(
  contents: Content[],
  url: string
): Promise<string[]> {
  const context = formatContentForLangChain(contents);
  const textSplitter = new RecursiveCharacterTextSplitter(TEXT_SPLITTER_CONFIG);

  const document: Document = {
    pageContent: context,
    metadata: { source: url },
  };
  const splitDocuments = await textSplitter.splitDocuments([document]);

  return vectorStore.addDocuments(splitDocuments, {
    ids: splitDocuments.map(() => uuidv4()),
  });
}

/**
 * Retrieves similar context based on given attributes.
 * @param url - The source URL to filter results.
 * @param attributes - The attributes to base the similarity search on.
 * @returns A string of similar context.
 */
export async function retrieveSimilarContext(
  url: string,
  attributes: AttributeType[]
): Promise<string> {
  const filter = `source = '${url}'`;
  const query = attributes
    .map((attribute) => `${attribute.name}: ${attribute.description}`)
    .join(", ");

  const similaritySearchResults = await vectorStore.similaritySearch(
    query,
    10,
    filter
  );

  return formatDocumentsAsString(similaritySearchResults);
}

/**
 * Deletes stored documents by their IDs.
 * @param ids - An array of document IDs to delete.
 */
export async function deleteStoredDocuments(ids: string[]): Promise<void> {
  if (ids.length > 0) {
    await vectorStore.delete({ ids });
  }
}

/**
 * Deletes all stored documents.
 */
export async function deleteAllStoredDocuments(): Promise<void> {
  await vectorStore.delete({ deleteAll: true });
}
