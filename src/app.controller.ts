import { readFileSync } from "node:fs";
import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

import { dynamicRoute } from "modules/nestjs/dynamicRoute";
import { sendResponse } from "modules/nestjs/sendResponse";
import { readableTime } from "modules/readableTime";

dynamicRoute.setRootDir(__dirname);
@Controller(dynamicRoute.create())
export class AppController {
  private readonly packageJson = JSON.parse(
    readFileSync("./package.json").toString(),
  );

  @Get()
  async welcome(@Res() response: Response) {
    return sendResponse(response, {
      message: "Welcome to OnCloud API!",
      uptime: {
        value: process.uptime(),
        unit: "second",
        readable: readableTime.formatElapsedTime(process.uptime() * 1000)
          .string,
      },
      version: {
        current: this.packageJson.version,
      },
    });
  }
}
