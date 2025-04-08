import { EnvKey, getEnv } from "./getEnv";

export const environmentVariable = {
  updateAt: () => new Date(Number(getEnv(EnvKey.ENV_UPDATE_AT))),
  app: {
    environment: () => getEnv(EnvKey.APP_ENVIRONMENT),
    listenPort: () => getEnv(EnvKey.APP_LISTEN_PORT),
    listenHost: () => getEnv(EnvKey.APP_LISTEN_HOST),
    accessToken: () => getEnv(EnvKey.APP_ACCESS_TOKEN),
  },
  google: {
    maps: {
      all: {
        apiKey: () => getEnv(EnvKey.GOOGLE_MAPS_API_KEY),
      },
    },
    calendar: {
      serviceAccountKeyFileContent: () =>
        JSON.parse(
          getEnv(EnvKey.GOOGLE_CALENDAR_API_SERVICE_ACCOUNT_KEY_FILE_CONTENT),
        ),
    },
  },
  openai: {
    apiKey: () => getEnv(EnvKey.OPENAI_API_KEY),
  },
};
