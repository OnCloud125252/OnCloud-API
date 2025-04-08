import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

import { dynamicRoute } from "modules/nestjs/dynamicRoute";
import { sendResponse } from "modules/nestjs/sendResponse";
import { CalendarService } from "./calendar.service";

// @UseGuards(AuthGuard)
@Controller(dynamicRoute.create())
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get("get-today-events")
  async getTodayEvents(@Res() response: Response) {
    const eventList = await this.calendarService.getTodayEvents();

    return sendResponse(response, eventList);
  }

  @Get("get-tomorrow-events")
  async getTomorrowEvents(@Res() response: Response) {
    const eventList = await this.calendarService.getTomorrowEvents();

    return sendResponse(response, eventList);
  }

  @Get("get-upcoming-week-events")
  async getUpcomingWeekEvents(@Res() response: Response) {
    const eventList = await this.calendarService.getUpcomingWeekEvents();

    return sendResponse(response, eventList);
  }
}
