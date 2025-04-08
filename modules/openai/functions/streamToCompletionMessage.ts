import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Stream } from "openai/streaming";

export async function streamToCompletionMessage(
  responseStream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
) {
  let fullMessage = "";
  const toolCallsObject: Record<
    number,
    { id: string; type: string; function: { name: string; arguments: string } }
  > = {};

  for await (const chunk of responseStream) {
    const delta = chunk.choices[0]?.delta;

    if (delta?.content) {
      fullMessage += delta.content;
    }

    if (delta?.tool_calls) {
      for (const call of delta.tool_calls) {
        const index = call.index;

        if (!toolCallsObject[index]) {
          toolCallsObject[index] = {
            id: call.id,
            type: call.type,
            function: {
              name: call.function.name,
              arguments: "",
            },
          };
        }

        if (call.function.arguments) {
          toolCallsObject[index].function.arguments += call.function.arguments;
        }
      }
    }
  }

  const toolCalls = Object.values(toolCallsObject);

  return {
    role: "assistant",
    content: fullMessage,
    tool_calls: toolCalls,
  } as ChatCompletionMessageParam;
}
