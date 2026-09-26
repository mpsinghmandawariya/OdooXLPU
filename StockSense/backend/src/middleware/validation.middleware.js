const validationMiddleware = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      message: firstIssue.message,
    });
  }

  req.validatedBody = result.data;
  next();
};

module.exports = validationMiddleware;
