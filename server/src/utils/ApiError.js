export class ApiError extends Error {
  constructor(statusCode, key, params = {}, message = '') {
    super(message || key);
    this.statusCode = statusCode;
    this.key = key;
    this.params = params;
    this.isOperational = true;
  }
}

export class ForbiddenError extends ApiError {
  constructor(key = 'common.forbidden', params = {}) {
    super(403, key, params);
  }
}

export class NotFoundError extends ApiError {
  constructor(key = 'common.notFound', params = {}) {
    super(404, key, params);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(key = 'auth.unauthorized', params = {}) {
    super(401, key, params);
  }
}
