export interface ExecutionTime {
  scrapeExecutionTime: string | null | undefined;
  embeddingTime: string | null | undefined;
  llmProcessingTime: string | null | undefined;
}
export function ExecutionTimeResult({
  executionTime,
}: {
  executionTime: ExecutionTime;
}) {
  return (
    <div>
      { executionTime?.scrapeExecutionTime && (
        <p className="text-sm font-bold">
          Scrape Execution Time:
          { ' ' }
          { executionTime.scrapeExecutionTime }
        </p>
      ) }
      { executionTime?.embeddingTime && (
        <p className="text-sm font-bold">
          Embedding Execution Time:
          { ' ' }
          { executionTime.embeddingTime }
        </p>
      ) }
      { executionTime?.llmProcessingTime && (
        <p className="text-sm font-bold">
          LLM Processing Time:
          { ' ' }
          { executionTime.llmProcessingTime }
        </p>
      ) }
    </div>
  );
}
