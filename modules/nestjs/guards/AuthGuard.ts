import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Socket } from "socket.io";
import { Request } from "express";

import { environmentVariable } from "modules/environmentVariable";
import { ClientError } from "modules/nestjs/clientError";
import { handleRecursiveError } from "modules/nestjs/clientError/handleRecursiveError";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const httpRequest = context.switchToHttp().getRequest<Request>();
    const webSocketClient = context.switchToWs().getClient<Socket>();

    const isWebSocket = webSocketClient instanceof Socket;

    const authHeader = isWebSocket
      ? webSocketClient.handshake.headers.authorization
      : httpRequest.headers.authorization;

    this.verifyAuthHeader({ authHeader });

    return true;
  }

  private verifyAuthHeader({ authHeader }) {
    if (!authHeader) {
      throw new ClientError({
        errorObject: {
          expected: "Bearer <token>",
          received: authHeader,
        },
        errorMessage: "Missing authorization header.",
      });
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new ClientError({
        errorObject: {
          expected: "Bearer <token>",
          received: authHeader,
        },
        errorMessage: "Invalid token.",
      });
    }

    const token = authHeader.split(" ")[1];
    try {
      if (token !== environmentVariable.app.accessToken()) {
        throw new ClientError({ errorMessage: "Invalid token." });
      }
    } catch (error) {
      handleRecursiveError(error);

      throw new ClientError(
        {
          errorObject: { expected: "Bearer <token>", received: authHeader },
          errorMessage: "Invalid token.",
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
