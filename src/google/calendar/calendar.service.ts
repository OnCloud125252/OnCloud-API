import { Injectable } from "@nestjs/common";

import { GoogleCalendarService } from "modules/google/calendarService";

@Injectable()
export class CalendarService {
  private googleCalendarService = new GoogleCalendarService();
  private availableCalendars = {
    "Alex Liao": "anonymousaaaa41414141@gmail.com",
    Activity:
      "90df395ea7caf5f8f232f06452e4c29e2b2424ea73755d3b41f942ef517236c7@group.calendar.google.com",
    Commute:
      "9f1fdac8e9ef6e089d7e47b5ecca231be166f470bc74e737edaa80cf3615f054@group.calendar.google.com",
    "Competition / Exam":
      "092821ce7bfe1d28decefd3490ea315f006a6c1058c3b7a98eafcdfbcefe028e@group.calendar.google.com",
    Photography:
      "941a2300e476bd7cfa9d51442b4cfe3ae25fb15f48df3087623cd920e5f749c3@group.calendar.google.com",
    明道畢聯會:
      "470b8e72acdb00e4b3d39ba588e86db2702ae9183763bdd8a0001af5533b6958@group.calendar.google.com",
    麥噹噹:
      "d4229fa031fb7b2472baac43572f9e65e12a6b39e5505ff045ecf66f8714e006@group.calendar.google.com",
  };

  async getTodayEvents() {
    const todayDate = new Date();
    const todayStart = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate(),
      0,
      0,
      0,
    );
    const todayEnd = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate(),
      23,
      59,
      59,
    );

    const eventList = await this.getAllCalendars({
      availableCalendars: this.availableCalendars,
      timeMin: todayStart,
      timeMax: todayEnd,
    });

    return {
      currentDate: new Date().toISOString(),
      timeRange: {
        title: "tomorrow",
        start: todayStart.toISOString(),
        end: todayEnd.toISOString(),
      },
      eventList: eventList
        .map((event) => ({
          calendarCategory: event.calendarName,
          title: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
        }))
        .sort(
          (a, b) =>
            new Date(a.start?.dateTime || a.start?.date).getTime() -
            new Date(b.start?.dateTime || b.start?.date).getTime(),
        ),
    };
  }

  async getTomorrowEvents() {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStart = new Date(
      tomorrowDate.getFullYear(),
      tomorrowDate.getMonth(),
      tomorrowDate.getDate(),
      0,
      0,
      0,
    );
    const tomorrowEnd = new Date(
      tomorrowDate.getFullYear(),
      tomorrowDate.getMonth(),
      tomorrowDate.getDate(),
      23,
      59,
      59,
    );

    const eventList = await this.getAllCalendars({
      availableCalendars: this.availableCalendars,
      timeMin: tomorrowStart,
      timeMax: tomorrowEnd,
    });

    return {
      currentDate: new Date().toISOString(),
      timeRange: {
        title: "tomorrow",
        start: tomorrowStart.toISOString(),
        end: tomorrowEnd.toISOString(),
      },
      eventList: eventList
        .map((event) => ({
          calendarCategory: event.calendarName,
          title: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
        }))
        .sort(
          (a, b) =>
            new Date(a.start?.dateTime || a.start?.date).getTime() -
            new Date(b.start?.dateTime || b.start?.date).getTime(),
        ),
    };
  }

  async getUpcomingWeekEvents() {
    const todayDate = new Date();
    const weekStart = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate(),
      0,
      0,
      0,
    );
    const weekEnd = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() + 7,
      23,
      59,
      59,
    );

    const eventList = await this.getAllCalendars({
      availableCalendars: this.availableCalendars,
      timeMin: weekStart,
      timeMax: weekEnd,
    });

    return {
      currentDate: new Date().toISOString(),
      timeRange: {
        title: "upcoming week",
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      },
      eventList: eventList
        .map((event) => ({
          calendarCategory: event.calendarName,
          title: event.summary,
          description: event.description,
          start: event.start,
          end: event.end,
        }))
        .sort(
          (a, b) =>
            new Date(a.start?.dateTime || a.start?.date).getTime() -
            new Date(b.start?.dateTime || b.start?.date).getTime(),
        ),
    };
  }

  private async getAllCalendars({
    availableCalendars,
    timeMin,
    timeMax,
  }: {
    availableCalendars: Record<string, string>;
    timeMin: Date;
    timeMax: Date;
  }) {
    const calendarPromises = Object.entries(availableCalendars).map(
      async ([calendarName, calendarId]) => {
        const events = await this.googleCalendarService.listEvents({
          calendarId,
          timeMin,
          timeMax,
        });

        return events.map((event) => ({
          ...event,
          calendarName,
        }));
      },
    );

    const calendarResults = await Promise.all(calendarPromises);
    return calendarResults
      .flat()
      .sort(
        (a, b) =>
          new Date(a.start?.dateTime || a.start?.date).getTime() -
          new Date(b.start?.dateTime || b.start?.date).getTime(),
      );
  }
}
