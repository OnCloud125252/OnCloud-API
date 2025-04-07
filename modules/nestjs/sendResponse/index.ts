import { HttpStatus } from "@nestjs/common";
import { Response } from "express";

export function sendResponse<T>(
  response: Response,
  data: T,
  options?: {
    customDataKey?: string;
    status?: HttpStatus;
  },
) {
  const { status = HttpStatus.OK, customDataKey } = options || {};

  const expressObject = response
    .status(status)
    .json({ [customDataKey?.trim() || "data"]: data });

  return {
    expressObject,
    data,
  };
}
