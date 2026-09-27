/**
 * Uniform, stack-trace-free error handling for the API.
 */

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.expose = true;
  }
}

export function notFoundHandler(message = 'Not found.') {
  return (_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', message));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let code = 'SERVER_ERROR';
  let message = 'Something went wrong on our side. Please try again.';

  if (err instanceof ApiError) {
    status = err.status;
    code = err.code;
    message = err.message;
  } else if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    status = 400;
    code = 'MALFORMED_REQUEST';
    message = 'The request body could not be parsed.';
  } else if (err?.status === 413 || err?.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'The request payload is too large.';
  }

  // Never leak stack traces or upstream implementation details.
  if (status >= 500) {
    console.error(`[${code}]`, err?.message || err);
  }

  res.status(status).json({
    success: false,
    error: { code, message },
  });
}
