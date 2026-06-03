class ErrorResponse extends Error {
  constructor(message, statusCode, errorType = 'API_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Distinguishes operational errors from programming errors

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  // Predefined common error types as static methods
  static badRequest(message, details) {
    return new ErrorResponse(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ErrorResponse(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new ErrorResponse(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new ErrorResponse(message, 404, 'NOT_FOUND');
  }

  static conflict(message = 'Conflict occurred') {
    return new ErrorResponse(message, 409, 'CONFLICT');
  }

  static validationError(message = 'Validation failed', details) {
    return new ErrorResponse(message, 422, 'VALIDATION_ERROR', details);
  }

  static internalError(message = 'Internal server error') {
    return new ErrorResponse(message, 500, 'INTERNAL_ERROR');
  }

  // Format the error for API response
  toJSON() {
    return {
      success: false,
      error: this.message,
      errorType: this.errorType,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

module.exports = ErrorResponse;