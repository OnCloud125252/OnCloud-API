import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

import { environmentVariable } from "modules/environmentVariable";

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const badRequestError = exception;
    const errorResponse = badRequestError.getResponse();

    if (environmentVariable.app.environment() !== "production") {
      console.error(exception);
    }

    if (
      typeof errorResponse === "object" &&
      "message" in errorResponse &&
      errorResponse.message === "Unexpected field"
    ) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        errorMessage: "Failed to upload file.",
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errorMessage: "Unexpected error occurred. Please try again.",
    });
  }
}
