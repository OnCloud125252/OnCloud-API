import {
  ValidationError,
  ValidationPipe as _ValidationPipe,
} from "@nestjs/common";

import { ClientError } from "modules/nestjs/clientError";

export const ValidationPipe = new _ValidationPipe({
  exceptionFactory: (errors) => {
    processError(errors);
  },
});

function processError(errors: ValidationError[]) {
  const error = errors[errors.length - 1];

  if (error.constraints) {
    throw new ClientError({
      errorObject: {
        [error.property]: error.value ?? "undefined",
      },
      errorMessage: error.constraints?.[Object.keys(error.constraints).at(-1)],
    });
  } else if (error.children) {
    processError(error.children);
  }
}
