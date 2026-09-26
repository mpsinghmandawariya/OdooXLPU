const errorHandler = (error, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, error);

  const statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.code === "P2002") {
    message = "A record with this value already exists";
  }

  if (error.code === "P2025") {
    message = "Requested record was not found";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = errorHandler;
