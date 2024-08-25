/**
 * Custom error for request timeout
 */
export default class RequestTimeoutError extends Error {
  code: string;
  /**
   * @param {string} message - The error message
   */
  constructor(message: string) {
    super(message);
    this.name = "RequestTimeoutError";
    this.code = "REQUEST_TIMEOUT";
  }
}
