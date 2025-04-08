import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

import { dynamicRoute } from "modules/nestjs/dynamicRoute";
import { sendJsonResponse } from "modules/nestjs/sendResponse";
import { CalendarService } from "./calendar.service";

// @UseGuards(AuthGuard)
@Controller(dynamicRoute.create())
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get("get-today-events")
  async getTodayEvents(@Res() response: Response) {
    const eventList = await this.calendarService.getTodayEvents();

    const aiAgentResponse =
      await this.calendarService.getAiAgentResponse(eventList);

    return sendJsonResponse(response, aiAgentResponse, {
      customDataKey: "aiAgentResponse",
    });
  }

  @Get("get-tomorrow-events")
  async getTomorrowEvents(@Res() response: Response) {
    const eventList = await this.calendarService.getTomorrowEvents();

    const aiAgentResponse =
      await this.calendarService.getAiAgentResponse(eventList);

    return sendJsonResponse(response, aiAgentResponse, {
      customDataKey: "aiAgentResponse",
    });
  }

  @Get("get-upcoming-week-events")
  async getUpcomingWeekEvents(@Res() response: Response) {
    const eventList = await this.calendarService.getUpcomingWeekEvents();

    const aiAgentResponse =
      await this.calendarService.getAiAgentResponse(eventList);

    return sendJsonResponse(response, aiAgentResponse, {
      customDataKey: "aiAgentResponse",
    });
  }
}
