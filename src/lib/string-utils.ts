import { MAX_CONTEXT_LENGTH } from "./constants";

export function safeJSONParse(jsonString: string) {
  try {
    // First, try to parse the JSON as-is
    return JSON.parse(jsonString);
  } catch (error) {
    // If parsing fails, try to fix common issues
    try {
      // Replace escaped backslashes before quotes
      const fixedString = jsonString.replace(/\\"/g, '"');

      // Replace single backslashes that aren't followed by valid escape characters
      const validEscapes = ["b", "f", "n", "r", "t", '"', "\\", "/"];
      const furtherFixedString = fixedString.replace(
        /\\([^bfnrt"\\\/])/g,
        "$1"
      );

      // Try parsing again
      return JSON.parse(furtherFixedString);
    } catch (secondError) {
      // If it still fails, throw an error or handle it as needed
      console.error("Failed to parse JSON:", secondError);
      return null; // or throw new Error("Invalid JSON")
    }
  }
}

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
