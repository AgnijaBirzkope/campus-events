import { AppError } from '../errors/AppError.mjs';

const issueDetails = (issues) => issues.map((issue) => ({
  field: issue.path.join('.') || 'body',
  message: issue.message
}));

export const validate = (schema, source) => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', issueDetails(result.error.issues)));
  }
  req.validated ??= {};
  req.validated[source] = result.data;
  next();
};
