// Centralized Express error handler
// Normalizes known error shapes and hides internal details in production

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;

  // eslint-disable-next-line no-console
  if (status >= 500) console.error('Unhandled error:', err);

  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      ...(details && { details }),
    },
  });
}



