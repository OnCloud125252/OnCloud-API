import _OpenAI from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";
import OpenCC from "opencc-js";

import { environmentVariable } from "modules/environmentVariable";
import { processChatCompletionMessages } from "modules/openai/functions/processChatCompletionMessages";
import { ToolBox } from "modules/openai/types/ToolBox";

export class OpenAI {
  private generateSystemMessage?: () => string;
  private responseFormat?: ChatCompletionCreateParamsBase["response_format"];
  private toolbox?: ToolBox;

  private readonly openai: _OpenAI = new _OpenAI({
    apiKey: environmentVariable.openai.apiKey(),
  });
  private readonly cnTwConverter = OpenCC.Converter({ from: "cn", to: "tw" });
  private onToolCallCallback?: (
    toolCall: ChatCompletionMessageToolCall,
  ) => void;
  private onToolCallResultCallback?: (
    toolCall: ChatCompletionMessageToolCall,
    toolCallResult: any,
  ) => void;

  constructor({
    systemMessageGenerator,
    responseFormat,
    toolbox,
  }: {
    currentTime?: Date;
    systemMessageGenerator?: () => string;
    responseFormat?: ChatCompletionCreateParamsBase["response_format"];
    toolbox?: ToolBox;
  } = {}) {
    this.generateSystemMessage = systemMessageGenerator;

    this.responseFormat = responseFormat;

    this.toolbox = toolbox;
  }

  onToolCall(callback: (toolCall: ChatCompletionMessageToolCall) => void) {
    this.onToolCallCallback = callback;
  }
  onToolCallResult(
    callback: (
      toolCall: ChatCompletionMessageToolCall,
      toolCallResult: any,
    ) => void,
  ) {
    this.onToolCallResultCallback = callback;
  }

  async chat(messages: ChatCompletionMessageParam[]) {
    const {
      toolbox,
      openai,
      generateSystemMessage,
      responseFormat,
      onToolCallCallback,
      onToolCallResultCallback,
      cnTwConverter,
    } = this;

    if (generateSystemMessage) {
      messages.unshift({
        role: "system",
        content: generateSystemMessage(),
      });
    }

    const toolCallCount = 0;
    const chatCompletionMessages = (
      await processChatCompletionMessages(
        toolCallCount,
        messages,
        openai,
        onToolCallCallback,
        onToolCallResultCallback,
        responseFormat,
        toolbox,
      )
    ).map((message) => {
      const { content: messageContent, role: messageRole } = message;

      const translatedContent =
        messageRole === "assistant" && typeof messageContent === "string"
          ? cnTwConverter(messageContent as string)
          : messageContent;

      return {
        message,
        content: translatedContent,
      };
    });

    return chatCompletionMessages;
  }
}
