class ErrorHandler extends Error {
  public status: number;
  public errors: Error[];

  constructor(
    status: number,
    message: string,
    errors: Error[] = []
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ErrorHandler(401, 'User not authorized');
  }

  static BadRequest(message: string, errors: Error[] = []) {
    return new ErrorHandler(400, message, errors);
  }

  static NotFoundError(message: string) {
    return new ErrorHandler(404, message);
  }
}

export default ErrorHandler;
