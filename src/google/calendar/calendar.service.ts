import { Injectable } from "@nestjs/common";

import { GoogleCalendarService } from "modules/google/calendarService";
import { OpenAI } from "modules/openai";

@Injectable()
export class CalendarService {
  private timezone = "Asia/Taipei";
  private googleCalendarService = new GoogleCalendarService({
    timezone: this.timezone,
  });
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
    麥噹勞:
      "d4229fa031fb7b2472baac43572f9e65e12a6b39e5505ff045ecf66f8714e006@group.calendar.google.com",
  };
  private readonly openai = new OpenAI({
    systemMessageGenerator: () =>
      `你是一位專業的個人助理，負責整理並摘要用戶的 Google Calendar 日程安排。請用溫暖友善的繁體中文回覆，遵循以下格式：

1. 開始以簡短、自然的問候語開場（例如：「早安！」、「午安！」、「晚安！」、「您好！」等，請根據用戶當前時間來調整問候語），並提及今天的日期和星期幾。

2. 提供時間範圍的總覽（例如：「今天」、「明天」、「接下來一週」等）。

3. 列出該時間範圍內的所有事件，按照日期和時間順序組織，並使用 Markdown 格式適當分段：
   - 使用 \`#\` 表示日期（例如：\`# 4月8日（星期二）\`）
   - 使用 \`##\` 表示事件時間和標題（例如：\`## 09:00-10:30 週會\`）
   - 事件描述和詳情放在標題下方，無需額外格式

4. 事件顯示規則：
   - 事件時間格式為「HH:MM-HH:MM」
   - 全天事件顯示為「全天」，而非時間範圍
   - 週一至週五標記為平日，週六、週日標記為週末
   - 如果有重複事件，在事件標題後加註「(每週/每月/每日)」
   - 使用 🔴 標記高優先級或重要事件（如果事件標題為重要的事項）
   - 如果有地點資訊，以「📍 地點：xxx」的格式展示，使用你所知道的地名
   - 如果有參與者資訊，以「👥 參與者：xxx, xxx」的格式展示（限制在 3 人以內，超過則顯示「及 X 人」）
   - 如果有事件描述，以「📝 筆記：xxx」的格式展示
   - 不必幫所有事件都提供描述，只需提供有意義的資訊即可
   - 跨天事件在標題處標明持續時間，如「## 09:00-次日15:00 研討會（持續 2 天）」

5. 特殊情況處理：
   - 如果發現時間衝突（兩個事件時間重疊），在衝突的事件標題後標記「⚠️ 時間衝突」
   - 如果當天沒有安排，請以輕鬆的語氣告知用戶「這天沒有安排的事件，可以享受輕鬆的一天」
   - 如果 JSON 數據不完整或缺少某些欄位，仍然顯示可用的資訊，並忽略缺失的部分

6. 時區處理：
   - 默認使用用戶當地時區顯示時間
   - 如果事件時區與用戶當地時區不同，在時間後標註時區（例如：「## 21:00-22:00 (EST) 國際會議」）

7. 結尾添加一句簡短、積極的鼓勵或提醒，避免過於公式化，可根據日程內容做適當調整（例如，如果日程很忙，可以鼓勵休息；如果日程較空，可以建議利用時間做些有意義的事）。

你將收到以下 JSON 格式的數據：
\`\`\`json
{
  data: {
    currentDate: "當前日期時間",
    timezone: "用戶當地時區",
    timeRange: {
      description: "時間範圍描述",
      start: "查詢的起始日期時間",
      end: "查詢的結束日期時間",
    },
    eventList: [
      {
        calendarCategory: "行事曆類別",
        title: "事件標題",
        description: "事件描述", // 可能為空
        location: "事件地點", // 可能為空
        attendees: ["參與者1", "參與者2"], // 可能為空或不存在
        isAllDay: true/false, // 表示是否為全天事件，可能不存在
        start: "起始日期時間",
        end: "結束日期時間",
      },
      // 更多事件...
    ],
  }
}
\`\`\`

請使用這些資料生成一個簡潔、易讀且資訊豐富的日程摘要。摘要應該幫助用戶快速了解他們的日程安排，並突出重要事項。請確保你的回應風格友善、專業且有幫助。請不要在結尾問我有沒有其他需要。

範例回應：
\`\`\`
早安！今天是星期二（4月8日）。

以下是您未來三天的行程安排：

# 今天 - 4月8日（星期二）
## 08:30-10:00 部門週會
討論本週工作重點和項目進度。
👥 參與者：李主管、王經理及 5 人

## 12:00-13:30 與客戶午餐會議 🔴
📍 地點：城市中心希爾頓酒店二樓
討論新合約細節，需準備季度報告。

## 15:00-16:30 團隊培訓（每週）
本週主題：高效溝通技巧。

# 明天 - 4月9日（星期三）
## 全天 季度財報準備
需要完成所有部門的數據整合。

## 14:00-15:30 產品發布會議 ⚠️ 時間衝突
📍 地點：線上會議
產品部將展示新功能。

## 14:00-16:00 客戶投訴處理會議 ⚠️ 時間衝突
需要準備上個月的客戶反饋數據。

# 4月10日（星期四）
## 09:00-次日15:00 行業研討會（持續 2 天）
📍 地點：國際會展中心
主題：數位轉型與未來趨勢。

今天的行程看起來相當充實！別忘了在會議之間給自己一些短暫的休息時間。
\`\`\``,
  });

  async getAiAgentResponse(eventList: object) {
    const aiAgentResponse = await this.openai.chat([
      {
        role: "user",
        content: `以下是真實的行事曆資料:
   \`\`\`json
   ${JSON.stringify(eventList)}
   \`\`\``,
      },
    ]);

    return aiAgentResponse[aiAgentResponse.length - 1].content;
  }

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
      currentDate: new Date().toLocaleString("zh-TW", {
        timeZone: this.timezone,
      }),
      timeRange: {
        description: "today",
        start: todayStart.toLocaleString("zh-TW", {
          timeZone: this.timezone,
        }),
        end: todayEnd.toLocaleString("zh-TW", {
          timeZone: this.timezone,
        }),
      },
      eventList,
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
      currentDate: new Date().toLocaleString("zh-TW", {
        timeZone: this.timezone,
      }),
      timezone: this.timezone,
      timeRange: {
        description: "tomorrow",
        start: tomorrowStart.toLocaleString("zh-TW", {
          timeZone: this.timezone,
        }),
        end: tomorrowEnd.toLocaleString("zh-TW", {
          timeZone: this.timezone,
        }),
      },
      eventList,
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
      currentDate: new Date().toLocaleString("zh-TW", {
        timeZone: this.timezone,
      }),
      timeRange: {
        description: "upcoming week",
        start: weekStart.toLocaleString("zh-TW", {
          timeZone: this.timezone,
        }),
        end: weekEnd.toLocaleString("zh-TW", {
          timeZone: this.timezone,
        }),
      },
      eventList,
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
      .map((event) => ({
        calendarCategory: event.calendarName,
        title: event.summary,
        description: event.description,
        location: event.location,
        attendees: event.attendees,
        isAllDay: !!event.start.date,
        start: new Date(
          event.start.dateTime || event.start.date,
        ).toLocaleString("zh-TW", {
          timeZone: this.timezone,
        }),
        end: new Date(event.end.dateTime || event.end.date).toLocaleString(
          "zh-TW",
          {
            timeZone: this.timezone,
          },
        ),
      }))
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }
}
