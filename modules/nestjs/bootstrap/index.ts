import { readFileSync } from "node:fs";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { cyan, green, magenta, yellow } from "colors";
import { config as dotEnvConfig } from "dotenv";
import { json, urlencoded } from "express";

import { environmentVariable } from "modules/environmentVariable";
import { EnvKey, getEnv } from "modules/environmentVariable/getEnv";
import { GlobalExceptionFilter } from "modules/nestjs/filters/GlobalExceptionFilter";
import { ValidationPipe } from "modules/nestjs/pipes/classVerifier";
import { readableTime } from "modules/readableTime";
import { AppModule } from "src/app.module";
import { dynamicRoute } from "../dynamicRoute";
import { swaggerSetup } from "./swaggerSetup";

const logger = new Logger("Bootstrap");
const packageJson = JSON.parse(readFileSync("./package.json").toString());

export const bootstrap = {
  logger,

  app: async () => {
    const LISTEN_HOST = environmentVariable.app.listenHost() || "0.0.0.0";
    const LISTEN_PORT = environmentVariable.app.listenPort() || 3000;

    const startTime = Date.now();

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      cors: true,
    });
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(ValidationPipe);
    app.set("trust proxy", 1);
    app.use(json({ limit: "50mb" }));
    app.use(urlencoded({ extended: true, limit: "50mb" }));
    swaggerSetup(app);
    await app.listen(LISTEN_PORT, LISTEN_HOST);

    const endTime = Date.now();

    logger.log(
      `Created ${cyan(String(dynamicRoute.getRoutes().length))} ${green("routes")}${yellow(` +${endTime - startTime}ms`)}`,
    );

    logger.log(`Version:        ${cyan(`${packageJson.version}`)}`);
    logger.log(
      `Environment:    ${cyan(`${environmentVariable.app.environment()}`)}`,
    );
    logger.log(
      `Listening host: ${cyan(`${LISTEN_HOST}`)} ${yellow(environmentVariable.app.listenHost() ? "(env)" : "(default)")}`,
    );
    logger.log(
      `Listening port: ${cyan(`${LISTEN_PORT}`)} ${yellow(environmentVariable.app.listenPort() ? "(env)" : "(default)")}`,
    );
    logger.log(
      `Full URL:       ${magenta(`http://${LISTEN_HOST}:${LISTEN_PORT}`)}`,
    );
    logger.log(
      `Env updated at: ${magenta(`${readableTime.formatLocalDateTime(environmentVariable.updateAt()).string}`)}`,
    );
  },

  loadEnv: (path?: string | string[] | URL) => {
    try {
      const startTime = Date.now();

      dotEnvConfig({
        path,
      });

      const pathString = path
        ? Array.isArray(path)
          ? path.join(", ")
          : path.toString()
        : ".env";

      const endTime = Date.now();

      logger.log(
        `Environment variables loaded from ${magenta(pathString)}${yellow(` +${endTime - startTime}ms`)}`,
      );

      return true;
    } catch (_error) {
      logger.error("Failed to load environment variables");

      return false;
    }
  },

  checkEnv: () => {
    try {
      const startTime = Date.now();

      for (const key in EnvKey) {
        if (Object.prototype.hasOwnProperty.call(EnvKey, key)) {
          const value = getEnv(EnvKey[key]);
          if (!value) {
            logger.warn(`Failed to load environment ${cyan(key)}`);
          }
        }
      }

      const endTime = Date.now();

      logger.log(
        `Environment variables checked${yellow(` +${endTime - startTime}ms`)}`,
      );

      return true;
    } catch (_error) {
      logger.error("Failed to check environment variables");
      return false;
    }
  },
};
