import { HttpStatus } from "@nestjs/common";

/**
 * @description Define a error which will be sent to client
 * @class ClientError
 * @extends {Error}
 */
export class ClientError extends Error {
  __type__ = "CLIENT_ERROR";
  payload?: {
    errorObject?: object;
    errorMessage?: string;
  };
  code: HttpStatus;

  constructor(
    payload?: {
      errorObject?: object;
      errorMessage?: string;
    },
    code?: HttpStatus,
  ) {
    super();
    this.payload = { ...payload };
    this.code = code || HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
