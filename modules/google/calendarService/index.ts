import { format, toZonedTime } from "date-fns-tz";
import { google, calendar_v3 } from "googleapis";
import { JWT } from "google-auth-library";

import { environmentVariable } from "modules/environmentVariable";
import { ClientError } from "modules/nestjs/clientError";

type CalendarServiceConfig = {
  timezone: string;
};

export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private timezone: string;

  constructor(config?: CalendarServiceConfig) {
    const keyFile =
      environmentVariable.google.calendar.serviceAccountKeyFileContent();

    const jwtClient = new JWT({
      email: keyFile.client_email,
      key: keyFile.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    this.calendar = google.calendar({ version: "v3", auth: jwtClient });
    this.timezone = config?.timezone || "Asia/Taipei";
  }

  /**
   * List upcoming events from the calendar
   * @param options Configuration options
   * @param options.calendarId Calendar ID to use (overrides default if provided)
   * @param options.maxResults Maximum number of events to return
   * @returns Promise resolving to array of calendar events
   */
  async listEvents(options: {
    calendarId: string;
    query?: string;
    timeMin: Date;
    timeMax: Date;
    maxResults?: number;
  }): Promise<calendar_v3.Schema$Event[]> {
    const calendarId = options.calendarId;
    if (!calendarId) {
      throw new ClientError({ errorMessage: "Calendar ID is required." });
    }

    const { timeMin, timeMax } = getTimeRange({
      startDate: options.timeMin,
      endDate: options.timeMax,
      timezone: this.timezone,
    });

    try {
      const response = await this.calendar.events.list({
        calendarId,
        q: options.query,
        timeMin,
        timeMax,
        timeZone: this.timezone,
        maxResults: options.maxResults || 250,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items || [];
    } catch (_error) {
      throw new ClientError({ errorMessage: "Error listing calendar events." });
    }
  }

  /**
   * Create a new event on the calendar
   * @param event Event details
   * @param calendarId Calendar ID to use (overrides default if provided)
   * @returns Promise resolving to the created event
   */
  async createEvent(
    event: {
      summary: string;
      description?: string;
      start: Date;
      end: Date;
      location?: string;
    },
    calendarId?: string,
  ): Promise<calendar_v3.Schema$Event> {
    const targetCalendarId = calendarId;
    if (!targetCalendarId) {
      throw new ClientError({ errorMessage: "Calendar ID is required." });
    }

    try {
      const response = await this.calendar.events.insert({
        calendarId: targetCalendarId,
        requestBody: {
          summary: event.summary,
          description: event.description,
          location: event.location,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: this.timezone,
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: this.timezone,
          },
        },
      });

      return response.data;
    } catch (_error) {
      throw new ClientError({ errorMessage: "Error creating calendar event." });
    }
  }

  /**
   * Update an existing event
   * @param eventId ID of the event to update
   * @param updates Event fields to update
   * @param calendarId Calendar ID to use (overrides default if provided)
   * @returns Promise resolving to the updated event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<{
      summary: string;
      description: string;
      start: Date;
      end: Date;
      location: string;
    }>,
    calendarId?: string,
  ): Promise<calendar_v3.Schema$Event> {
    const targetCalendarId = calendarId;
    if (!targetCalendarId) {
      throw new ClientError({ errorMessage: "Calendar ID is required." });
    }

    try {
      const event = await this.calendar.events.get({
        calendarId: targetCalendarId,
        eventId,
      });

      const updatedEvent: calendar_v3.Schema$Event = { ...event.data };

      if (updates.summary) {
        updatedEvent.summary = updates.summary;
      }
      if (updates.description) {
        updatedEvent.description = updates.description;
      }
      if (updates.location) {
        updatedEvent.location = updates.location;
      }

      if (updates.start) {
        updatedEvent.start = {
          dateTime: updates.start.toISOString(),
          timeZone: this.timezone,
        };
      }

      if (updates.end) {
        updatedEvent.end = {
          dateTime: updates.end.toISOString(),
          timeZone: this.timezone,
        };
      }

      const response = await this.calendar.events.update({
        calendarId: targetCalendarId,
        eventId,
        requestBody: updatedEvent,
      });

      return response.data;
    } catch (_error) {
      throw new ClientError({ errorMessage: "Error updating calendar event." });
    }
  }

  /**
   * Delete an event from the calendar
   * @param eventId ID of the event to delete
   * @param calendarId Calendar ID to use (overrides default if provided)
   * @returns Promise resolving when deletion is complete
   */
  async deleteEvent(eventId: string, calendarId?: string): Promise<void> {
    const targetCalendarId = calendarId;
    if (!targetCalendarId) {
      throw new ClientError({ errorMessage: "Calendar ID is required." });
    }

    try {
      await this.calendar.events.delete({
        calendarId: targetCalendarId,
        eventId,
      });
    } catch (_error) {
      throw new ClientError({ errorMessage: "Error deleting calendar event." });
    }
  }

  /**
   * Get available calendars for the authenticated account
   * @returns Promise resolving to array of calendars
   */
  // async listCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
  //   try {
  //     const response = await this.calendar.calendarList.list();
  //     return response.data.items || [];
  //   } catch (_error) {
  //     throw new ClientError({ errorMessage: "Error listing calendars." });
  //   }
  // }
}

function getTimeRange(options: {
  startDate: Date;
  endDate: Date;
  timezone?: string | "local";
}): {
  timeMin: string;
  timeMax: string;
} {
  const startDate = options.startDate;
  const endDate = options.endDate;
  const timezone = options.timezone || "local";

  let formattedStartDate: string;
  let formattedEndDate: string;

  if (timezone === "local") {
    const tzOffset = -startDate.getTimezoneOffset();
    const tzOffsetHours = Math.floor(Math.abs(tzOffset) / 60);
    const tzOffsetMinutes = Math.abs(tzOffset) % 60;
    const tzSign = tzOffset >= 0 ? "+" : "-";
    const tzString = `${tzSign}${tzOffsetHours.toString().padStart(2, "0")}:${tzOffsetMinutes
      .toString()
      .padStart(2, "0")}`;

    formattedStartDate = formatDateToRFC3339(startDate, tzString);
    formattedEndDate = formatDateToRFC3339(endDate, tzString);
  } else {
    const offsetMatch = timezone.match(/^([+-])(\d+)$/);

    if (offsetMatch) {
      const [, sign, hours] = offsetMatch;
      const tzString = `${sign}${hours.padStart(2, "0")}:00`;

      formattedStartDate = formatDateToRFC3339(startDate, tzString);
      formattedEndDate = formatDateToRFC3339(endDate, tzString);
    } else {
      try {
        const zonedStartDate = toZonedTime(startDate, timezone);
        const zonedEndDate = toZonedTime(endDate, timezone);

        formattedStartDate = format(
          zonedStartDate,
          "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
          { timeZone: timezone },
        );
        formattedEndDate = format(
          zonedEndDate,
          "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
          { timeZone: timezone },
        );
      } catch (error) {
        throw new Error(
          `Invalid timezone format. Expected an IANA timezone identifier like "Asia/Taipei", a simple offset like "+8", "-5", or "local". Error: ${error.message}`,
        );
      }
    }
  }

  return {
    timeMin: formattedStartDate,
    timeMax: formattedEndDate,
  };
}

function formatDateToRFC3339(date: Date, tzString: string): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}T${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}${tzString}`;
}
