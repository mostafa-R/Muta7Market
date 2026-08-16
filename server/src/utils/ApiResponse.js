export class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null && data !== undefined) this.data = data;
    if (meta) this.meta = meta;
  }

  static ok(message, data, meta) {
    return new ApiResponse(200, message, data, meta);
  }

  static created(message, data) {
    return new ApiResponse(201, message, data);
  }

  static noContent(message = '') {
    return new ApiResponse(204, message);
  }
}
