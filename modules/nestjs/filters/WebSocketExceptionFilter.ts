import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

import { environmentVariable } from "modules/environmentVariable";
import { json } from "modules/json";
import { ClientError } from "../clientError";

@Catch()
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: ClientError | Error | WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    if (environmentVariable.app.environment() !== "production") {
      console.error(exception);
    }

    if ("__type__" in exception && exception.__type__ === "CLIENT_ERROR") {
      const { errorMessage, errorObject } = exception.payload;

      return client.emit("exception", {
        errorObject: json.toJson(errorObject, {
          preserve: {
            undefined: true,
            NaN: true,
          },
        }),
        errorMessage,
      });
    }

    return client.emit("exception", {
      errorMessage: "Unexpected error occurred. Please try again.",
    });
  }
}
