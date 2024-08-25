import { MAX_CONTEXT_LENGTH } from "./constants";

/**
 * Truncate string to prevent exceeding LLM token limit
 * @param {string} str - The input string to truncate
 * @returns {string} Truncated string
 */
export function truncateString(str: string): string {
  return str.length > MAX_CONTEXT_LENGTH
    ? str.substring(0, MAX_CONTEXT_LENGTH)
    : str;
}

export function removeExtraWhitespace(str: string) {
  return str.split(/\s+/).filter(Boolean).join(" ");
}

// export function countStringTokens(str: string) {
//   const tokenizer = new GPT4Tokenizer({ type: "gpt3" }); // or 'codex'
//   const estimatedTokenCount = tokenizer.estimateTokenCount(str); // 7

//   return estimatedTokenCount;
// }
