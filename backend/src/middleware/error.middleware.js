const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    requestId: req.requestId || null,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
      error: err.name,
    }),
  });
};

module.exports = errorHandler;
