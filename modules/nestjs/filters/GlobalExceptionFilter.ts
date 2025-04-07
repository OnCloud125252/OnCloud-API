import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

import { environmentVariable } from "modules/environmentVariable";
import { ClientError } from "modules/nestjs/clientError";
import { dynamicRoute } from "modules/nestjs/dynamicRoute";

@Catch(ClientError, Error)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: ClientError | Error, host: ArgumentsHost) {
    const httpHost = host.switchToHttp();

    const httpRequest = httpHost.getRequest<Request>();
    const httpResponse = httpHost.getResponse<Response>();

    if (environmentVariable.app.environment() !== "production") {
      console.error(exception);
    }

    switch (true) {
      case "__type__" in exception && exception.__type__ === "CLIENT_ERROR": {
        const clientError = exception as unknown as ClientError;

        return httpResponse.status(clientError.code).send({
          errorMessage: clientError.payload?.errorMessage,
          errorObject: clientError.payload?.errorObject,
        });
      }

      case exception.name === "NotFoundException": {
        if (dynamicRoute.getRoutes().includes(httpRequest.url)) {
          return httpResponse.status(HttpStatus.BAD_REQUEST).json({
            errorObject: {
              method: httpRequest.method,
            },
            errorMessage: "Invalid request method.",
          });
        }

        return httpResponse.status(HttpStatus.NOT_FOUND).json({
          errorObject: {
            url: httpRequest.url,
          },
          errorMessage: "Invalid request url.",
        });
      }
    }

    return httpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errorMessage: "Unexpected error occurred. Please try again.",
    });
  }
}
