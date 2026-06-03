// utils/errorResponse.js
export class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  
  export const handleServiceError = (error) => {
    // For errors that come from your service
    if (error instanceof ErrorResponse) {
      return {
        type: 'API_ERROR',
        message: error.message,
        status: error.statusCode
      };
    }
    console.log(statusCode)
    // For native JS errors
    return {
      type: 'CLIENT_ERROR',
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  };