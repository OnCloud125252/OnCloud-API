import { MiddlewareConsumer, Module } from "@nestjs/common";
import { StatusMonitorModule } from "@ntlib/status-monitor-nestjs";

import { HttpLoggerMiddleware } from "modules/nestjs/middlewares/HttpLoggerMiddleware";
import { AppController } from "./app.controller";
import { GoogleModule } from './google/google.module';

@Module({
  imports: [
    StatusMonitorModule.forRoot({
      title: "NestJS Status",
      path: "/status",
      socketPath: "/socket.io",
      port: null,
      spans: [
        {
          interval: 1,
          retention: 60,
        },
        {
          interval: 5,
          retention: 60,
        },
        {
          interval: 15,
          retention: 60,
        },
        {
          interval: 60,
          retention: 60,
        },
      ],
      chartVisibility: {
        cpu: true,
        mem: true,
        load: true,
        responseTime: true,
        rps: true,
        statusCodes: true,
      },
      ignoreStartsWith: ["/admin"],
      healthChecks: [],
    }),
    GoogleModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes("*");
  }
}
