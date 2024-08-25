export default class ValidationError extends Error {
  details: any;
  code: string;
  constructor(message: string, details: any) {
    super(message);
    this.code = "VALIDATION_ERROR";
    this.name = "ValidationError";
    this.details = details;
  }
}
