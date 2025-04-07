import { environmentVariable } from "modules/environmentVariable";
import { bootstrap } from "modules/nestjs/bootstrap";

const { loadEnv, checkEnv, app } = bootstrap;

if (environmentVariable.app.environment() !== "production") {
  loadEnv();
}

(async () => {
  checkEnv();

  app();
})();

process
  .on("uncaughtException", (error) => {
    console.error(error);
  })
  .on("unhandledRejection", (error) => {
    console.error(error);
  });
