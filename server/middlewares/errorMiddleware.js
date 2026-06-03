const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  // Handle ErrorResponse instances first (use their toJSON() method)
  if (res.headersSent) {
    console.error('Headers already sent - cannot send error response!');
    return next(err); // Delegate to Express default handler
  }

  // Handle ErrorResponse
  if (err instanceof ErrorResponse) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Default error structure
  let errorResponse = {
    success: false,
    statusCode: err.statusCode || 500,
    error: 'login.errors.serverError', // Default translation key
    errorType: 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  };

  // Specialized error handling (your existing logic)
  switch (true) {
    case err.name === 'JsonWebTokenError':
      Object.assign(errorResponse, {
        statusCode: 401,
        error: 'auth.errors.invalidToken',
        errorType: 'INVALID_TOKEN'
      });
      break;

    case err.name === 'TokenExpiredError':
      Object.assign(errorResponse, {
        statusCode: 401,
        error: 'auth.errors.tokenExpired',
        errorType: 'TOKEN_EXPIRED'
      });
      break;

    case err.code === 'ER_DUP_ENTRY':
      Object.assign(errorResponse, {
        statusCode: 400,
        error: 'register.errors.phoneExists',
        errorType: 'DUPLICATE_ENTRY'
      });
      break;

    case err.code === 'LIMIT_FILE_SIZE':
      Object.assign(errorResponse, {
        statusCode: 400,
        error: 'upload.errors.fileTooLarge',
        errorType: 'FILE_SIZE_LIMIT'
      });
      break;

    case err.name === 'ValidationError':
      Object.assign(errorResponse, {
        statusCode: 400,
        error: 'validation.errors.invalidData',
        errorType: 'VALIDATION_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
          details: Object.values(err.errors).map(e => e.message)
        })
      });
      break;

    // Add other custom error cases as needed
  }

  // Development-only details
  if (process.env.NODE_ENV === 'development') {
    errorResponse = {
      ...errorResponse,
      stack: err.stack,
      ...(err.sql && { sql: err.sql, sqlMessage: err.sqlMessage }),
      ...(err.details && { originalDetails: err.details })
    };
  }
  // Final response
  res.status(errorResponse.statusCode).json(errorResponse);
};

module.exports = errorHandler;