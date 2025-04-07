import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { cyan, green, magenta, red, yellow } from "colors";
import { NextFunction, Request, Response } from "express";
import DeviceDetector from "node-device-detector";

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
  deviceTrusted: false,
  deviceInfo: false,
  maxUserAgentSize: 500,
});

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const userAgent = request.get("user-agent") || "unknown";

    response.on("close", () => {
      const { statusCode } = response;

      const statusCodeString = String(statusCode);
      const coloredStatus = (() => {
        switch (true) {
          case statusCodeString.startsWith("1"):
          case statusCodeString.startsWith("2"):
          case statusCodeString.startsWith("3"):
            return green(statusCodeString);
          case statusCodeString.startsWith("4"):
            return yellow(statusCodeString);
          case statusCodeString.startsWith("5"):
            return red(statusCodeString);
          default:
            return red(statusCodeString);
        }
      })();

      const userAgentInfo = detector.detect(userAgent);
      const userAgentInfoString = (() => {
        const array: string[] = [];
        if (userAgentInfo.client.name) {
          array.push(
            `${userAgentInfo.client.name} ${userAgentInfo.client.type}`,
          );
        }

        if (userAgentInfo.os.name) {
          array.push(`${userAgentInfo.os.name} ${userAgentInfo.device.type}`);
        }

        if (!userAgentInfo.client.name && !userAgentInfo.os.name) {
          array.push("Unknown user agent");
        }

        return array.join(", ");
      })();

      this.logger.log(
        `${cyan(method)} ${coloredStatus} | ${magenta(url)} | [${yellow(ip)}] ${yellow(userAgentInfoString)}`,
      );
    });

    next();
  }
}
