import { cloneDeep } from "lodash";
import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from "openai/resources";

import { OpenAI } from "modules/openai";
import { callFunction } from "modules/openai/functions/callFunction";
import { ToolBox } from "modules/openai/types/ToolBox";
import { ClientError } from "modules/nestjs/clientError";

export async function processChatCompletionMessages(
  toolCallCount: number,
  messages: ChatCompletionMessageParam[],
  openai: OpenAI["openai"],
  onToolCallCallback: OpenAI["onToolCallCallback"],
  onToolCallResultCallback: OpenAI["onToolCallResultCallback"],
  responseFormat?: OpenAI["responseFormat"],
  toolbox?: ToolBox,
) {
  const { toolsDefinitions, tools } = toolbox || {};

  const clonedMessages = cloneDeep(messages);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: clonedMessages,
    tools: toolsDefinitions && tools ? toolsDefinitions : undefined,
    response_format: responseFormat,
  });

  const assistantMessage = response.choices[0].message;
  clonedMessages.push(assistantMessage);

  if (!(toolsDefinitions && tools)) {
    return clonedMessages;
  }

  const { tool_calls: toolCalls } = assistantMessage as ChatCompletionMessage;

  if (toolCallCount > 10) {
    throw new ClientError({
      errorMessage: "Too many tool calls.",
    });
  }

  if (toolCalls?.length) {
    const newToolCallCount = toolCallCount + toolCalls.length;

    const functionCallResultMessages: ChatCompletionMessageParam[] = [];

    let toolCallIndex = 0;
    let skipOpenAiSummary = false;
    for (const toolCall of toolCalls) {
      if (onToolCallCallback) {
        onToolCallCallback(toolCall);
      }

      const functionCallResult = await callFunction(
        toolCall.function.name,
        JSON.parse(toolCall.function.arguments),
        tools,
      );

      if (
        functionCallResult.skipOpenAiSummary &&
        toolCallIndex === toolCalls.length - 1
      ) {
        skipOpenAiSummary = true;
      }

      if (onToolCallResultCallback) {
        onToolCallResultCallback(toolCall, functionCallResult);
      }

      const functionCallResultMessage: ChatCompletionMessageParam = {
        role: "tool",
        content: JSON.stringify(functionCallResult),
        tool_call_id: toolCall.id,
      };
      functionCallResultMessages.push(functionCallResultMessage);

      toolCallIndex += 1;
    }

    clonedMessages.push(...functionCallResultMessages);

    if (skipOpenAiSummary) {
      return clonedMessages;
    }

    return await processChatCompletionMessages(
      newToolCallCount,
      clonedMessages,
      openai,
      onToolCallCallback,
      onToolCallResultCallback,
      responseFormat,
      toolbox,
    );
  }

  return clonedMessages;
}
