import { readFileSync } from "node:fs";
import { NestExpressApplication } from "@nestjs/platform-express";
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";
import { urlJoin } from "url-join-ts";

const SWAGGER_BASE_PATH = urlJoin("api-document");
const CUSTOM_CSS_STRING = "";

export function swaggerSetup(app: NestExpressApplication) {
  const packageJson = JSON.parse(readFileSync("./package.json").toString());

  const swaggerDocumentConfig = new DocumentBuilder()
    .setTitle("PickTrip API Document")
    .setDescription("This is document for PickTrip API.")
    .setVersion(packageJson.version)
    .addTag("Backend")
    .build();

  const swaggerDocumentFactory = SwaggerModule.createDocument(
    app,
    swaggerDocumentConfig,
  );

  const swaggerTheme = new SwaggerTheme();
  const swaggerOptions: SwaggerCustomOptions = {
    customCss: `${swaggerTheme.getBuffer(SwaggerThemeNameEnum.ONE_DARK)}\n${CUSTOM_CSS_STRING}`,
    customSiteTitle: "PickTrip API Document",
    // customfavIcon: urlJoin("e4d093daa553260f"),
    jsonDocumentUrl: urlJoin(SWAGGER_BASE_PATH, "json"),
    yamlDocumentUrl: urlJoin(SWAGGER_BASE_PATH, "yaml"),
  };

  return SwaggerModule.setup(
    SWAGGER_BASE_PATH,
    app,
    swaggerDocumentFactory,
    swaggerOptions,
  );
}
