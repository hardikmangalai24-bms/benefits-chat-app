/**
 * Application error codes and messages
 * Used for consistent error handling across API routes and client
 */

export interface AppErrorType {
  code: string;
  message: string;
  status: number;
}

export const AppError = {
  // File validation errors
  FILE_TOO_LARGE: {
    code: "FILE_TOO_LARGE",
    message: "PDF must be under 50MB",
    status: 413,
  },
  NOT_PDF: {
    code: "NOT_PDF",
    message: "Only PDF files are supported",
    status: 400,
  },

  // PDF processing errors
  NO_TEXT: {
    code: "NO_TEXT",
    message:
      "Could not extract text — PDF may be scanned/image-only. Try a text-based PDF.",
    status: 422,
  },
  NO_SECTIONS: {
    code: "NO_SECTIONS",
    message: "Document structure could not be identified",
    status: 422,
  },
  EXTRACTION_FAILED: {
    code: "EXTRACTION_FAILED",
    message: "Failed to extract document content",
    status: 500,
  },

  // AI service errors
  AI_UNAVAILABLE: {
    code: "AI_UNAVAILABLE",
    message: "AI service temporarily unavailable",
    status: 503,
  },
  AI_RATE_LIMIT: {
    code: "AI_RATE_LIMIT",
    message: "Rate limit reached — retrying in a moment...",
    status: 429,
  },
  AI_TIMEOUT: {
    code: "AI_TIMEOUT",
    message: "AI request timed out — please try again",
    status: 504,
  },

  // Document session errors
  DOCUMENT_NOT_FOUND: {
    code: "DOCUMENT_NOT_FOUND",
    message: "Document session expired — please re-upload",
    status: 404,
  },

  // Streaming errors
  STREAM_INTERRUPTED: {
    code: "STREAM_INTERRUPTED",
    message: "Response was cut off — please try again",
    status: 500,
  },
  STREAM_TIMEOUT: {
    code: "STREAM_TIMEOUT",
    message: "No response received — connection may have timed out",
    status: 504,
  },

  // Benefit extraction errors
  BENEFIT_EXTRACTION_PARTIAL: {
    code: "BENEFIT_EXTRACTION_PARTIAL",
    message:
      "Benefit extraction had issues — you can still ask questions manually",
    status: 206,
  },
  BENEFIT_EXTRACTION_FAILED: {
    code: "BENEFIT_EXTRACTION_FAILED",
    message: "Could not extract benefits — document loaded for manual queries",
    status: 500,
  },

  // Generic errors
  INVALID_REQUEST: {
    code: "INVALID_REQUEST",
    message: "Invalid request parameters",
    status: 400,
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    status: 500,
  },
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Network error — please check your connection",
    status: 0,
  },
} as const;

/**
 * Create an error response object
 */
export function createErrorResponse(
  error: AppErrorType,
  details?: string
): { error: string; code: string; details?: string } {
  return {
    error: error.message,
    code: error.code,
    ...(details && { details }),
  };
}

/**
 * Check if error is a specific app error
 */
export function isAppError(error: any, errorType: AppErrorType): boolean {
  return error?.code === errorType.code;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (error?.code && error?.message) {
    return error.message;
  }
  if (error?.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return AppError.INTERNAL_ERROR.message;
}

// Made with Bob
