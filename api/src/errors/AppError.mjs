export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (id) => new AppError(404, 'NOT_FOUND', `Event with id ${id} not found`);
export const conflict = (message) => new AppError(409, 'CONFLICT', message);
