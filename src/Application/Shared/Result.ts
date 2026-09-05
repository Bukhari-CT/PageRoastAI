import { HttpMessages, HttpStatus, HttpStatusCodes } from "./HttpConstants";

type ResultBody = unknown;

export class Result {
  readonly statusCode: number;
  readonly body: ResultBody;

  constructor(statusCode: number, body: ResultBody) {
    this.statusCode = statusCode;
    this.body = body;
  }

  static create(statusCode: number, body: ResultBody) {
    return new Result(statusCode, body);
  }

  static ok(body: ResultBody) {
    return new Result(HttpStatusCodes.OK, body);
  }

  static created(body: ResultBody) {
    return new Result(HttpStatusCodes.CREATED, body);
  }

  static noContent() {
    return new Result(HttpStatusCodes.NO_CONTENT, HttpStatus.EMPTY);
  }

  static error(body: Record<string, unknown>) {
    return new Result(HttpStatusCodes.ERROR, { status: HttpStatus.ERROR, ...body });
  }

  static notAuthorized(body: Record<string, unknown>) {
    return new Result(HttpStatusCodes.NOT_AUTHORIZED, {
      status: HttpStatus.ERROR,
      ...body,
    });
  }

  static forbidden(body: Record<string, unknown>) {
    return new Result(HttpStatusCodes.FORBIDDEN, {
      status: HttpStatus.ERROR,
      ...body,
    });
  }

  static notFound(body: Record<string, unknown>) {
    return new Result(HttpStatusCodes.NOT_FOUND, {
      status: HttpStatus.ERROR,
      ...body,
    });
  }

  static gone(body: Record<string, unknown>) {
    return new Result(HttpStatusCodes.GONE, {
      status: HttpStatus.ERROR,
      ...body,
    });
  }

  static conflict(body?: Record<string, unknown>) {
    return new Result(HttpStatusCodes.CONFLICT, {
      status: HttpStatus.ERROR,
      message: HttpMessages.ALREADY_EXISTS,
      ...body,
    });
  }
}
